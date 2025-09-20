import { BaseElement } from '../core/element.js';
import { Relationship } from '../core/relationship.js';
import { LayoutEngine, ElementPosition, LayoutResult } from './layout-engine.js';
import { ColorTheme } from './color-theme.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ViewOptions {
  viewId?: string;
  viewName?: string;
  viewType?: 'diagram' | 'folder';
  backgroundColor?: string;
  showGrid?: boolean;
  gridSize?: number;
  colorTheme?: ColorTheme;
}

export interface VisualElement {
  id: string;
  elementRef: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  lineColor: string;
  textColor: string;
}

export interface VisualConnection {
  id: string;
  relationshipRef: string;
  source: string;
  target: string;
  bendpoints?: { x: number; y: number }[];
  lineColor: string;
  lineWidth: number;
}

export class ViewXmlGenerator {
  private layoutEngine: LayoutEngine;
  private colorTheme: ColorTheme;

  constructor(colorTheme?: ColorTheme) {
    this.layoutEngine = new LayoutEngine();
    this.colorTheme = colorTheme || ColorTheme.createArchiMateTheme();
  }

  generateViewXml(
    elements: BaseElement[],
    relationships: Relationship[],
    options: ViewOptions = {}
  ): string {
    const viewId = options.viewId || `view-${Date.now()}`;
    const viewName = options.viewName || 'ArchiMate View';
    const viewType = options.viewType || 'diagram';

    // Generate layout positions for elements
    const layoutResult = this.layoutEngine.generateLayout(elements, relationships);

    // Create visual elements
    const visualElements = this.createVisualElements(elements, layoutResult);

    // Create visual connections
    const visualConnections = this.createVisualConnections(relationships, visualElements);

    // Load and populate template
    const template = this.loadViewTemplate();

    return template
      .replace(/{{VIEW_ID}}/g, viewId)
      .replace(/{{VIEW_NAME}}/g, this.escapeXml(viewName))
      .replace(/{{VIEW_TYPE}}/g, viewType)
      .replace(/{{BACKGROUND_COLOR}}/g, options.backgroundColor || '#FFFFFF')
      .replace(/{{VISUAL_ELEMENTS}}/g, this.generateVisualElementsXml(visualElements))
      .replace(/{{VISUAL_CONNECTIONS}}/g, this.generateVisualConnectionsXml(visualConnections))
      .replace(/{{GRID_SIZE}}/g, (options.gridSize || 20).toString())
      .replace(/{{SHOW_GRID}}/g, (options.showGrid !== false).toString());
  }

  private createVisualElements(elements: BaseElement[], layoutResult: LayoutResult): VisualElement[] {
    return elements.map((element) => {
      const position = layoutResult.elementPositions.get(element.id) || { x: 100, y: 100 };
      const dimensions = layoutResult.elementDimensions.get(element.id) || { width: 120, height: 55 };
      const colors = this.colorTheme.getColorsForElement(element.type);

      return {
        id: `visual-${element.id}`,
        elementRef: element.id,
        x: position.x,
        y: position.y,
        width: dimensions.width,
        height: dimensions.height,
        fillColor: colors.fillColor,
        lineColor: colors.lineColor,
        textColor: colors.textColor
      };
    });
  }

  private createVisualConnections(relationships: Relationship[], visualElements: VisualElement[]): VisualConnection[] {
    const elementMap = new Map<string, VisualElement>();
    visualElements.forEach(ve => elementMap.set(ve.elementRef, ve));

    return relationships.map(relationship => {
      const sourceVisual = elementMap.get(relationship.source);
      const targetVisual = elementMap.get(relationship.target);

      if (!sourceVisual || !targetVisual) {
        throw new Error(`Missing visual elements for relationship ${relationship.id}`);
      }

      return {
        id: `connection-${relationship.id}`,
        relationshipRef: relationship.id,
        source: sourceVisual.id,
        target: targetVisual.id,
        lineColor: '#000000',
        lineWidth: 1,
        bendpoints: this.calculateBendpoints(sourceVisual, targetVisual)
      };
    });
  }

  private calculateBendpoints(source: VisualElement, target: VisualElement): { x: number; y: number }[] | undefined {
    // Simple direct connection for now
    // Could be enhanced with sophisticated routing algorithms
    const sourceCenter = {
      x: source.x + source.width / 2,
      y: source.y + source.height / 2
    };
    const targetCenter = {
      x: target.x + target.width / 2,
      y: target.y + target.height / 2
    };

    // Add a bendpoint if the connection would be too long or cross other elements
    const distance = Math.sqrt(
      Math.pow(targetCenter.x - sourceCenter.x, 2) +
      Math.pow(targetCenter.y - sourceCenter.y, 2)
    );

    if (distance > 200) {
      // Add midpoint for longer connections
      return [{
        x: (sourceCenter.x + targetCenter.x) / 2,
        y: (sourceCenter.y + targetCenter.y) / 2
      }];
    }

    return undefined; // Direct connection
  }

  private generateVisualElementsXml(visualElements: VisualElement[]): string {
    const template = this.loadVisualElementTemplate();

    return visualElements.map(ve => {
      return template
        .replace(/{{VISUAL_ID}}/g, ve.id)
        .replace(/{{ELEMENT_REF}}/g, ve.elementRef)
        .replace(/{{X_POSITION}}/g, ve.x.toString())
        .replace(/{{Y_POSITION}}/g, ve.y.toString())
        .replace(/{{WIDTH}}/g, ve.width.toString())
        .replace(/{{HEIGHT}}/g, ve.height.toString())
        .replace(/{{FILL_COLOR}}/g, ve.fillColor)
        .replace(/{{LINE_COLOR}}/g, ve.lineColor)
        .replace(/{{TEXT_COLOR}}/g, ve.textColor);
    }).join('\n    ');
  }

  private generateVisualConnectionsXml(visualConnections: VisualConnection[]): string {
    const template = this.loadVisualConnectionTemplate();

    return visualConnections.map(vc => {
      const bendpointsXml = vc.bendpoints
        ? vc.bendpoints.map(bp => `        <archimate:bendpoint x="${bp.x}" y="${bp.y}"/>`).join('\n')
        : '';

      return template
        .replace(/{{CONNECTION_ID}}/g, vc.id)
        .replace(/{{RELATIONSHIP_REF}}/g, vc.relationshipRef)
        .replace(/{{SOURCE_VISUAL}}/g, vc.source)
        .replace(/{{TARGET_VISUAL}}/g, vc.target)
        .replace(/{{LINE_COLOR}}/g, vc.lineColor)
        .replace(/{{LINE_WIDTH}}/g, vc.lineWidth.toString())
        .replace(/{{BENDPOINTS}}/g, bendpointsXml);
    }).join('\n    ');
  }

  private loadViewTemplate(): string {
    try {
      const templatePath = path.join(__dirname, 'templates', 'view-template.xml');
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to load view template: ${error}`);
    }
  }

  private loadVisualElementTemplate(): string {
    try {
      const templatePath = path.join(__dirname, 'templates', 'visual-element-template.xml');
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to load visual element template: ${error}`);
    }
  }

  private loadVisualConnectionTemplate(): string {
    try {
      const templatePath = path.join(__dirname, 'templates', 'visual-connection-template.xml');
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to load visual connection template: ${error}`);
    }
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  setColorTheme(colorTheme: ColorTheme): void {
    this.colorTheme = colorTheme;
  }

  setLayoutEngine(layoutEngine: LayoutEngine): void {
    this.layoutEngine = layoutEngine;
  }

  generateViewStatistics(elements: BaseElement[], relationships: Relationship[]): {
    elementCount: number;
    relationshipCount: number;
    layerDistribution: Record<string, number>;
    estimatedDimensions: { width: number; height: number };
  } {
    const layoutResult = this.layoutEngine.generateLayout(elements, relationships);
    const stats = this.layoutEngine.getLayoutStatistics(layoutResult);

    const layerDistribution: Record<string, number> = {};
    elements.forEach(element => {
      const layer = element.layer;
      layerDistribution[layer] = (layerDistribution[layer] || 0) + 1;
    });

    return {
      elementCount: elements.length,
      relationshipCount: relationships.length,
      layerDistribution,
      estimatedDimensions: {
        width: layoutResult.viewportSize.width,
        height: layoutResult.viewportSize.height
      }
    };
  }
}
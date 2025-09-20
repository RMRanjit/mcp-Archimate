import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { BaseElement } from '../core/element.js';
import { Layer } from '../models/archimate.js';

export interface ElementGenerationOptions {
  includeDocumentation?: boolean;
  documentationTemplate?: string;
  groupByLayer?: boolean;
}

export class ElementXmlGenerator {
  private templatePath: string;

  constructor() {
    // ES module compatible way to get current directory
    const currentFileUrl = import.meta.url;
    const currentFilePath = fileURLToPath(currentFileUrl);
    const currentDir = dirname(currentFilePath);
    this.templatePath = join(currentDir, 'templates');
  }

  /**
   * Generate XML for a single element
   */
  generateElement(element: BaseElement, options: ElementGenerationOptions = {}): string {
    const template = this.loadTemplate('element-template.xml');

    const documentation = this.generateDocumentation(element, options);

    return template
      .replace('{{ELEMENT_TYPE}}', element.type)
      .replace('{{ELEMENT_NAME}}', this.escapeXml(element.name))
      .replace('{{ELEMENT_ID}}', this.escapeXml(element.id))
      .replace('{{ELEMENT_DOCUMENTATION}}', this.escapeXml(documentation));
  }

  /**
   * Generate XML for multiple elements with optional grouping
   */
  generateElements(elements: BaseElement[], options: ElementGenerationOptions = {}): string {
    if (elements.length === 0) return '';

    let result = '';

    if (options.groupByLayer) {
      result += this.generateElementsGroupedByLayer(elements, options);
    } else {
      result += '\n  <!-- ELEMENTS -->\n';
      for (const element of elements) {
        result += this.generateElement(element, options) + '\n';
      }
    }

    return result;
  }

  /**
   * Generate elements grouped by ArchiMate layer
   */
  private generateElementsGroupedByLayer(
    elements: BaseElement[],
    options: ElementGenerationOptions
  ): string {
    const elementsByLayer = this.groupElementsByLayer(elements);

    let result = '\n  <!-- ELEMENTS -->\n';

    // Define layer order for consistent output
    const layerOrder = [
      Layer.MOTIVATION,
      Layer.STRATEGY,
      Layer.BUSINESS,
      Layer.APPLICATION,
      Layer.TECHNOLOGY,
      Layer.PHYSICAL,
      Layer.IMPLEMENTATION
    ];

    for (const layer of layerOrder) {
      const layerElements = elementsByLayer.get(layer);
      if (layerElements && layerElements.length > 0) {
        result += `\n  <!-- ${layer.toUpperCase()} LAYER ELEMENTS -->\n`;

        // Sort elements within layer by type for consistency
        layerElements.sort((a, b) => a.type.localeCompare(b.type));

        for (const element of layerElements) {
          result += this.generateElement(element, options) + '\n';
        }
      }
    }

    return result;
  }

  /**
   * Group elements by their ArchiMate layer
   */
  private groupElementsByLayer(elements: BaseElement[]): Map<Layer, BaseElement[]> {
    const grouped = new Map<Layer, BaseElement[]>();

    for (const element of elements) {
      const layer = element.layer;
      if (!grouped.has(layer)) {
        grouped.set(layer, []);
      }
      grouped.get(layer)!.push(element);
    }

    return grouped;
  }

  /**
   * Generate appropriate documentation for an element
   */
  private generateDocumentation(
    element: BaseElement,
    options: ElementGenerationOptions
  ): string {
    if (!options.includeDocumentation) {
      return `${element.type} element: ${element.name}`;
    }

    if (options.documentationTemplate) {
      return options.documentationTemplate
        .replace('{{ELEMENT_TYPE}}', element.type)
        .replace('{{ELEMENT_NAME}}', element.name)
        .replace('{{ELEMENT_LAYER}}', element.layer);
    }

    // Generate contextual documentation based on element type
    return this.generateContextualDocumentation(element);
  }

  /**
   * Generate context-aware documentation based on element type and layer
   */
  private generateContextualDocumentation(element: BaseElement): string {
    const layerDescriptions = {
      [Layer.MOTIVATION]: 'represents the context or change drivers for the enterprise',
      [Layer.STRATEGY]: 'represents the strategic direction and choices of the enterprise',
      [Layer.BUSINESS]: 'represents business processes, functions, events, and actors',
      [Layer.APPLICATION]: 'represents application components, services, and interfaces',
      [Layer.TECHNOLOGY]: 'represents technology infrastructure and platforms',
      [Layer.PHYSICAL]: 'represents physical elements like equipment and facilities',
      [Layer.IMPLEMENTATION]: 'represents implementation and migration planning elements'
    };

    const layerDesc = layerDescriptions[element.layer] || 'represents an enterprise architecture element';

    return `${element.type} '${element.name}' ${layerDesc} in the ${element.layer} layer`;
  }

  /**
   * Get statistics about elements for reporting
   */
  getElementStatistics(elements: BaseElement[]): {
    totalElements: number;
    elementsByLayer: Map<Layer, number>;
    elementsByType: Map<string, number>;
  } {
    const elementsByLayer = new Map<Layer, number>();
    const elementsByType = new Map<string, number>();

    for (const element of elements) {
      // Count by layer
      const layerCount = elementsByLayer.get(element.layer) || 0;
      elementsByLayer.set(element.layer, layerCount + 1);

      // Count by type
      const typeCount = elementsByType.get(element.type) || 0;
      elementsByType.set(element.type, typeCount + 1);
    }

    return {
      totalElements: elements.length,
      elementsByLayer,
      elementsByType
    };
  }

  private loadTemplate(templateName: string): string {
    try {
      const templatePath = join(this.templatePath, templateName);
      return readFileSync(templatePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to load template ${templateName}: ${error}`);
    }
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
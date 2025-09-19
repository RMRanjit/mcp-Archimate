import { BaseElement } from '../core/element.js';
import { Relationship } from '../core/relationship.js';
import { Layer } from '../models/archimate.js';

export interface Position {
  x: number;
  y: number;
}

export interface ElementDimensions {
  width: number;
  height: number;
}

export interface LayoutConfiguration {
  gridSpacing: number;
  layerVerticalSpacing: number;
  elementSpacing: number;
  defaultElementSize: ElementDimensions;
  layerOrder: Layer[];
  viewportPadding: number;
}

export interface LayoutResult {
  elementPositions: Map<string, Position>;
  elementDimensions: Map<string, ElementDimensions>;
  viewportSize: { width: number; height: number };
}

export class LayoutEngine {
  private config: LayoutConfiguration;

  constructor(config: Partial<LayoutConfiguration> = {}) {
    this.config = {
      gridSpacing: 20,
      layerVerticalSpacing: 120,
      elementSpacing: 180,
      defaultElementSize: { width: 120, height: 55 },
      layerOrder: [
        Layer.MOTIVATION,
        Layer.STRATEGY,
        Layer.BUSINESS,
        Layer.APPLICATION,
        Layer.TECHNOLOGY,
        Layer.PHYSICAL,
        Layer.IMPLEMENTATION
      ],
      viewportPadding: 60,
      ...config
    };
  }

  /**
   * Generate automatic layout for elements using layer-based horizontal arrangement
   */
  generateLayout(elements: BaseElement[], relationships: Relationship[]): LayoutResult {
    const elementsByLayer = this.groupElementsByLayer(elements);
    const elementPositions = new Map<string, Position>();
    const elementDimensions = new Map<string, ElementDimensions>();

    let currentY = this.config.viewportPadding;
    let maxWidth = 0;

    // Layout elements layer by layer
    for (const layer of this.config.layerOrder) {
      const layerElements = elementsByLayer.get(layer) || [];
      if (layerElements.length === 0) continue;

      // Calculate positions for this layer
      const layerLayout = this.layoutLayer(layerElements, currentY);

      // Add to results
      for (const [elementId, position] of layerLayout.positions) {
        elementPositions.set(elementId, position);
      }

      for (const [elementId, dimensions] of layerLayout.dimensions) {
        elementDimensions.set(elementId, dimensions);
      }

      // Update for next layer
      currentY = layerLayout.nextY;
      maxWidth = Math.max(maxWidth, layerLayout.maxX);
    }

    return {
      elementPositions,
      elementDimensions,
      viewportSize: {
        width: maxWidth + this.config.viewportPadding,
        height: currentY + this.config.viewportPadding
      }
    };
  }

  /**
   * Generate layout for elements with relationship-aware positioning
   */
  generateRelationshipAwareLayout(
    elements: BaseElement[],
    relationships: Relationship[]
  ): LayoutResult {
    // Start with basic layer layout
    const basicLayout = this.generateLayout(elements, relationships);

    // Analyze relationships to optimize positioning
    const connectionMap = this.buildConnectionMap(relationships);
    const optimizedPositions = this.optimizeForConnections(
      basicLayout.elementPositions,
      connectionMap,
      basicLayout.elementDimensions
    );

    return {
      ...basicLayout,
      elementPositions: optimizedPositions
    };
  }

  /**
   * Layout elements within a single layer horizontally
   */
  private layoutLayer(elements: BaseElement[], startY: number): {
    positions: Map<string, Position>;
    dimensions: Map<string, ElementDimensions>;
    nextY: number;
    maxX: number;
  } {
    const positions = new Map<string, Position>();
    const dimensions = new Map<string, ElementDimensions>();

    let currentX = this.config.viewportPadding;
    let maxHeight = 0;

    // Sort elements for consistent positioning
    const sortedElements = [...elements].sort((a, b) => a.type.localeCompare(b.type));

    for (const element of sortedElements) {
      const elementDims = this.getElementDimensions(element);

      positions.set(element.id, { x: currentX, y: startY });
      dimensions.set(element.id, elementDims);

      currentX += elementDims.width + this.config.elementSpacing;
      maxHeight = Math.max(maxHeight, elementDims.height);
    }

    return {
      positions,
      dimensions,
      nextY: startY + maxHeight + this.config.layerVerticalSpacing,
      maxX: currentX - this.config.elementSpacing
    };
  }

  /**
   * Get appropriate dimensions for an element based on its type
   */
  private getElementDimensions(element: BaseElement): ElementDimensions {
    // Adjust size based on element type and name length
    const baseSize = { ...this.config.defaultElementSize };

    // Longer names need wider elements
    const nameLength = element.name.length;
    if (nameLength > 15) {
      baseSize.width = Math.max(baseSize.width, nameLength * 8);
    }

    // Some element types might need specific sizing
    const typeAdjustments: Partial<Record<string, ElementDimensions>> = {
      // Business layer elements might be slightly larger
      'BusinessActor': { width: 140, height: 60 },
      'BusinessProcess': { width: 160, height: 60 },

      // Application components might be larger
      'ApplicationComponent': { width: 150, height: 70 },
      'ApplicationService': { width: 140, height: 60 },

      // Data objects might be smaller
      'DataObject': { width: 100, height: 50 },

      // Technology elements might vary
      'Node': { width: 130, height: 65 },
      'Device': { width: 120, height: 55 }
    };

    const typeAdjustment = typeAdjustments[element.type];
    if (typeAdjustment) {
      return {
        width: Math.max(baseSize.width, typeAdjustment.width),
        height: Math.max(baseSize.height, typeAdjustment.height)
      };
    }

    return baseSize;
  }

  /**
   * Group elements by their ArchiMate layer
   */
  private groupElementsByLayer(elements: BaseElement[]): Map<Layer, BaseElement[]> {
    const grouped = new Map<Layer, BaseElement[]>();

    for (const element of elements) {
      if (!grouped.has(element.layer)) {
        grouped.set(element.layer, []);
      }
      grouped.get(element.layer)!.push(element);
    }

    return grouped;
  }

  /**
   * Build a map of element connections for layout optimization
   */
  private buildConnectionMap(relationships: Relationship[]): Map<string, Set<string>> {
    const connections = new Map<string, Set<string>>();

    for (const rel of relationships) {
      // Add bidirectional connections for layout purposes
      if (!connections.has(rel.source)) {
        connections.set(rel.source, new Set());
      }
      if (!connections.has(rel.target)) {
        connections.set(rel.target, new Set());
      }

      connections.get(rel.source)!.add(rel.target);
      connections.get(rel.target)!.add(rel.source);
    }

    return connections;
  }

  /**
   * Optimize element positions to minimize connection crossings
   */
  private optimizeForConnections(
    positions: Map<string, Position>,
    connections: Map<string, Set<string>>,
    dimensions: Map<string, ElementDimensions>
  ): Map<string, Position> {
    // For now, return original positions
    // In a more sophisticated implementation, we could use algorithms like:
    // - Force-directed layout
    // - Simulated annealing
    // - Genetic algorithms
    // to minimize connection lengths and crossings

    return new Map(positions);
  }

  /**
   * Calculate the center point of an element given its position and dimensions
   */
  getElementCenter(elementId: string, layout: LayoutResult): Position | null {
    const position = layout.elementPositions.get(elementId);
    const dimensions = layout.elementDimensions.get(elementId);

    if (!position || !dimensions) {
      return null;
    }

    return {
      x: position.x + dimensions.width / 2,
      y: position.y + dimensions.height / 2
    };
  }

  /**
   * Get layout statistics for analysis
   */
  getLayoutStatistics(layout: LayoutResult): {
    totalElements: number;
    averageSpacing: number;
    densityRatio: number;
    viewportUtilization: number;
  } {
    const totalElements = layout.elementPositions.size;

    // Calculate average spacing between adjacent elements
    const positions = Array.from(layout.elementPositions.values());
    positions.sort((a, b) => a.x - b.x);

    let totalSpacing = 0;
    let spacingCount = 0;

    for (let i = 1; i < positions.length; i++) {
      if (Math.abs(positions[i].y - positions[i-1].y) < this.config.layerVerticalSpacing / 2) {
        totalSpacing += positions[i].x - positions[i-1].x;
        spacingCount++;
      }
    }

    const averageSpacing = spacingCount > 0 ? totalSpacing / spacingCount : 0;

    // Calculate viewport utilization
    const totalElementArea = Array.from(layout.elementDimensions.values())
      .reduce((sum, dim) => sum + (dim.width * dim.height), 0);

    const viewportArea = layout.viewportSize.width * layout.viewportSize.height;
    const viewportUtilization = totalElementArea / viewportArea;

    return {
      totalElements,
      averageSpacing,
      densityRatio: totalElements / viewportArea * 10000, // Elements per 10000 square pixels
      viewportUtilization
    };
  }
}
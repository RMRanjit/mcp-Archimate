import { BaseElement } from '../core/element.js';
import { Relationship } from '../core/relationship.js';
import { ModelXmlGenerator, ModelExportOptions } from './model-xml-generator.js';
import { ElementXmlGenerator, ElementGenerationOptions } from './element-xml-generator.js';
import { RelationshipXmlGenerator, RelationshipGenerationOptions } from './relationship-xml-generator.js';
import { ViewXmlGenerator, ViewOptions } from './view-xml-generator.js';
import { ColorTheme } from './color-theme.js';
import { LayoutEngine, LayoutConfiguration } from './layout-engine.js';

/**
 * Comprehensive export options for XML generation
 */
export interface XmlExportOptions {
  // Model-level options
  modelId?: string;
  modelName?: string;
  modelPurpose?: string;

  // Element generation options
  elementOptions?: ElementGenerationOptions;

  // Relationship generation options
  relationshipOptions?: RelationshipGenerationOptions;

  // View generation options
  includeViews?: boolean;
  viewOptions?: ViewOptions;

  // Visual styling options
  colorTheme?: ColorTheme | 'archimate' | 'monochrome' | 'high-contrast';
  layoutConfiguration?: Partial<LayoutConfiguration>;

  // Validation and quality options
  validateModel?: boolean;
  strictValidation?: boolean;
  includeStatistics?: boolean;
}

/**
 * Export result containing generated XML and metadata
 */
export interface XmlExportResult {
  xml: string;
  statistics?: {
    elements: {
      total: number;
      byLayer: Record<string, number>;
      byType: Record<string, number>;
    };
    relationships: {
      total: number;
      byType: Record<string, number>;
      uniqueElements: number;
    };
    views?: {
      elementCount: number;
      relationshipCount: number;
      estimatedDimensions: { width: number; height: number };
    };
  };
  warnings?: string[];
  errors?: string[];
}

/**
 * Main orchestrator class for ArchiMate XML export
 *
 * Coordinates all XML generation components to produce complete ArchiMate Open Exchange format files.
 * Handles the complete workflow: model creation → element generation → relationship generation → view generation
 */
export class XmlExporter {
  private modelGenerator: ModelXmlGenerator;
  private elementGenerator: ElementXmlGenerator;
  private relationshipGenerator: RelationshipXmlGenerator;
  private viewGenerator: ViewXmlGenerator;
  private colorTheme: ColorTheme;
  private layoutEngine: LayoutEngine;

  /**
   * Create a new XmlExporter instance
   * @param colorTheme - Optional color theme for visual elements
   * @param layoutConfig - Optional layout configuration
   */
  constructor(
    colorTheme?: ColorTheme,
    layoutConfig?: Partial<LayoutConfiguration>
  ) {
    this.modelGenerator = new ModelXmlGenerator();
    this.elementGenerator = new ElementXmlGenerator();
    this.relationshipGenerator = new RelationshipXmlGenerator();

    // Initialize color theme
    this.colorTheme = colorTheme || ColorTheme.createArchiMateTheme();

    // Initialize layout engine
    this.layoutEngine = new LayoutEngine(layoutConfig);

    // Initialize view generator with theme and layout engine
    this.viewGenerator = new ViewXmlGenerator(this.colorTheme);
    this.viewGenerator.setLayoutEngine(this.layoutEngine);
  }

  /**
   * Export a complete ArchiMate model to XML format
   *
   * @param elements - Array of ArchiMate elements to include in the model
   * @param relationships - Array of relationships between elements
   * @param options - Export configuration options
   * @returns Complete XML export result with metadata
   */
  async exportModel(
    elements: BaseElement[],
    relationships: Relationship[],
    options: XmlExportOptions = {}
  ): Promise<XmlExportResult> {
    const result: XmlExportResult = {
      xml: '',
      warnings: [],
      errors: []
    };

    try {
      // Step 1: Validate inputs if requested
      if (options.validateModel) {
        const validationResult = this.validateModelInputs(elements, relationships, options.strictValidation);
        result.warnings = validationResult.warnings;
        result.errors = validationResult.errors;

        if (result.errors.length > 0 && options.strictValidation) {
          throw new Error(`Model validation failed: ${result.errors.join(', ')}`);
        }
      }

      // Step 2: Setup themes and layout
      this.configureVisualization(options);

      // Step 3: Generate XML using the ModelXmlGenerator as the orchestrator
      const modelOptions = this.buildModelOptions(options);
      result.xml = this.modelGenerator.generate(elements, relationships, modelOptions);

      // Step 4: Collect statistics if requested
      if (options.includeStatistics) {
        result.statistics = this.collectStatistics(elements, relationships, options);
      }

      return result;

    } catch (error) {
      result.errors = result.errors || [];
      result.errors.push(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Export elements only (without full model structure)
   *
   * @param elements - Elements to export
   * @param options - Element generation options
   * @returns XML string containing only element definitions
   */
  exportElementsOnly(
    elements: BaseElement[],
    options: ElementGenerationOptions = {}
  ): string {
    return this.elementGenerator.generateElements(elements, {
      groupByLayer: true,
      includeDocumentation: true,
      ...options
    });
  }

  /**
   * Export relationships only (without full model structure)
   *
   * @param relationships - Relationships to export
   * @param elements - Optional elements for validation and naming
   * @param options - Relationship generation options
   * @returns XML string containing only relationship definitions
   */
  exportRelationshipsOnly(
    relationships: Relationship[],
    elements?: BaseElement[],
    options: RelationshipGenerationOptions = {}
  ): string {
    return this.relationshipGenerator.generateRelationships(relationships, {
      groupByType: true,
      validateReferences: true,
      includeNames: false,
      ...options
    }, elements);
  }

  /**
   * Export views only (without full model structure)
   *
   * @param elements - Elements to include in view
   * @param relationships - Relationships to visualize
   * @param options - View generation options
   * @returns XML string containing view definitions
   */
  exportViewsOnly(
    elements: BaseElement[],
    relationships: Relationship[],
    options: ViewOptions = {}
  ): string {
    return this.viewGenerator.generateViewXml(elements, relationships, {
      viewName: 'Exported View',
      showGrid: true,
      colorTheme: this.colorTheme,
      ...options
    });
  }

  /**
   * Set a new color theme for visual generation
   */
  setColorTheme(theme: ColorTheme | 'archimate' | 'monochrome' | 'high-contrast'): void {
    if (typeof theme === 'string') {
      switch (theme) {
        case 'archimate':
          this.colorTheme = ColorTheme.createArchiMateTheme();
          break;
        case 'monochrome':
          this.colorTheme = ColorTheme.createMonochromeTheme();
          break;
        case 'high-contrast':
          this.colorTheme = ColorTheme.createHighContrastTheme();
          break;
        default:
          throw new Error(`Unknown color theme: ${theme}`);
      }
    } else {
      this.colorTheme = theme;
    }

    this.viewGenerator.setColorTheme(this.colorTheme);
  }

  /**
   * Update layout configuration
   */
  setLayoutConfiguration(config: Partial<LayoutConfiguration>): void {
    this.layoutEngine = new LayoutEngine(config);
    this.viewGenerator.setLayoutEngine(this.layoutEngine);
  }

  /**
   * Get export statistics for a model without generating XML
   */
  getModelStatistics(
    elements: BaseElement[],
    relationships: Relationship[]
  ): XmlExportResult['statistics'] {
    return this.collectStatistics(elements, relationships, { includeStatistics: true });
  }

  /**
   * Validate model inputs and return validation results
   */
  private validateModelInputs(
    elements: BaseElement[],
    relationships: Relationship[],
    strict: boolean = false
  ): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for empty model
    if (elements.length === 0) {
      (strict ? errors : warnings).push('Model contains no elements');
    }

    // Check for orphaned relationships
    const orphanedRelationships = this.relationshipGenerator.findOrphanedRelationships(relationships, elements);
    if (orphanedRelationships.length > 0) {
      const message = `Found ${orphanedRelationships.length} orphaned relationships: ${orphanedRelationships.join(', ')}`;
      (strict ? errors : warnings).push(message);
    }

    // Check for duplicate element IDs
    const elementIds = new Set<string>();
    const duplicateIds: string[] = [];
    for (const element of elements) {
      if (elementIds.has(element.id)) {
        duplicateIds.push(element.id);
      } else {
        elementIds.add(element.id);
      }
    }
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate element IDs found: ${duplicateIds.join(', ')}`);
    }

    // Check for duplicate relationship IDs
    const relationshipIds = new Set<string>();
    const duplicateRelIds: string[] = [];
    for (const relationship of relationships) {
      if (relationshipIds.has(relationship.id)) {
        duplicateRelIds.push(relationship.id);
      } else {
        relationshipIds.add(relationship.id);
      }
    }
    if (duplicateRelIds.length > 0) {
      errors.push(`Duplicate relationship IDs found: ${duplicateRelIds.join(', ')}`);
    }

    // Check for elements without names
    const unnamedElements = elements.filter(e => !e.name || e.name.trim() === '');
    if (unnamedElements.length > 0) {
      warnings.push(`Found ${unnamedElements.length} elements without names`);
    }

    return { warnings, errors };
  }

  /**
   * Configure visualization components based on options
   */
  private configureVisualization(options: XmlExportOptions): void {
    // Configure color theme
    if (options.colorTheme) {
      this.setColorTheme(options.colorTheme);
    }

    // Configure layout
    if (options.layoutConfiguration) {
      this.setLayoutConfiguration(options.layoutConfiguration);
    }
  }

  /**
   * Build model options from export options
   */
  private buildModelOptions(options: XmlExportOptions): ModelExportOptions {
    return {
      modelId: options.modelId,
      modelName: options.modelName,
      modelPurpose: options.modelPurpose,
      includeViews: options.includeViews !== false, // Default to true
      viewName: options.viewOptions?.viewName,
      viewDocumentation: options.viewOptions?.viewName ? `Generated view: ${options.viewOptions.viewName}` : undefined
    };
  }

  /**
   * Collect comprehensive statistics about the model
   */
  private collectStatistics(
    elements: BaseElement[],
    relationships: Relationship[],
    options: XmlExportOptions
  ): XmlExportResult['statistics'] {
    // Element statistics
    const elementStats = this.elementGenerator.getElementStatistics(elements);

    // Relationship statistics
    const relationshipStats = this.relationshipGenerator.getRelationshipStatistics(relationships);

    // View statistics (if views are included)
    let viewStats;
    if (options.includeViews) {
      viewStats = this.viewGenerator.generateViewStatistics(elements, relationships);
    }

    return {
      elements: {
        total: elementStats.totalElements,
        byLayer: Object.fromEntries(elementStats.elementsByLayer),
        byType: Object.fromEntries(elementStats.elementsByType)
      },
      relationships: {
        total: relationshipStats.totalRelationships,
        byType: Object.fromEntries(relationshipStats.relationshipsByType),
        uniqueElements: relationshipStats.uniqueElements.size
      },
      views: viewStats
    };
  }
}

/**
 * Convenience function to create a new XmlExporter with default settings
 */
export function createXmlExporter(options?: {
  colorTheme?: ColorTheme | 'archimate' | 'monochrome' | 'high-contrast';
  layoutConfig?: Partial<LayoutConfiguration>;
}): XmlExporter {
  const colorTheme = options?.colorTheme
    ? (typeof options.colorTheme === 'string'
       ? ColorTheme.createArchiMateTheme()
       : options.colorTheme)
    : undefined;

  return new XmlExporter(colorTheme, options?.layoutConfig);
}

/**
 * Convenience function for quick XML export with minimal configuration
 */
export async function exportToXml(
  elements: BaseElement[],
  relationships: Relationship[],
  options: XmlExportOptions = {}
): Promise<string> {
  const exporter = createXmlExporter();
  const result = await exporter.exportModel(elements, relationships, options);

  if (result.errors && result.errors.length > 0) {
    throw new Error(`Export failed: ${result.errors.join(', ')}`);
  }

  return result.xml;
}
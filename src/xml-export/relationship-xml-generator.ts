import { readFileSync } from 'fs';
import { join } from 'path';
import { Relationship } from '../core/relationship.js';
import { RelationshipType } from '../models/archimate.js';
import { BaseElement } from '../core/element.js';

export interface RelationshipGenerationOptions {
  includeNames?: boolean;
  validateReferences?: boolean;
  groupByType?: boolean;
  includeDocumentation?: boolean;
}

export class RelationshipXmlGenerator {
  private templatePath: string;

  constructor() {
    this.templatePath = join(__dirname, 'templates');
  }

  /**
   * Generate XML for a single relationship
   */
  generateRelationship(
    relationship: Relationship,
    options: RelationshipGenerationOptions = {},
    elements?: BaseElement[]
  ): string {
    const template = this.loadTemplate('relationship-template.xml');

    // Validate references if requested and elements provided
    if (options.validateReferences && elements) {
      this.validateRelationshipReferences(relationship, elements);
    }

    const relationshipName = this.generateRelationshipName(relationship, options, elements);

    return template
      .replace('{{RELATIONSHIP_TYPE}}', relationship.type)
      .replace('{{RELATIONSHIP_NAME}}', this.escapeXml(relationshipName))
      .replace('{{RELATIONSHIP_ID}}', this.escapeXml(relationship.id))
      .replace('{{SOURCE_ID}}', this.escapeXml(relationship.source))
      .replace('{{TARGET_ID}}', this.escapeXml(relationship.target));
  }

  /**
   * Generate XML for multiple relationships
   */
  generateRelationships(
    relationships: Relationship[],
    options: RelationshipGenerationOptions = {},
    elements?: BaseElement[]
  ): string {
    if (relationships.length === 0) return '';

    let result = '';

    if (options.groupByType) {
      result += this.generateRelationshipsGroupedByType(relationships, options, elements);
    } else {
      result += '\n  <!-- RELATIONSHIPS -->\n';
      for (const relationship of relationships) {
        result += this.generateRelationship(relationship, options, elements) + '\n';
      }
    }

    return result;
  }

  /**
   * Generate relationships grouped by relationship type
   */
  private generateRelationshipsGroupedByType(
    relationships: Relationship[],
    options: RelationshipGenerationOptions,
    elements?: BaseElement[]
  ): string {
    const relationshipsByType = this.groupRelationshipsByType(relationships);

    let result = '\n  <!-- RELATIONSHIPS -->\n';

    // Define relationship type order for consistent output
    const typeOrder = [
      RelationshipType.COMPOSITION,
      RelationshipType.AGGREGATION,
      RelationshipType.ASSIGNMENT,
      RelationshipType.REALIZATION,
      RelationshipType.SERVING,
      RelationshipType.ACCESS,
      RelationshipType.INFLUENCE,
      RelationshipType.TRIGGERING,
      RelationshipType.FLOW,
      RelationshipType.SPECIALIZATION,
      RelationshipType.ASSOCIATION,
      RelationshipType.JUNCTION
    ];

    for (const type of typeOrder) {
      const typeRelationships = relationshipsByType.get(type);
      if (typeRelationships && typeRelationships.length > 0) {
        result += `\n  <!-- ${type.toUpperCase()} RELATIONSHIPS -->\n`;

        for (const relationship of typeRelationships) {
          result += this.generateRelationship(relationship, options, elements) + '\n';
        }
      }
    }

    return result;
  }

  /**
   * Group relationships by their type
   */
  private groupRelationshipsByType(relationships: Relationship[]): Map<RelationshipType, Relationship[]> {
    const grouped = new Map<RelationshipType, Relationship[]>();

    for (const relationship of relationships) {
      const type = relationship.type;
      if (!grouped.has(type)) {
        grouped.set(type, []);
      }
      grouped.get(type)!.push(relationship);
    }

    return grouped;
  }

  /**
   * Generate appropriate name for a relationship
   */
  private generateRelationshipName(
    relationship: Relationship,
    options: RelationshipGenerationOptions,
    elements?: BaseElement[]
  ): string {
    // Most ArchiMate relationships don't have names in the XML, so return empty by default
    if (!options.includeNames) {
      return '';
    }

    // If we have element context, create a descriptive name
    if (elements) {
      const sourceElement = elements.find(e => e.id === relationship.source);
      const targetElement = elements.find(e => e.id === relationship.target);

      if (sourceElement && targetElement) {
        return `${sourceElement.name} ${this.getRelationshipVerb(relationship.type)} ${targetElement.name}`;
      }
    }

    // Fallback to a generic name based on type
    return `${relationship.type} relationship`;
  }

  /**
   * Get appropriate verb for relationship type in natural language
   */
  private getRelationshipVerb(type: RelationshipType): string {
    const verbs = {
      [RelationshipType.COMPOSITION]: 'composes',
      [RelationshipType.AGGREGATION]: 'aggregates',
      [RelationshipType.ASSIGNMENT]: 'is assigned to',
      [RelationshipType.REALIZATION]: 'realizes',
      [RelationshipType.SERVING]: 'serves',
      [RelationshipType.ACCESS]: 'accesses',
      [RelationshipType.INFLUENCE]: 'influences',
      [RelationshipType.TRIGGERING]: 'triggers',
      [RelationshipType.FLOW]: 'flows to',
      [RelationshipType.SPECIALIZATION]: 'specializes',
      [RelationshipType.ASSOCIATION]: 'associates with',
      [RelationshipType.JUNCTION]: 'joins with'
    };

    return verbs[type] || 'relates to';
  }

  /**
   * Validate that relationship references exist in the element set
   */
  private validateRelationshipReferences(relationship: Relationship, elements: BaseElement[]): void {
    const elementIds = new Set(elements.map(e => e.id));

    if (!elementIds.has(relationship.source)) {
      throw new Error(
        `Relationship ${relationship.id} references non-existent source element: ${relationship.source}`
      );
    }

    if (!elementIds.has(relationship.target)) {
      throw new Error(
        `Relationship ${relationship.id} references non-existent target element: ${relationship.target}`
      );
    }
  }

  /**
   * Get statistics about relationships for reporting
   */
  getRelationshipStatistics(relationships: Relationship[]): {
    totalRelationships: number;
    relationshipsByType: Map<RelationshipType, number>;
    uniqueElements: Set<string>;
    orphanedReferences?: string[];
  } {
    const relationshipsByType = new Map<RelationshipType, number>();
    const uniqueElements = new Set<string>();

    for (const relationship of relationships) {
      // Count by type
      const typeCount = relationshipsByType.get(relationship.type) || 0;
      relationshipsByType.set(relationship.type, typeCount + 1);

      // Collect unique element references
      uniqueElements.add(relationship.source);
      uniqueElements.add(relationship.target);
    }

    return {
      totalRelationships: relationships.length,
      relationshipsByType,
      uniqueElements
    };
  }

  /**
   * Find orphaned relationships (relationships that reference non-existent elements)
   */
  findOrphanedRelationships(relationships: Relationship[], elements: BaseElement[]): string[] {
    const elementIds = new Set(elements.map(e => e.id));
    const orphaned: string[] = [];

    for (const relationship of relationships) {
      if (!elementIds.has(relationship.source) || !elementIds.has(relationship.target)) {
        orphaned.push(relationship.id);
      }
    }

    return orphaned;
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
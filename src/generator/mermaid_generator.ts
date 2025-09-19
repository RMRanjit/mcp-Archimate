import { BaseElement } from '../core/element.js';
import { Relationship } from '../core/relationship.js';
import { RelationshipType } from '../models/archimate.js';

export class MermaidGenerator {
  private relationshipArrows: Map<RelationshipType, string> = new Map([
    [RelationshipType.COMPOSITION, ' --* '],
    [RelationshipType.AGGREGATION, ' --o '],
    [RelationshipType.ASSIGNMENT, ' --> '],
    [RelationshipType.REALIZATION, ' --|> '],
    [RelationshipType.SERVING, ' --> '],
    [RelationshipType.ACCESS, ' ..> '],
    [RelationshipType.INFLUENCE, ' ..> '],
    [RelationshipType.TRIGGERING, ' --> '],
    [RelationshipType.FLOW, ' --> '],
    [RelationshipType.SPECIALIZATION, ' --|> '],
    [RelationshipType.ASSOCIATION, ' --- '],
    [RelationshipType.JUNCTION, ' --- '],
  ]);

  generate(elements: BaseElement[], relationships: Relationship[]): string {
    let mermaidCode = 'graph TD;\n';

    for (const element of elements) {
      mermaidCode += `  ${element.id}["${element.name}"];\n`;
    }

    for (const relationship of relationships) {
      const arrow = this.relationshipArrows.get(relationship.type) || ' --> ';
      mermaidCode += `  ${relationship.source}${arrow}${relationship.target};\n`;
    }

    return mermaidCode;
  }
}
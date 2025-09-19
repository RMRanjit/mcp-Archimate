import { BaseElement } from '../core/element.js';
import { Relationship } from '../core/relationship.js';
import { validationMatrix } from './validation_matrix.js';
import { ValidationError } from './validation_error.js';

export class Validator {
  validate(elements: BaseElement[], relationships: Relationship[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const elementMap = new Map(elements.map(e => [e.id, e]));

    for (const relationship of relationships) {
      const source = elementMap.get(relationship.source);
      const target = elementMap.get(relationship.target);

      if (!source || !target) {
        // This should be handled by another validation rule.
        continue;
      }

      const allowedRelationships = validationMatrix.get(source.type)?.get(target.type);

      if (!allowedRelationships || !allowedRelationships.includes(relationship.type)) {
        errors.push({
          message: `Invalid relationship type '${relationship.type}' between '${source.type}' and '${target.type}'`,
          source,
          target,
          relationship,
        });
      }
    }

    return errors;
  }
}

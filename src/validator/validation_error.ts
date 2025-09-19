import { BaseElement } from '../core/element.js';
import { Relationship } from '../core/relationship.js';

export interface ValidationError {
  message: string;
  source: BaseElement;
  target: BaseElement;
  relationship: Relationship;
}

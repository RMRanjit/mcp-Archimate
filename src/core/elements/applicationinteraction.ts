import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class ApplicationInteraction extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.APPLICATION_INTERACTION, Layer.APPLICATION);
  }
}

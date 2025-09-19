import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class TechnologyInteraction extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.TECHNOLOGY_INTERACTION, Layer.TECHNOLOGY);
  }
}

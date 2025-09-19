import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class TechnologyEvent extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.TECHNOLOGY_EVENT, Layer.TECHNOLOGY);
  }
}

import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class TechnologyFunction extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.TECHNOLOGY_FUNCTION, Layer.TECHNOLOGY);
  }
}

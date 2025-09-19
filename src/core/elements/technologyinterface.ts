import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class TechnologyInterface extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.TECHNOLOGY_INTERFACE, Layer.TECHNOLOGY);
  }
}

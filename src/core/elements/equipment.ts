import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class Equipment extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.EQUIPMENT, Layer.PHYSICAL);
  }
}

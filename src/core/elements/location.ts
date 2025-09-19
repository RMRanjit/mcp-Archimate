import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class Location extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.LOCATION, Layer.PHYSICAL);
  }
}

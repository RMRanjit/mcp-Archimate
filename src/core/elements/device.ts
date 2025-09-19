import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class Device extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.DEVICE, Layer.TECHNOLOGY);
  }
}

import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class Capability extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.CAPABILITY, Layer.STRATEGY);
  }
}

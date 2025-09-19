import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class ImplementationEvent extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.IMPLEMENTATION_EVENT, Layer.IMPLEMENTATION);
  }
}

import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class ApplicationFunction extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.APPLICATION_FUNCTION, Layer.APPLICATION);
  }
}

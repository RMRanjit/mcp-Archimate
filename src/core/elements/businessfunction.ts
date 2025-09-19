import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class BusinessFunction extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.BUSINESS_FUNCTION, Layer.BUSINESS);
  }
}

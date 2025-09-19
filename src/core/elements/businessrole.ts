import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class BusinessRole extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.BUSINESS_ROLE, Layer.BUSINESS);
  }
}

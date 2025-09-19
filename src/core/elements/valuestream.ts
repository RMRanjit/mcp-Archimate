import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class ValueStream extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.VALUE_STREAM, Layer.STRATEGY);
  }
}

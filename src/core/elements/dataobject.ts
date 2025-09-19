import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class DataObject extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.DATA_OBJECT, Layer.APPLICATION);
  }
}

import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class Material extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.MATERIAL, Layer.PHYSICAL);
  }
}

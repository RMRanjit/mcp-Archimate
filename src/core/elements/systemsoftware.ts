import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class SystemSoftware extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.SYSTEM_SOFTWARE, Layer.TECHNOLOGY);
  }
}

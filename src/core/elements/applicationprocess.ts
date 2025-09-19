import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class ApplicationProcess extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.APPLICATION_PROCESS, Layer.APPLICATION);
  }
}

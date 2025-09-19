import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class ApplicationService extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.APPLICATION_SERVICE, Layer.APPLICATION);
  }
}

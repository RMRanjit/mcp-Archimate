import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class ApplicationCollaboration extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.APPLICATION_COLLABORATION, Layer.APPLICATION);
  }
}

import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class WorkPackage extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.WORK_PACKAGE, Layer.IMPLEMENTATION);
  }
}

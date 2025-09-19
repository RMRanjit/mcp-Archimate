import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class TechnologyProcess extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.TECHNOLOGY_PROCESS, Layer.TECHNOLOGY);
  }
}

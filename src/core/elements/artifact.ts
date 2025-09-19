import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class Artifact extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.ARTIFACT, Layer.TECHNOLOGY);
  }
}

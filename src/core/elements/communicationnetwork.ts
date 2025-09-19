import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class CommunicationNetwork extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.COMMUNICATION_NETWORK, Layer.TECHNOLOGY);
  }
}

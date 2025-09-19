import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class DistributionNetwork extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.DISTRIBUTION_NETWORK, Layer.PHYSICAL);
  }
}

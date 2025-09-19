import { ElementType, Layer } from '../models/archimate.js';

export abstract class BaseElement {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: ElementType,
    public readonly layer: Layer,
  ) {}
}

import { BaseElement } from '../element.js';
import { ElementType, Layer } from '../../models/archimate.js';

export class CourseOfAction extends BaseElement {
  constructor(id: string, name: string) {
    super(id, name, ElementType.COURSE_OF_ACTION, Layer.STRATEGY);
  }
}

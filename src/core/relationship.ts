import { RelationshipType } from '../models/archimate.js';

export class Relationship {
  constructor(
    public readonly id: string,
    public readonly source: string,
    public readonly target: string,
    public readonly type: RelationshipType,
  ) {}
}

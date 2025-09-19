import { ElementType, RelationshipType } from '../models/archimate.js';

export const validationMatrix: Map<ElementType, Map<ElementType, RelationshipType[]>> = new Map<ElementType, Map<ElementType, RelationshipType[]>>([
  [ElementType.BUSINESS_ACTOR, new Map<ElementType, RelationshipType[]>([
    [ElementType.BUSINESS_ROLE, [RelationshipType.ASSIGNMENT]],
  ])],
  [ElementType.APPLICATION_COMPONENT, new Map<ElementType, RelationshipType[]>([
    [ElementType.APPLICATION_COMPONENT, [RelationshipType.COMPOSITION, RelationshipType.AGGREGATION]],
  ])],
  [ElementType.VALUE_STREAM, new Map<ElementType, RelationshipType[]>([
    [ElementType.VALUE_STREAM, [RelationshipType.COMPOSITION, RelationshipType.AGGREGATION]],
  ])],
  [ElementType.LOCATION, new Map<ElementType, RelationshipType[]>([
    [ElementType.LOCATION, [RelationshipType.COMPOSITION, RelationshipType.AGGREGATION]],
  ])],
]);

export enum Layer {
  MOTIVATION = 'Motivation',
  STRATEGY = 'Strategy',
  BUSINESS = 'Business',
  APPLICATION = 'Application',
  TECHNOLOGY = 'Technology',
  PHYSICAL = 'Physical',
  IMPLEMENTATION = 'Implementation',
}

export enum ElementType {
  // Motivation
  STAKEHOLDER = 'Stakeholder',
  DRIVER = 'Driver',
  ASSESSMENT = 'Assessment',
  GOAL = 'Goal',
  OUTCOME = 'Outcome',
  PRINCIPLE = 'Principle',
  REQUIREMENT = 'Requirement',
  CONSTRAINT = 'Constraint',
  MEANING = 'Meaning',
  VALUE = 'Value',

  // Strategy
  RESOURCE = 'Resource',
  CAPABILITY = 'Capability',
  COURSE_OF_ACTION = 'CourseOfAction',
  VALUE_STREAM = 'ValueStream',

  // Business
  BUSINESS_ACTOR = 'BusinessActor',
  BUSINESS_ROLE = 'BusinessRole',
  BUSINESS_COLLABORATION = 'BusinessCollaboration',
  BUSINESS_INTERFACE = 'BusinessInterface',
  BUSINESS_PROCESS = 'BusinessProcess',
  BUSINESS_FUNCTION = 'BusinessFunction',
  BUSINESS_INTERACTION = 'BusinessInteraction',
  BUSINESS_EVENT = 'BusinessEvent',
  BUSINESS_SERVICE = 'BusinessService',
  BUSINESS_OBJECT = 'BusinessObject',
  CONTRACT = 'Contract',
  REPRESENTATION = 'Representation',
  PRODUCT = 'Product',

  // Application
  APPLICATION_COMPONENT = 'ApplicationComponent',
  APPLICATION_COLLABORATION = 'ApplicationCollaboration',
  APPLICATION_INTERFACE = 'ApplicationInterface',
  APPLICATION_FUNCTION = 'ApplicationFunction',
  APPLICATION_INTERACTION = 'ApplicationInteraction',
  APPLICATION_PROCESS = 'ApplicationProcess',
  APPLICATION_EVENT = 'ApplicationEvent',
  APPLICATION_SERVICE = 'ApplicationService',
  DATA_OBJECT = 'DataObject',

  // Technology
  NODE = 'Node',
  DEVICE = 'Device',
  SYSTEM_SOFTWARE = 'SystemSoftware',
  TECHNOLOGY_COLLABORATION = 'TechnologyCollaboration',
  TECHNOLOGY_INTERFACE = 'TechnologyInterface',
  PATH = 'Path',
  COMMUNICATION_NETWORK = 'CommunicationNetwork',
  TECHNOLOGY_FUNCTION = 'TechnologyFunction',
  TECHNOLOGY_PROCESS = 'TechnologyProcess',
  TECHNOLOGY_INTERACTION = 'TechnologyInteraction',
  TECHNOLOGY_EVENT = 'TechnologyEvent',
  TECHNOLOGY_SERVICE = 'TechnologyService',
  ARTIFACT = 'Artifact',

  // Physical
  EQUIPMENT = 'Equipment',
  FACILITY = 'Facility',
  DISTRIBUTION_NETWORK = 'DistributionNetwork',
  MATERIAL = 'Material',
  LOCATION = 'Location',

  // Implementation & Migration
  WORK_PACKAGE = 'WorkPackage',
  DELIVERABLE = 'Deliverable',
  IMPLEMENTATION_EVENT = 'ImplementationEvent',
  PLATEAU = 'Plateau',
  GAP = 'Gap',
}

export enum RelationshipType {
  // Structural
  COMPOSITION = 'Composition',
  AGGREGATION = 'Aggregation',
  ASSIGNMENT = 'Assignment',
  REALIZATION = 'Realization',

  // Dependency
  SERVING = 'Serving',
  ACCESS = 'Access',
  INFLUENCE = 'Influence',

  // Dynamic
  TRIGGERING = 'Triggering',
  FLOW = 'Flow',

  // Other
  SPECIALIZATION = 'Specialization',
  ASSOCIATION = 'Association',
  JUNCTION = 'Junction',
}

export interface Element {
  id: string;
  name: string;
  type: ElementType;
  layer: Layer;
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
}

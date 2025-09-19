import { BaseElement } from './element.js';
import { ElementType } from '../models/archimate.js';
import { Stakeholder } from './elements/stakeholder.js';
import { Driver } from './elements/driver.js';
import { Assessment } from './elements/assessment.js';
import { Goal } from './elements/goal.js';
import { Outcome } from './elements/outcome.js';
import { Principle } from './elements/principle.js';
import { Requirement } from './elements/requirement.js';
import { Constraint } from './elements/constraint.js';
import { Meaning } from './elements/meaning.js';
import { Value } from './elements/value.js';
import { Resource } from './elements/resource.js';
import { Capability } from './elements/capability.js';
import { CourseOfAction } from './elements/courseofaction.js';
import { BusinessActor } from './elements/businessactor.js';
import { BusinessRole } from './elements/businessrole.js';
import { BusinessCollaboration } from './elements/businesscollaboration.js';
import { BusinessInterface } from './elements/businessinterface.js';
import { BusinessProcess } from './elements/businessprocess.js';
import { BusinessFunction } from './elements/businessfunction.js';
import { BusinessInteraction } from './elements/businessinteraction.js';
import { BusinessEvent } from './elements/businessevent.js';
import { BusinessService } from './elements/businessservice.js';
import { BusinessObject } from './elements/businessobject.js';
import { Contract } from './elements/contract.js';
import { Representation } from './elements/representation.js';
import { Product } from './elements/product.js';
import { ApplicationComponent } from './elements/applicationcomponent.js';
import { ApplicationCollaboration } from './elements/applicationcollaboration.js';
import { ApplicationInterface } from './elements/applicationinterface.js';
import { ApplicationFunction } from './elements/applicationfunction.js';
import { ApplicationInteraction } from './elements/applicationinteraction.js';
import { ApplicationProcess } from './elements/applicationprocess.js';
import { ApplicationEvent } from './elements/applicationevent.js';
import { ApplicationService } from './elements/applicationservice.js';
import { DataObject } from './elements/dataobject.js';
import { Node } from './elements/node.js';
import { Device } from './elements/device.js';
import { SystemSoftware } from './elements/systemsoftware.js';
import { TechnologyCollaboration } from './elements/technologycollaboration.js';
import { TechnologyInterface } from './elements/technologyinterface.js';
import { Path } from './elements/path.js';
import { CommunicationNetwork } from './elements/communicationnetwork.js';
import { TechnologyFunction } from './elements/technologyfunction.js';
import { TechnologyProcess } from './elements/technologyprocess.js';
import { TechnologyInteraction } from './elements/technologyinteraction.js';
import { TechnologyEvent } from './elements/technologyevent.js';
import { TechnologyService } from './elements/technologyservice.js';
import { Artifact } from './elements/artifact.js';
import { Equipment } from './elements/equipment.js';
import { Facility } from './elements/facility.js';
import { DistributionNetwork } from './elements/distributionnetwork.js';
import { Material } from './elements/material.js';
import { WorkPackage } from './elements/workpackage.js';
import { Deliverable } from './elements/deliverable.js';
import { ImplementationEvent } from './elements/implementationevent.js';
import { Plateau } from './elements/plateau.js';
import { Gap } from './elements/gap.js';
import { ValueStream } from './elements/valuestream.js';
import { Location } from './elements/location.js';

export class ElementFactory {
  static create(type: ElementType, id: string, name: string): BaseElement {
    switch (type) {
      case ElementType.STAKEHOLDER:
        return new Stakeholder(id, name);
      case ElementType.DRIVER:
        return new Driver(id, name);
      case ElementType.ASSESSMENT:
        return new Assessment(id, name);
      case ElementType.GOAL:
        return new Goal(id, name);
      case ElementType.OUTCOME:
        return new Outcome(id, name);
      case ElementType.PRINCIPLE:
        return new Principle(id, name);
      case ElementType.REQUIREMENT:
        return new Requirement(id, name);
      case ElementType.CONSTRAINT:
        return new Constraint(id, name);
      case ElementType.MEANING:
        return new Meaning(id, name);
      case ElementType.VALUE:
        return new Value(id, name);
      case ElementType.RESOURCE:
        return new Resource(id, name);
      case ElementType.CAPABILITY:
        return new Capability(id, name);
      case ElementType.COURSE_OF_ACTION:
        return new CourseOfAction(id, name);
      case ElementType.BUSINESS_ACTOR:
        return new BusinessActor(id, name);
      case ElementType.BUSINESS_ROLE:
        return new BusinessRole(id, name);
      case ElementType.BUSINESS_COLLABORATION:
        return new BusinessCollaboration(id, name);
      case ElementType.BUSINESS_INTERFACE:
        return new BusinessInterface(id, name);
      case ElementType.BUSINESS_PROCESS:
        return new BusinessProcess(id, name);
      case ElementType.BUSINESS_FUNCTION:
        return new BusinessFunction(id, name);
      case ElementType.BUSINESS_INTERACTION:
        return new BusinessInteraction(id, name);
      case ElementType.BUSINESS_EVENT:
        return new BusinessEvent(id, name);
      case ElementType.BUSINESS_SERVICE:
        return new BusinessService(id, name);
      case ElementType.BUSINESS_OBJECT:
        return new BusinessObject(id, name);
      case ElementType.CONTRACT:
        return new Contract(id, name);
      case ElementType.REPRESENTATION:
        return new Representation(id, name);
      case ElementType.PRODUCT:
        return new Product(id, name);
      case ElementType.APPLICATION_COMPONENT:
        return new ApplicationComponent(id, name);
      case ElementType.APPLICATION_COLLABORATION:
        return new ApplicationCollaboration(id, name);
      case ElementType.APPLICATION_INTERFACE:
        return new ApplicationInterface(id, name);
      case ElementType.APPLICATION_FUNCTION:
        return new ApplicationFunction(id, name);
      case ElementType.APPLICATION_INTERACTION:
        return new ApplicationInteraction(id, name);
      case ElementType.APPLICATION_PROCESS:
        return new ApplicationProcess(id, name);
      case ElementType.APPLICATION_EVENT:
        return new ApplicationEvent(id, name);
      case ElementType.APPLICATION_SERVICE:
        return new ApplicationService(id, name);
      case ElementType.DATA_OBJECT:
        return new DataObject(id, name);
      case ElementType.NODE:
        return new Node(id, name);
      case ElementType.DEVICE:
        return new Device(id, name);
      case ElementType.SYSTEM_SOFTWARE:
        return new SystemSoftware(id, name);
      case ElementType.TECHNOLOGY_COLLABORATION:
        return new TechnologyCollaboration(id, name);
      case ElementType.TECHNOLOGY_INTERFACE:
        return new TechnologyInterface(id, name);
      case ElementType.PATH:
        return new Path(id, name);
      case ElementType.COMMUNICATION_NETWORK:
        return new CommunicationNetwork(id, name);
      case ElementType.TECHNOLOGY_FUNCTION:
        return new TechnologyFunction(id, name);
      case ElementType.TECHNOLOGY_PROCESS:
        return new TechnologyProcess(id, name);
      case ElementType.TECHNOLOGY_INTERACTION:
        return new TechnologyInteraction(id, name);
      case ElementType.TECHNOLOGY_EVENT:
        return new TechnologyEvent(id, name);
      case ElementType.TECHNOLOGY_SERVICE:
        return new TechnologyService(id, name);
      case ElementType.ARTIFACT:
        return new Artifact(id, name);
      case ElementType.EQUIPMENT:
        return new Equipment(id, name);
      case ElementType.FACILITY:
        return new Facility(id, name);
      case ElementType.DISTRIBUTION_NETWORK:
        return new DistributionNetwork(id, name);
      case ElementType.MATERIAL:
        return new Material(id, name);
      case ElementType.LOCATION:
        return new Location(id, name);
      case ElementType.WORK_PACKAGE:
        return new WorkPackage(id, name);
      case ElementType.DELIVERABLE:
        return new Deliverable(id, name);
      case ElementType.IMPLEMENTATION_EVENT:
        return new ImplementationEvent(id, name);
      case ElementType.PLATEAU:
        return new Plateau(id, name);
      case ElementType.GAP:
        return new Gap(id, name);
      default:
        throw new Error(`Unknown element type: ${type}`);
    }
  }
}

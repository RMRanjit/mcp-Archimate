import { readFileSync } from 'fs';
import { DOMParser } from '@xmldom/xmldom';
import { BaseElement } from '../core/element.js';
import { Relationship } from '../core/relationship.js';
import { ElementType, RelationshipType } from '../models/archimate.js';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'schema' | 'structure' | 'reference' | 'namespace' | 'uniqueness';
  line?: number;
  column?: number;
  message: string;
  element?: string;
  details?: string;
}

export interface ValidationWarning {
  type: 'best-practice' | 'compatibility' | 'performance';
  line?: number;
  message: string;
  suggestion?: string;
}

export class XmlValidator {
  private static readonly ARCHIMATE_NAMESPACE = 'http://www.opengroup.org/xsd/archimate/3.0/';
  private static readonly XSI_NAMESPACE = 'http://www.w3.org/2001/XMLSchema-instance';
  private static readonly SCHEMA_LOCATION = 'http://www.opengroup.org/xsd/archimate/3.1/archimate3_Diagram.xsd';

  /**
   * Validate XML string against ArchiMate 3.0 specification
   */
  validateXmlString(xml: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // 1. Check well-formedness
      const wellFormednessResult = this.validateWellFormedness(xml);
      result.errors.push(...wellFormednessResult.errors);
      result.warnings.push(...wellFormednessResult.warnings);

      if (wellFormednessResult.errors.length > 0) {
        result.isValid = false;
        return result;
      }

      // 2. Parse XML document
      const doc = this.parseXml(xml);
      if (!doc) {
        result.isValid = false;
        result.errors.push({
          type: 'structure',
          message: 'Failed to parse XML document',
          details: 'Document could not be parsed as valid XML'
        });
        return result;
      }

      // 3. Validate structure
      const structureResult = this.validateStructure(xml);
      result.errors.push(...structureResult.errors);
      result.warnings.push(...structureResult.warnings);

      // 4. Validate namespace
      const namespaceResult = this.validateNamespace(doc);
      result.errors.push(...namespaceResult.errors);
      result.warnings.push(...namespaceResult.warnings);

      // 5. Validate element uniqueness
      const uniquenessResult = this.validateElementUniqueness(doc);
      result.errors.push(...uniquenessResult.errors);
      result.warnings.push(...uniquenessResult.warnings);

      // 6. Validate relationship references
      const referencesResult = this.validateRelationshipReferences(doc);
      result.errors.push(...referencesResult.errors);
      result.warnings.push(...referencesResult.warnings);

      // 7. Validate ArchiMate element types
      const typesResult = this.validateArchiMateTypes(doc);
      result.errors.push(...typesResult.errors);
      result.warnings.push(...typesResult.warnings);

      result.isValid = result.errors.length === 0;

    } catch (error) {
      result.isValid = false;
      result.errors.push({
        type: 'structure',
        message: 'Validation failed with unexpected error',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    return result;
  }

  /**
   * Validate XML file
   */
  validateXmlFile(filePath: string): ValidationResult {
    try {
      const xml = readFileSync(filePath, 'utf-8');
      return this.validateXmlString(xml);
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          type: 'structure',
          message: `Failed to read file: ${filePath}`,
          details: error instanceof Error ? error.message : String(error)
        }],
        warnings: []
      };
    }
  }

  /**
   * Basic structural validation without XSD schema
   */
  validateStructure(xml: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      const doc = this.parseXml(xml);
      if (!doc) {
        result.isValid = false;
        result.errors.push({
          type: 'structure',
          message: 'Invalid XML structure',
          details: 'Document could not be parsed'
        });
        return result;
      }

      // Check root element
      const rootElement = doc.documentElement;
      if (!rootElement || rootElement.tagName !== 'model') {
        result.errors.push({
          type: 'structure',
          message: 'Invalid root element',
          details: `Expected 'model' but found '${rootElement?.tagName || 'none'}'`
        });
        result.isValid = false;
      }

      // Check required attributes
      if (rootElement) {
        const identifier = rootElement.getAttribute('identifier');
        if (!identifier) {
          result.errors.push({
            type: 'structure',
            message: 'Missing required attribute: identifier',
            element: 'model'
          });
          result.isValid = false;
        }

        // Check for name element
        const nameElements = rootElement.getElementsByTagName('name');
        if (nameElements.length === 0) {
          result.warnings.push({
            type: 'best-practice',
            message: 'Model should have a name element',
            suggestion: 'Add a <name> element to provide a human-readable model name'
          });
        }
      }

    } catch (error) {
      result.isValid = false;
      result.errors.push({
        type: 'structure',
        message: 'Structure validation failed',
        details: error instanceof Error ? error.message : String(error)
      });
    }

    return result;
  }

  private validateWellFormedness(xml: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Basic checks
    if (!xml.trim()) {
      result.errors.push({
        type: 'structure',
        message: 'Empty XML document'
      });
      result.isValid = false;
      return result;
    }

    // Check for XML declaration
    if (!xml.trim().startsWith('<?xml')) {
      result.warnings.push({
        type: 'best-practice',
        message: 'Missing XML declaration',
        suggestion: 'Add <?xml version="1.0" encoding="UTF-8"?> at the beginning'
      });
    }

    // Check for basic tag structure
    const openTags = (xml.match(/</g) || []).length;
    const closeTags = (xml.match(/>/g) || []).length;

    if (openTags !== closeTags) {
      result.errors.push({
        type: 'structure',
        message: 'Mismatched XML tags',
        details: `Found ${openTags} opening brackets and ${closeTags} closing brackets`
      });
      result.isValid = false;
    }

    return result;
  }

  private parseXml(xml: string): Document | null {
    try {
      const parser = new DOMParser({
        errorHandler: {
          warning: () => {},
          error: () => {},
          fatalError: () => {}
        }
      });
      return parser.parseFromString(xml, 'text/xml');
    } catch {
      return null;
    }
  }

  private validateNamespace(doc: Document): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const rootElement = doc.documentElement;
    if (!rootElement) return result;

    // Check ArchiMate namespace
    const archimateNamespace = rootElement.getAttribute('xmlns');
    if (archimateNamespace !== XmlValidator.ARCHIMATE_NAMESPACE) {
      result.errors.push({
        type: 'namespace',
        message: 'Invalid ArchiMate namespace',
        details: `Expected '${XmlValidator.ARCHIMATE_NAMESPACE}' but found '${archimateNamespace}'`,
        element: 'model'
      });
      result.isValid = false;
    }

    // Check XSI namespace
    const xsiNamespace = rootElement.getAttribute('xmlns:xsi');
    if (xsiNamespace !== XmlValidator.XSI_NAMESPACE) {
      result.warnings.push({
        type: 'compatibility',
        message: 'Missing or incorrect XSI namespace',
        suggestion: `Add xmlns:xsi="${XmlValidator.XSI_NAMESPACE}" for schema validation support`
      });
    }

    // Check schema location
    const schemaLocation = rootElement.getAttribute('xsi:schemaLocation');
    if (!schemaLocation || !schemaLocation.includes(XmlValidator.SCHEMA_LOCATION)) {
      result.warnings.push({
        type: 'compatibility',
        message: 'Missing or incorrect schema location',
        suggestion: `Add xsi:schemaLocation for proper schema validation`
      });
    }

    return result;
  }

  private validateElementUniqueness(doc: Document): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const seenIds = new Set<string>();
    const duplicates = new Set<string>();

    // Check all elements with identifier or id attributes
    const elementsWithIds = [
      ...this.getElementsByAttribute(doc, 'identifier'),
      ...this.getElementsByAttribute(doc, 'id')
    ];

    for (const element of elementsWithIds) {
      const id = element.getAttribute('identifier') || element.getAttribute('id');

      if (id) {
        if (seenIds.has(id)) {
          duplicates.add(id);
        } else {
          seenIds.add(id);
        }
      }
    }

    // Report duplicate IDs
    for (const duplicateId of duplicates) {
      result.errors.push({
        type: 'uniqueness',
        message: `Duplicate element identifier: ${duplicateId}`,
        details: 'All element identifiers must be unique within the model'
      });
      result.isValid = false;
    }

    return result;
  }

  private validateRelationshipReferences(doc: Document): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Helper function to check if element is a relationship
    const isRelationshipElement = (element: Element): boolean => {
      const type = element.getAttribute('xsi:type');
      return type ? type.includes('Relationship') : false;
    };

    // Collect all element IDs (excluding relationships)
    const elementIds = new Set<string>();
    const allElements = [
      ...this.getElementsByAttribute(doc, 'identifier'),
      ...this.getElementsByAttribute(doc, 'id')
    ];

    for (const element of allElements) {
      const id = element.getAttribute('identifier') || element.getAttribute('id');
      if (id && element.tagName !== 'relationship' && !isRelationshipElement(element)) {
        elementIds.add(id);
      }
    }

    // Check relationship references (both 'relationship' and relationship 'element' tags)
    const relationships = [
      ...this.getElementsByTagName(doc, 'relationship'),
      ...this.getElementsByTagName(doc, 'element').filter(isRelationshipElement)
    ];

    for (const relationship of relationships) {
      const source = relationship.getAttribute('source');
      const target = relationship.getAttribute('target');
      const relationshipId = relationship.getAttribute('identifier') || relationship.getAttribute('id');

      if (source && !elementIds.has(source)) {
        result.errors.push({
          type: 'reference',
          message: `Relationship references unknown source element: ${source}`,
          element: relationshipId || 'unnamed relationship'
        });
        result.isValid = false;
      }

      if (target && !elementIds.has(target)) {
        result.errors.push({
          type: 'reference',
          message: `Relationship references unknown target element: ${target}`,
          element: relationshipId || 'unnamed relationship'
        });
        result.isValid = false;
      }
    }

    return result;
  }

  private validateArchiMateTypes(doc: Document): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Get all valid element types
    const validElementTypes = new Set(Object.values(ElementType));
    const validRelationshipTypes = new Set(Object.values(RelationshipType));

    // Helper function to normalize type name (remove prefixes)
    const normalizeTypeName = (type: string): string => {
      // Remove namespace prefixes like 'archimate:' or similar
      const colonIndex = type.lastIndexOf(':');
      if (colonIndex !== -1) {
        return type.substring(colonIndex + 1);
      }
      return type;
    };

    // Get all elements and separate them into regular elements and relationships
    const allElements = this.getElementsByTagName(doc, 'element');
    const regularElements: Element[] = [];
    const relationshipElements: Element[] = [];

    for (const element of allElements) {
      const type = element.getAttribute('xsi:type');
      if (type && normalizeTypeName(type).endsWith('Relationship')) {
        relationshipElements.push(element);
      } else {
        regularElements.push(element);
      }
    }

    // Check regular element types
    for (const element of regularElements) {
      const type = element.getAttribute('xsi:type');
      const identifier = element.getAttribute('identifier') || element.getAttribute('id');

      if (type) {
        const normalizedType = normalizeTypeName(type);
        if (!validElementTypes.has(normalizedType as ElementType)) {
          result.errors.push({
            type: 'schema',
            message: `Invalid element type: ${type}`,
            element: identifier || 'unnamed element',
            details: 'Element type is not valid according to ArchiMate 3.2 specification'
          });
          result.isValid = false;
        }
      }
    }

    // Check relationship types (from both 'relationship' tags and relationship 'element' tags)
    const relationships = [
      ...this.getElementsByTagName(doc, 'relationship'),
      ...relationshipElements
    ];

    for (const relationship of relationships) {
      const type = relationship.getAttribute('xsi:type');
      const identifier = relationship.getAttribute('identifier') || relationship.getAttribute('id');

      if (type) {
        const normalizedType = normalizeTypeName(type);
        // Handle relationship types that may end with 'Relationship' suffix
        const baseType = normalizedType.replace(/Relationship$/, '');

        if (!validRelationshipTypes.has(normalizedType as RelationshipType) &&
            !validRelationshipTypes.has(baseType as RelationshipType)) {
          result.errors.push({
            type: 'schema',
            message: `Invalid relationship type: ${type}`,
            element: identifier || 'unnamed relationship',
            details: 'Relationship type is not valid according to ArchiMate 3.2 specification'
          });
          result.isValid = false;
        }
      }
    }

    return result;
  }

  /**
   * Validate that elements and relationships conform to ArchiMate specification
   */
  validateModel(elements: BaseElement[], relationships: Relationship[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check element ID uniqueness
    const elementIds = new Set<string>();
    for (const element of elements) {
      if (elementIds.has(element.id)) {
        result.errors.push({
          type: 'uniqueness',
          message: `Duplicate element ID: ${element.id}`,
          element: element.name
        });
        result.isValid = false;
      } else {
        elementIds.add(element.id);
      }
    }

    // Check relationship ID uniqueness
    const relationshipIds = new Set<string>();
    for (const relationship of relationships) {
      if (relationshipIds.has(relationship.id)) {
        result.errors.push({
          type: 'uniqueness',
          message: `Duplicate relationship ID: ${relationship.id}`
        });
        result.isValid = false;
      } else {
        relationshipIds.add(relationship.id);
      }
    }

    // Check relationship references
    for (const relationship of relationships) {
      if (!elementIds.has(relationship.source)) {
        result.errors.push({
          type: 'reference',
          message: `Relationship references unknown source element: ${relationship.source}`,
          element: relationship.id
        });
        result.isValid = false;
      }

      if (!elementIds.has(relationship.target)) {
        result.errors.push({
          type: 'reference',
          message: `Relationship references unknown target element: ${relationship.target}`,
          element: relationship.id
        });
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Get validation summary for reporting
   */
  getValidationSummary(result: ValidationResult): string {
    const summary = [];

    if (result.isValid) {
      summary.push('✅ Validation passed');
    } else {
      summary.push('❌ Validation failed');
    }

    if (result.errors.length > 0) {
      summary.push(`\n🚨 ${result.errors.length} error(s):`);
      for (const error of result.errors) {
        const location = error.line ? ` (line ${error.line}${error.column ? `:${error.column}` : ''})` : '';
        const element = error.element ? ` [${error.element}]` : '';
        summary.push(`  • ${error.message}${location}${element}`);
        if (error.details) {
          summary.push(`    ${error.details}`);
        }
      }
    }

    if (result.warnings.length > 0) {
      summary.push(`\n⚠️  ${result.warnings.length} warning(s):`);
      for (const warning of result.warnings) {
        const location = warning.line ? ` (line ${warning.line})` : '';
        summary.push(`  • ${warning.message}${location}`);
        if (warning.suggestion) {
          summary.push(`    Suggestion: ${warning.suggestion}`);
        }
      }
    }

    return summary.join('\n');
  }

  /**
   * Helper method to get elements by tag name (compatible with xmldom)
   */
  private getElementsByTagName(doc: Document, tagName: string): Element[] {
    const elements: Element[] = [];
    const nodeList = doc.getElementsByTagName(tagName);

    if (nodeList && nodeList.length) {
      for (let i = 0; i < nodeList.length; i++) {
        const node = nodeList[i];
        if (node && node.nodeType === 1) { // Element node
          elements.push(node as Element);
        }
      }
    }

    return elements;
  }

  /**
   * Helper method to get elements by attribute (compatible with xmldom)
   */
  private getElementsByAttribute(doc: Document, attributeName: string): Element[] {
    const elements: Element[] = [];

    const walk = (node: Node) => {
      if (node && node.nodeType === 1) { // Element node
        const element = node as Element;
        if (element.getAttribute && element.getAttribute(attributeName)) {
          elements.push(element);
        }
      }

      if (node && node.childNodes && node.childNodes.length) {
        for (let i = 0; i < node.childNodes.length; i++) {
          const child = node.childNodes[i];
          if (child) {
            walk(child);
          }
        }
      }
    };

    if (doc) {
      walk(doc);
    }
    return elements;
  }
}
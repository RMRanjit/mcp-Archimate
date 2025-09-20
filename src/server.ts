#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ElementFactory } from './core/element_factory.js';
import { ElementType } from './models/archimate.js';
import { Relationship } from './core/relationship.js';
import { RelationshipType } from './models/archimate.js';
import { MermaidGenerator } from './generator/mermaid_generator.js';
import { Validator } from './validator/validator.js';
import { ResourceManager } from './resources/resource-manager.js';
import { XmlExporter, createXmlExporter } from './xml-export/xml-exporter.js';
import { ModelXmlGenerator } from './xml-export/model-xml-generator.js';

interface ArchiMateElement {
  id: string;
  name: string;
  type: string;
}

interface ArchiMateRelationship {
  id: string;
  source: string;
  target: string;
  type: string;
}

interface GenerateDiagramArgs {
  elements: ArchiMateElement[];
  relationships: ArchiMateRelationship[];
  format?: 'mermaid' | 'drawio';
}

interface XMLExportArgs {
  elements: ArchiMateElement[];
  relationships: ArchiMateRelationship[];
  options?: {
    modelName?: string;
    modelPurpose?: string;
    includeViews?: boolean;
    viewName?: string;
  };
}

class ArchiMateServer {
  private server: Server;
  private resourceManager: ResourceManager;

  constructor() {
    this.resourceManager = new ResourceManager();
    this.server = new Server(
      {
        name: 'archimate-server',
        version: '1.0.0',
        description: 'ArchiMate diagram generation server with MCP support',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'generate_archimate_diagram',
            description: 'Generate ArchiMate diagrams in Mermaid or Draw.io format from elements and relationships',
            inputSchema: {
              type: 'object',
              properties: {
                elements: {
                  type: 'array',
                  description: 'Array of ArchiMate elements',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', description: 'Unique identifier for the element' },
                      name: { type: 'string', description: 'Display name for the element' },
                      type: { type: 'string', description: 'ArchiMate element type (e.g., BusinessActor, ApplicationComponent)' }
                    },
                    required: ['id', 'name', 'type']
                  }
                },
                relationships: {
                  type: 'array',
                  description: 'Array of relationships between elements',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', description: 'Unique identifier for the relationship' },
                      source: { type: 'string', description: 'ID of the source element' },
                      target: { type: 'string', description: 'ID of the target element' },
                      type: { type: 'string', description: 'ArchiMate relationship type (e.g., Serving, Realization, Assignment)' }
                    },
                    required: ['id', 'source', 'target', 'type']
                  }
                },
                format: {
                  type: 'string',
                  enum: ['mermaid', 'drawio'],
                  description: 'Output format for the diagram',
                  default: 'mermaid'
                }
              },
              required: ['elements', 'relationships']
            }
          },
          {
            name: 'validate_archimate_model',
            description: 'Validate ArchiMate elements and relationships against the ArchiMate 3.2 specification',
            inputSchema: {
              type: 'object',
              properties: {
                elements: {
                  type: 'array',
                  description: 'Array of ArchiMate elements to validate',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      type: { type: 'string' }
                    },
                    required: ['id', 'name', 'type']
                  }
                },
                relationships: {
                  type: 'array',
                  description: 'Array of relationships to validate',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      source: { type: 'string' },
                      target: { type: 'string' },
                      type: { type: 'string' }
                    },
                    required: ['id', 'source', 'target', 'type']
                  }
                }
              },
              required: ['elements', 'relationships']
            }
          },
          {
            name: 'list_archimate_elements',
            description: 'List all available ArchiMate 3.2 element types with their layers',
            inputSchema: {
              type: 'object',
              properties: {
                layer: {
                  type: 'string',
                  enum: ['Motivation', 'Strategy', 'Business', 'Application', 'Technology', 'Physical', 'Implementation'],
                  description: 'Filter elements by specific layer (optional)'
                }
              }
            }
          },
          {
            name: 'list_archimate_relationships',
            description: 'List all available ArchiMate relationship types',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'export_archimate_xml',
            description: 'Export ArchiMate model as standard XML Open Exchange Format (.archimate)',
            inputSchema: {
              type: 'object',
              properties: {
                elements: {
                  type: 'array',
                  description: 'Array of ArchiMate elements to export',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', description: 'Unique identifier for the element' },
                      name: { type: 'string', description: 'Display name for the element' },
                      type: { type: 'string', description: 'ArchiMate element type' }
                    },
                    required: ['id', 'name', 'type']
                  }
                },
                relationships: {
                  type: 'array',
                  description: 'Array of relationships between elements',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', description: 'Unique identifier for the relationship' },
                      source: { type: 'string', description: 'ID of the source element' },
                      target: { type: 'string', description: 'ID of the target element' },
                      type: { type: 'string', description: 'ArchiMate relationship type' }
                    },
                    required: ['id', 'source', 'target', 'type']
                  }
                },
                options: {
                  type: 'object',
                  description: 'Export options and metadata',
                  properties: {
                    modelName: { type: 'string', description: 'Name of the model', default: 'ArchiMate Model' },
                    modelPurpose: { type: 'string', description: 'Description of the model purpose' },
                    includeViews: { type: 'boolean', description: 'Include diagram views with layout', default: true },
                    viewName: { type: 'string', description: 'Name of the generated view', default: 'Generated View' }
                  }
                }
              },
              required: ['elements', 'relationships']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate_archimate_diagram':
            return await this.generateDiagram(args as unknown as GenerateDiagramArgs);

          case 'validate_archimate_model':
            return await this.validateModel(args as unknown as GenerateDiagramArgs);

          case 'list_archimate_elements':
            return await this.listElements(args as { layer?: string });

          case 'list_archimate_relationships':
            return await this.listRelationships();

          case 'export_archimate_xml':
            return await this.exportXML(args as unknown as XMLExportArgs);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    });

    // Resource handlers
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const resources = this.resourceManager.getAvailableResources();
      return { resources };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      try {
        const content = await this.resourceManager.getResourceContent(uri);
        return {
          contents: [
            {
              uri,
              mimeType: uri.includes('guide://') ? 'text/markdown' : 'application/json',
              text: content
            }
          ]
        };
      } catch (error) {
        throw new Error(`Failed to read resource ${uri}: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    // Prompt handlers
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'create-business-model',
            description: 'Create a business layer ArchiMate model with guided steps for a specific domain',
            arguments: [
              {
                name: 'domain',
                description: 'Business domain (e.g., banking, retail, healthcare, manufacturing)',
                required: true
              },
              {
                name: 'scope',
                description: 'Scope of the model (e.g., customer journey, core processes, department view)',
                required: false
              }
            ]
          },
          {
            name: 'validate-and-fix',
            description: 'Validate ArchiMate model and provide specific suggestions for fixing violations',
            arguments: [
              {
                name: 'elements',
                description: 'JSON array of ArchiMate elements to validate',
                required: true
              },
              {
                name: 'relationships',
                description: 'JSON array of relationships to validate',
                required: true
              }
            ]
          },
          {
            name: 'suggest-architecture-pattern',
            description: 'Suggest appropriate ArchiMate architecture patterns based on requirements',
            arguments: [
              {
                name: 'requirements',
                description: 'Description of what you want to model or achieve',
                required: true
              },
              {
                name: 'context',
                description: 'Additional context like existing systems, constraints, or preferences',
                required: false
              }
            ]
          }
        ]
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create-business-model':
            return await this.generateBusinessModelPrompt(args as { domain: string; scope?: string });

          case 'validate-and-fix':
            return await this.generateValidationPrompt(args as { elements: string; relationships: string });

          case 'suggest-architecture-pattern':
            return await this.generateArchitecturePatternPrompt(args as { requirements: string; context?: string });

          default:
            throw new Error(`Unknown prompt: ${name}`);
        }
      } catch (error) {
        throw new Error(`Failed to generate prompt ${name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }

  private async generateDiagram(args: GenerateDiagramArgs) {
    const { elements, relationships, format = 'mermaid' } = args;
    console.error(`[DEBUG] generateDiagram called with ${elements.length} elements, ${relationships.length} relationships, format: ${format}`);

    // Convert input elements to internal format
    const internalElements = elements.map(el => {
      const elementType = this.parseElementType(el.type);
      return ElementFactory.create(elementType, el.id, el.name);
    });

    // Convert input relationships to internal format
    const internalRelationships = relationships.map(rel => {
      const relType = this.parseRelationshipType(rel.type);
      return new Relationship(rel.id, rel.source, rel.target, relType);
    });

    // Generate diagram based on format
    let diagramCode = '';
    if (format === 'mermaid') {
      const generator = new MermaidGenerator();
      diagramCode = generator.generate(internalElements, internalRelationships);
    } else {
      // TODO: Implement Draw.io generator
      throw new Error('Draw.io format is not yet implemented');
    }

    // Validate the model
    const validator = new Validator();
    const validationErrors = validator.validate(internalElements, internalRelationships);

    return {
      content: [
        {
          type: 'text',
          text: `Generated ${format.toUpperCase()} diagram:\n\n\`\`\`${format}\n${diagramCode}\n\`\`\`\n\n` +
                (validationErrors.length > 0
                  ? `Validation warnings:\n${validationErrors.map(err => `- ${err.message}`).join('\n')}`
                  : 'Validation: All relationships are valid according to ArchiMate 3.2 specification.')
        }
      ]
    };
  }

  private async validateModel(args: GenerateDiagramArgs) {
    const { elements, relationships } = args;
    console.error(`[DEBUG] validateModel called with ${elements.length} elements, ${relationships.length} relationships`);

    // Convert input to internal format
    const internalElements = elements.map(el => {
      const elementType = this.parseElementType(el.type);
      return ElementFactory.create(elementType, el.id, el.name);
    });

    const internalRelationships = relationships.map(rel => {
      const relType = this.parseRelationshipType(rel.type);
      return new Relationship(rel.id, rel.source, rel.target, relType);
    });

    // Validate
    const validator = new Validator();
    const errors = validator.validate(internalElements, internalRelationships);

    const result = errors.length === 0
      ? 'Validation successful! All elements and relationships conform to ArchiMate 3.2 specification.'
      : `Validation found ${errors.length} issue(s):\n${errors.map(err => `- ${err.message}`).join('\n')}`;

    return {
      content: [
        {
          type: 'text',
          text: result
        }
      ]
    };
  }

  private async listElements(args: { layer?: string }) {
    const allElementTypes = Object.values(ElementType);

    let elementList: string[] = [];

    if (args.layer) {
      // Filter by layer - we'd need to implement layer mapping
      elementList = allElementTypes.filter(type => {
        // For now, just return all elements
        // TODO: Implement proper layer filtering
        return true;
      });
    } else {
      elementList = allElementTypes;
    }

    const formattedList = elementList
      .map(type => `- ${type}`)
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `Available ArchiMate Elements${args.layer ? ` (${args.layer} layer)` : ''}:\n\n${formattedList}`
        }
      ]
    };
  }

  private async listRelationships() {
    const relationshipTypes = Object.values(RelationshipType);
    const formattedList = relationshipTypes
      .map(type => `- ${type}`)
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `Available ArchiMate Relationship Types:\n\n${formattedList}`
        }
      ]
    };
  }

  private parseElementType(type: string): ElementType {
    // Handle case-insensitive input
    const normalizedType = type.replace(/[_\s-]/g, '').toLowerCase();

    for (const [key, value] of Object.entries(ElementType)) {
      if (value.replace(/[_\s-]/g, '').toLowerCase() === normalizedType ||
          key.toLowerCase() === normalizedType) {
        return value;
      }
    }

    // Find similar element types using fuzzy matching
    const suggestions = this.findSimilarElementTypes(type);
    const availableTypes = Object.values(ElementType).slice(0, 5).join(', ');

    throw new Error(
      `Unknown element type: "${type}". ` +
      `${suggestions.length > 0 ? `Did you mean: ${suggestions.join(', ')}? ` : ''}` +
      `Use the list_archimate_elements tool to see all ${Object.keys(ElementType).length} available types. ` +
      `Popular types include: ${availableTypes}...`
    );
  }

  private parseRelationshipType(type: string): RelationshipType {
    // Handle case-insensitive input
    const normalizedType = type.replace(/[_\s-]/g, '').toLowerCase();

    for (const [key, value] of Object.entries(RelationshipType)) {
      if (value.replace(/[_\s-]/g, '').toLowerCase() === normalizedType ||
          key.toLowerCase() === normalizedType) {
        return value;
      }
    }

    // Find similar relationship types using fuzzy matching
    const suggestions = this.findSimilarRelationshipTypes(type);
    const availableTypes = Object.values(RelationshipType).slice(0, 5).join(', ');

    throw new Error(
      `Unknown relationship type: "${type}". ` +
      `${suggestions.length > 0 ? `Did you mean: ${suggestions.join(', ')}? ` : ''}` +
      `Use the list_archimate_relationships tool to see all ${Object.keys(RelationshipType).length} available types. ` +
      `Common types include: ${availableTypes}...`
    );
  }

  private async generateBusinessModelPrompt(args: { domain: string; scope?: string }) {
    const { domain, scope = 'core processes' } = args;

    // Get domain-specific guidance from resources
    const templates = await this.resourceManager.getResourceContent('template://archimate/examples');
    const templatesData = JSON.parse(templates);

    const domainGuidance = templatesData.domain_examples[domain.toLowerCase()] || {
      common_elements: ['Business Actor', 'Business Process', 'Business Service'],
      typical_relationships: ['Business Service serves Business Actor', 'Business Process realizes Business Service']
    };

    return {
      description: `Create a business layer ArchiMate model for ${domain} focusing on ${scope}`,
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `I need to create a business layer ArchiMate model for the ${domain} domain, focusing on ${scope}.

Here's a structured approach:

## Step 1: Identify Key Actors
Based on the ${domain} domain, consider these typical business actors:
${domainGuidance.common_elements.filter((el: string) => el.includes('Actor')).map((el: string) => `- ${el}`).join('\n') || '- Identify primary stakeholders\n- Include internal and external actors'}

## Step 2: Define Core Processes
For ${scope} in ${domain}, consider:
${domainGuidance.common_elements.filter((el: string) => el.includes('Process')).map((el: string) => `- ${el}`).join('\n') || '- Map end-to-end processes\n- Include supporting processes'}

## Step 3: Specify Business Services
What services does your organization provide:
${domainGuidance.common_elements.filter((el: string) => el.includes('Service')).map((el: string) => `- ${el}`).join('\n') || '- Customer-facing services\n- Internal services'}

## Step 4: Connect with Relationships
Common patterns for ${domain}:
${domainGuidance.typical_relationships.map((rel: string) => `- ${rel}`).join('\n')}

## Example Template
Use the generate_archimate_diagram tool with this structure:

\`\`\`json
{
  "elements": [
    {"id": "actor1", "name": "Your Business Actor", "type": "BusinessActor"},
    {"id": "process1", "name": "Your Core Process", "type": "BusinessProcess"},
    {"id": "service1", "name": "Your Business Service", "type": "BusinessService"}
  ],
  "relationships": [
    {"id": "rel1", "source": "service1", "target": "actor1", "type": "Serving"},
    {"id": "rel2", "source": "process1", "target": "service1", "type": "Realization"}
  ],
  "format": "mermaid"
}
\`\`\`

Please create your ${domain} business model following this structure. What are your specific business actors, processes, and services?`
          }
        }
      ]
    };
  }

  private async generateValidationPrompt(args: { elements: string; relationships: string }) {
    const { elements, relationships } = args;

    let elementsArray: any[];
    let relationshipsArray: any[];

    try {
      elementsArray = JSON.parse(elements);
      relationshipsArray = JSON.parse(relationships);
    } catch (error) {
      throw new Error('Invalid JSON format for elements or relationships');
    }

    // Get relationship validation information
    const relationshipInfo = await this.resourceManager.getResourceContent('doc://archimate/relationships');
    const relationshipData = JSON.parse(relationshipInfo);

    return {
      description: `Validate ArchiMate model with ${elementsArray.length} elements and ${relationshipsArray.length} relationships`,
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Please validate this ArchiMate model and provide specific fixing suggestions:

## Model to Validate:
**Elements (${elementsArray.length})**:
${elementsArray.map((el: any) => `- ${el.name} (${el.type})`).join('\n')}

**Relationships (${relationshipsArray.length})**:
${relationshipsArray.map((rel: any) => `- ${rel.source} → ${rel.target} (${rel.type})`).join('\n')}

## Validation Approach:
1. **Use the validate_archimate_model tool** to check for ArchiMate 3.2 compliance
2. **Check element naming** - Are names clear and meaningful?
3. **Review relationship validity** - Do the relationships make architectural sense?
4. **Assess completeness** - Are there missing elements or relationships?
5. **Verify layer consistency** - Are cross-layer relationships appropriate?

## Common Issues to Check:
- Business actors directly accessing technology elements
- Circular serving relationships
- Missing realization relationships between layers
- Generic "Association" relationships (be more specific)
- Inconsistent relationship directions

## Relationship Rules Reference:
${Object.entries(relationshipData.categories).map(([category, data]: [string, any]) =>
  `**${category}**: ${data.description}\n${Object.keys(data.relationships).map((rel: string) => `- ${rel}`).join(', ')}`
).join('\n\n')}

Please validate the model and provide specific, actionable recommendations for improvement.`
          }
        }
      ]
    };
  }

  private async generateArchitecturePatternPrompt(args: { requirements: string; context?: string }) {
    const { requirements, context = '' } = args;

    // Get templates and patterns from resources
    const templates = await this.resourceManager.getResourceContent('template://archimate/examples');
    const templatesData = JSON.parse(templates);

    const availablePatterns = Object.entries(templatesData.templates).map(([key, template]: [string, any]) =>
      `- **${template.name}**: ${template.description} (Use case: ${template.use_case})`
    ).join('\n');

    const commonPatterns = Object.entries(templatesData.patterns).map(([key, pattern]: [string, any]) =>
      `- **${pattern.name}**: ${pattern.description} (Structure: ${pattern.structure})`
    ).join('\n');

    return {
      description: `Suggest appropriate ArchiMate architecture patterns for: ${requirements}`,
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `I need help choosing the right ArchiMate architecture pattern for my requirements.

## Requirements:
${requirements}

${context ? `## Additional Context:\n${context}\n` : ''}

## Available Model Templates:
${availablePatterns}

## Common Architecture Patterns:
${commonPatterns}

## Analysis Framework:
1. **Scope Analysis**: What layers are involved? (Business, Application, Technology)
2. **Complexity Assessment**: Simple process model vs. enterprise architecture
3. **Integration Needs**: Standalone vs. integrated systems
4. **Audience**: Business stakeholders vs. technical teams

## Recommendations Process:
Based on your requirements, I'll suggest:
1. **Primary Pattern**: Most appropriate template/pattern and why
2. **Key Elements**: Essential ArchiMate elements to include
3. **Critical Relationships**: Important relationships to model
4. **Implementation Steps**: How to build the model incrementally
5. **Validation Checklist**: What to verify in your final model

## Pattern Selection Criteria:
- **Simple business process** → Basic Business Model
- **Enterprise view** → Layered Architecture
- **System integration** → Application Integration Pattern
- **Cloud/microservices** → Microservices Pattern
- **Custom needs** → Combination approach

Please analyze my requirements and suggest the most appropriate ArchiMate pattern with specific implementation guidance.`
          }
        }
      ]
    };
  }

  /**
   * Find similar element types using fuzzy matching
   */
  private findSimilarElementTypes(input: string): string[] {
    const allTypes = Object.values(ElementType);
    const suggestions: Array<{ type: string; score: number }> = [];

    for (const type of allTypes) {
      const score = this.calculateSimilarity(input.toLowerCase(), type.toLowerCase());
      if (score > 0.4) { // Threshold for suggestions
        suggestions.push({ type, score });
      }
    }

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.type);
  }

  /**
   * Find similar relationship types using fuzzy matching
   */
  private findSimilarRelationshipTypes(input: string): string[] {
    const allTypes = Object.values(RelationshipType);
    const suggestions: Array<{ type: string; score: number }> = [];

    for (const type of allTypes) {
      const score = this.calculateSimilarity(input.toLowerCase(), type.toLowerCase());
      if (score > 0.4) { // Threshold for suggestions
        suggestions.push({ type, score });
      }
    }

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.type);
  }

  /**
   * Calculate similarity between two strings using Levenshtein distance
   */
  private calculateSimilarity(a: string, b: string): number {
    const distance = this.levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);

    if (maxLength === 0) return 1.0;

    // Convert distance to similarity score (0-1)
    return 1 - (distance / maxLength);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= b.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + cost // substitution
        );
      }
    }

    return matrix[b.length][a.length];
  }

  private async exportXML(args: XMLExportArgs) {
    const { elements, relationships, options = {} } = args;
    const { modelName = "ArchiMate Model", modelPurpose, includeViews = false, viewName } = options;
    console.error(`[DEBUG] exportXML called with ${elements.length} elements, ${relationships.length} relationships`);

    try {
      // Convert input to internal format
      const internalElements = elements.map(el => {
        try {
          return ElementFactory.create(el.type as ElementType, el.id, el.name);
        } catch (error) {
          const suggestions = this.findSimilarElementTypes(el.type);
          throw new Error(`Invalid element type '${el.type}' for element '${el.name}'${suggestions.length > 0 ? `. Did you mean: ${suggestions.join(', ')}?` : ''}`);
        }
      });

      const internalRelationships = relationships.map(rel => {
        try {
          return new Relationship(rel.id, rel.source, rel.target, rel.type as RelationshipType);
        } catch (error) {
          const suggestions = this.findSimilarRelationshipTypes(rel.type);
          throw new Error(`Invalid relationship type '${rel.type}' for relationship from '${rel.source}' to '${rel.target}'${suggestions.length > 0 ? `. Did you mean: ${suggestions.join(', ')}?` : ''}`);
        }
      });

      // Generate XML using the XmlExporter orchestrator
      const xmlExporter = createXmlExporter();
      const exportOptions = {
        modelId: `model-${Date.now()}`,
        modelName,
        modelPurpose,
        includeViews,
        viewOptions: viewName ? { viewName } : undefined,
        validateModel: true,
        strictValidation: false,
        includeStatistics: false
      };

      const exportResult = await xmlExporter.exportModel(internalElements, internalRelationships, exportOptions);

      // Include warnings in debug output if any
      if (exportResult.warnings && exportResult.warnings.length > 0) {
        console.error('[DEBUG] Export warnings:', exportResult.warnings);
      }

      const xmlOutput = exportResult.xml;

      return {
        content: [
          {
            type: "text",
            text: xmlOutput
          }
        ],
        isError: false
      };

    } catch (error) {
      console.error('[ERROR] XML export failed:', error);

      return {
        content: [
          {
            type: "text",
            text: `❌ **XML Export Failed**\n\n**Error:** ${error instanceof Error ? error.message : String(error)}\n\n**Troubleshooting:**\n- Verify all element types are valid ArchiMate 3.2 elements\n- Check that all relationship types are supported\n- Ensure element and relationship IDs are unique\n- Validate the model structure using the validate_archimate_model tool first`
          }
        ],
        isError: true
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ArchiMate MCP Server v1.0.0 running on stdio');
    console.error('Available tools: generate_archimate_diagram, validate_archimate_model, list_archimate_elements, list_archimate_relationships, export_archimate_xml');
    console.error('Available resources: archimate-elements, archimate-relationships, model-templates, quick-reference');
    console.error('Available prompts: create-business-model, validate-and-fix, suggest-architecture-pattern');
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ArchiMateServer();
  server.run().catch(console.error);
}

export { ArchiMateServer };
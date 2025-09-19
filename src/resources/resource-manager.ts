import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export interface ResourceInfo {
  name: string;
  description: string;
  uri: string;
  mimeType: string;
}

export class ResourceManager {
  private resourcePath: string;
  private resourceCache = new Map<string, any>();

  constructor() {
    // Get current file directory in ES module
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.resourcePath = __dirname;
  }

  /**
   * Get list of all available resources
   */
  getAvailableResources(): ResourceInfo[] {
    return [
      {
        name: "archimate-elements",
        description: "Complete ArchiMate 3.2 element reference with descriptions, usage guidance, and examples",
        uri: "doc://archimate/elements",
        mimeType: "application/json"
      },
      {
        name: "archimate-relationships",
        description: "ArchiMate relationship types, rules, validation matrix, and best practices",
        uri: "doc://archimate/relationships",
        mimeType: "application/json"
      },
      {
        name: "model-templates",
        description: "ArchiMate model templates, common patterns, and domain-specific examples",
        uri: "template://archimate/examples",
        mimeType: "application/json"
      },
      {
        name: "quick-reference",
        description: "Quick reference guide for ArchiMate modeling with common patterns and anti-patterns",
        uri: "guide://archimate/quickref",
        mimeType: "text/markdown"
      }
    ];
  }

  /**
   * Get resource content by URI
   */
  async getResourceContent(uri: string): Promise<string> {
    switch (uri) {
      case "doc://archimate/elements":
        return this.loadJsonResource("archimate-elements.json");

      case "doc://archimate/relationships":
        return this.loadJsonResource("archimate-relationships.json");

      case "template://archimate/examples":
        return this.loadJsonResource("model-templates.json");

      case "guide://archimate/quickref":
        return this.generateQuickReference();

      default:
        throw new Error(`Unknown resource URI: ${uri}`);
    }
  }

  /**
   * Search resources by query
   */
  async searchResources(query: string): Promise<{
    resourceName: string;
    matches: Array<{ path: string; content: string; score: number }>;
  }[]> {
    const results: any[] = [];
    const lowerQuery = query.toLowerCase();

    // Search elements
    const elements = await this.loadJsonResource("archimate-elements.json");
    const elementsData = JSON.parse(elements);
    const elementMatches = this.searchInObject(elementsData, lowerQuery, "elements");
    if (elementMatches.length > 0) {
      results.push({
        resourceName: "archimate-elements",
        matches: elementMatches
      });
    }

    // Search relationships
    const relationships = await this.loadJsonResource("archimate-relationships.json");
    const relationshipsData = JSON.parse(relationships);
    const relationshipMatches = this.searchInObject(relationshipsData, lowerQuery, "relationships");
    if (relationshipMatches.length > 0) {
      results.push({
        resourceName: "archimate-relationships",
        matches: relationshipMatches
      });
    }

    // Search templates
    const templates = await this.loadJsonResource("model-templates.json");
    const templatesData = JSON.parse(templates);
    const templateMatches = this.searchInObject(templatesData, lowerQuery, "templates");
    if (templateMatches.length > 0) {
      results.push({
        resourceName: "model-templates",
        matches: templateMatches
      });
    }

    return results;
  }

  /**
   * Get filtered elements by layer
   */
  async getElementsByLayer(layer: string): Promise<any> {
    const elements = await this.loadJsonResource("archimate-elements.json");
    const elementsData = JSON.parse(elements);

    if (layer && elementsData.layers[layer]) {
      return {
        layer: layer,
        description: elementsData.layers[layer].description,
        elements: elementsData.layers[layer].elements
      };
    }

    return elementsData;
  }

  /**
   * Get relationship information by type
   */
  async getRelationshipInfo(relationshipType: string): Promise<any> {
    const relationships = await this.loadJsonResource("archimate-relationships.json");
    const relationshipsData = JSON.parse(relationships);

    // Search through all categories for the relationship type
    for (const category of Object.values(relationshipsData.categories) as any[]) {
      if (category.relationships && category.relationships[relationshipType]) {
        return {
          type: relationshipType,
          category: category.description,
          ...category.relationships[relationshipType]
        };
      }
    }

    return null;
  }

  /**
   * Get model template by name
   */
  async getModelTemplate(templateName: string): Promise<any> {
    const templates = await this.loadJsonResource("model-templates.json");
    const templatesData = JSON.parse(templates);

    if (templatesData.templates[templateName]) {
      return templatesData.templates[templateName];
    }

    return null;
  }

  private async loadJsonResource(filename: string): Promise<string> {
    // Check cache first
    if (this.resourceCache.has(filename)) {
      return JSON.stringify(this.resourceCache.get(filename));
    }

    try {
      const filePath = join(this.resourcePath, filename);
      const content = readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(content);

      // Cache the parsed data
      this.resourceCache.set(filename, jsonData);

      return content;
    } catch (error) {
      throw new Error(`Failed to load resource ${filename}: ${error}`);
    }
  }

  private searchInObject(obj: any, query: string, context: string): Array<{ path: string; content: string; score: number }> {
    const matches: Array<{ path: string; content: string; score: number }> = [];

    const search = (current: any, path: string) => {
      if (typeof current === 'string') {
        const lowerContent = current.toLowerCase();
        if (lowerContent.includes(query)) {
          const score = this.calculateRelevanceScore(lowerContent, query);
          matches.push({
            path,
            content: current.length > 200 ? current.substring(0, 200) + '...' : current,
            score
          });
        }
      } else if (typeof current === 'object' && current !== null) {
        for (const [key, value] of Object.entries(current)) {
          const newPath = path ? `${path}.${key}` : key;
          search(value, newPath);
        }
      }
    };

    search(obj, context);

    // Sort by relevance score (higher is better)
    return matches.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  private calculateRelevanceScore(content: string, query: string): number {
    const queryWords = query.split(' ').filter(word => word.length > 0);
    let score = 0;

    for (const word of queryWords) {
      const regex = new RegExp(word, 'gi');
      const matches = content.match(regex);
      if (matches) {
        score += matches.length;
        // Bonus for exact matches
        if (content.toLowerCase().includes(query)) {
          score += 5;
        }
      }
    }

    return score;
  }

  private generateQuickReference(): string {
    return `# ArchiMate Quick Reference Guide

## Common Element Types by Layer

### Business Layer
- **BusinessActor**: Who performs business activities (Customer, Employee)
- **BusinessProcess**: Sequence of business activities (Order Processing)
- **BusinessService**: What the business offers (Customer Support)
- **BusinessObject**: Business information (Customer, Order, Invoice)

### Application Layer
- **ApplicationComponent**: Software applications (CRM, ERP)
- **ApplicationService**: Services provided by applications (Authentication Service)
- **ApplicationInterface**: How applications are accessed (REST API, Web UI)
- **DataObject**: Application data (Database, File, Message)

### Technology Layer
- **Node**: Computing resources (Server, Device)
- **TechnologyService**: Infrastructure services (Database Service, Web Server)
- **Artifact**: Deployable items (Application Binary, Configuration)

## Essential Relationships

- **Serving** (→): One element serves another
- **Realization** (—|>): How something abstract becomes concrete
- **Assignment** (◯—): Who/what is responsible for what
- **Composition** (◆—): Strong part-whole relationship
- **Access** (→): How elements access data/resources

## Quick Modeling Steps

1. **Start with Business**: Identify actors, processes, and services
2. **Add Applications**: What systems support the business?
3. **Include Technology**: What infrastructure supports applications?
4. **Connect Layers**: Use serving relationships between layers
5. **Validate**: Check relationships make sense

## Common Patterns

- **Layered Serving**: Technology → Application → Business
- **Service Realization**: Process realizes Service
- **Actor Assignment**: Actor assigned to Process
- **Data Access**: Process accesses Business Object

## Anti-Patterns to Avoid

- Business actors directly using technology elements
- Circular serving relationships
- Missing realization between abstract and concrete
- Overusing generic "Association" relationships
`;
  }
}
# @null-pointer/mcp-archimate

[![npm version](https://badge.fury.io/js/%40null-pointer%2Fmcp-archimate.svg)](https://badge.fury.io/js/%40null-pointer%2Fmcp-archimate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server that generates ArchiMate 3.2 enterprise architecture diagrams. This server enables AI assistants like Claude to create, validate, and visualize ArchiMate models through natural language interactions.

## What is ArchiMate?

ArchiMate is an open standard for enterprise architecture modeling that provides a visual language for describing, analyzing, and communicating enterprise architectures. It covers business, application, technology, and implementation domains across multiple architectural layers.

## Features

- **Complete ArchiMate 3.2 Support**: All 55+ element types across 7 architectural layers
- **Intelligent Validation**: Ensures diagram compliance with ArchiMate 3.2 specification
- **Mermaid Diagram Generation**: Creates beautiful, shareable diagrams
- **ArchiMate XML Export**: Generates ArchiMate 3.0 Open Exchange Format XML
- **Case-Insensitive Operations**: Flexible element and relationship naming
- **MCP Integration**: Seamless integration with Claude Desktop and other MCP clients

## Quick Start

### Installation

Install the package globally to use as an MCP server:

```bash
npm install -g @null-pointer/mcp-archimate
```

Or install locally in your project:

```bash
npm install @null-pointer/mcp-archimate
```

### Running the MCP Server

Start the server directly:

```bash
npx @null-pointer/mcp-archimate
```

Or if installed globally:

```bash
mcp-archimate
```

### Prerequisites

- Node.js (v16 or higher)

### Claude Desktop Integration

1. **Locate your Claude Desktop config file**:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add the MCP server configuration**:
   ```json
   {
     "mcpServers": {
       "archimate": {
         "command": "npx",
         "args": ["@null-pointer/mcp-archimate"]
       }
     }
   }
   ```

   Or if installed globally:
   ```json
   {
     "mcpServers": {
       "archimate": {
         "command": "mcp-archimate"
       }
     }
   }
   ```

3. **Restart Claude Desktop** to load the new MCP server

## Available Tools

The MCP server provides four main tools:

### 1. `generate_archimate_diagram`
Creates Mermaid diagrams from ArchiMate elements and relationships.

### 2. `validate_archimate_model`
Validates models against ArchiMate 3.2 specification rules.

### 3. `list_archimate_elements`
Lists available element types, optionally filtered by layer.

### 4. `list_archimate_relationships`
Lists all available relationship types.

## Usage Examples

### Basic Business Process Diagram

**Prompt**: "Create an ArchiMate diagram showing a customer ordering process with a customer actor, ordering process, and order management application"

**Expected Output**: A Mermaid diagram showing:
- Business Actor (Customer)
- Business Process (Ordering Process)
- Application Component (Order Management System)
- Appropriate relationships between them

### Application Architecture

**Prompt**: "Design an e-commerce application architecture with a web interface, API service, database, and payment gateway"

**Expected Elements**:
- Application Interface (Web UI)
- Application Service (API Service)
- Data Object (Customer Data, Order Data)
- Technology Service (Payment Gateway)
- Node (Database Server)

### Technology Infrastructure

**Prompt**: "Show me the technology infrastructure for a cloud-based system with load balancer, web servers, application servers, and database cluster"

**Expected Elements**:
- Device (Load Balancer)
- Node (Web Servers, App Servers)
- Technology Service (Database Service)
- Technology Collaboration (Cluster Communication)

## Sample Prompts for Claude

Here are effective prompts to use with Claude when the MCP server is configured:

### Discovery and Learning
```
"What ArchiMate elements are available in the business layer?"
"Show me all the relationship types I can use"
"What's the difference between a business process and business function?"
```

### Simple Diagrams
```
"Create a basic ArchiMate diagram showing how users interact with a mobile app"
"Design a simple business process diagram for customer onboarding"
"Show me the technology stack for a typical web application"
```

### Complex Scenarios
```
"Create an ArchiMate model for a digital banking transformation showing business processes, applications, and technology infrastructure"

"Design an enterprise architecture diagram for a retail company showing customer journey, supporting applications, and underlying technology"

"Model a cloud migration scenario showing current on-premise architecture and target cloud architecture"
```

### Validation and Analysis
```
"Validate this ArchiMate model and tell me if there are any specification violations"
"Check if a business actor can have a realization relationship with an application service"
"What relationships are valid between a business process and application component?"
```

## ArchiMate Layers and Elements

### Motivation Layer
Elements for describing stakeholder concerns, goals, and requirements
- Stakeholder, Driver, Assessment, Goal, Outcome, Principle, Requirement, Constraint

### Strategy Layer
Elements for strategic planning and capability modeling
- Resource, Capability, Value Stream, Course of Action

### Business Layer
Elements for business processes, actors, and services
- Business Actor, Business Role, Business Collaboration, Business Interface, Business Process, Business Function, Business Interaction, Business Event, Business Service, Business Object, Contract, Representation, Product

### Application Layer
Elements for application components and services
- Application Component, Application Collaboration, Application Interface, Application Function, Application Interaction, Application Process, Application Event, Application Service, Data Object

### Technology Layer
Elements for technology infrastructure and platforms
- Node, Device, System Software, Technology Collaboration, Technology Interface, Technology Function, Technology Process, Technology Interaction, Technology Event, Technology Service, Path, Communication Network, Artifact

### Physical Layer
Elements for physical facilities and equipment
- Equipment, Facility, Distribution Network, Material

### Implementation & Migration Layer
Elements for transformation planning
- Work Package, Deliverable, Implementation Event, Plateau, Gap

## Relationship Types

ArchiMate defines several relationship categories:

### Structural Relationships
- **Composition**: Part-of relationships
- **Aggregation**: Groups of elements
- **Assignment**: Allocation of behavior/structure
- **Realization**: Implementation relationships

### Dependency Relationships
- **Serving**: Service provision
- **Access**: Data/object access
- **Influence**: Impact relationships

### Dynamic Relationships
- **Triggering**: Temporal/causal sequences
- **Flow**: Information/material transfer

### Other Relationships
- **Specialization**: Generalization/specialization
- **Association**: Generic connections

## Best Practices

### When Creating Diagrams
1. **Start Simple**: Begin with core elements and add detail progressively
2. **Use Proper Layers**: Respect ArchiMate's layered architecture
3. **Validate Early**: Check relationships against the specification
4. **Name Clearly**: Use descriptive names for elements
5. **Focus Purpose**: Create diagrams with specific stakeholder viewpoints

### Effective Prompting
1. **Be Specific**: Mention the domain (business, application, technology)
2. **Provide Context**: Describe the scenario or use case
3. **Request Validation**: Ask Claude to validate complex models
4. **Iterate**: Build diagrams incrementally with feedback

### Common Patterns
- **Layered View**: Show relationships between business, application, and technology
- **Process Flow**: Model business processes with supporting applications
- **Service Orientation**: Focus on services and their relationships
- **Capability Mapping**: Link business capabilities to supporting elements

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing the MCP Server
```bash
node test-mcp.js
```

### Project Structure
```
src/
├── core/           # Core ArchiMate element classes
├── generator/      # Diagram generation logic
├── models/         # Type definitions and enums
├── validator/      # ArchiMate specification validation
└── server.ts       # MCP server implementation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license information here]

## Resources

- [ArchiMate 3.2 Specification](https://pubs.opengroup.org/architecture/archimate32-doc/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Mermaid Documentation](https://mermaid.js.org/)
- [Claude Desktop](https://claude.ai/desktop)

## Support

For issues, questions, or contributions, please visit the project repository or contact the maintainers.
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server for ArchiMate 3.2 diagram generation. The server creates Mermaid and Draw.io diagrams from ArchiMate elements and relationships, with validation against the ArchiMate 3.2 specification.

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript in the `dist/` directory
- **Start**: `npm run start` - Runs the compiled application
- **Development**: `npm run dev` - Runs the application with nodemon for hot reload
- **Test**: No test framework configured yet (test script exits with error)

## Architecture

The codebase follows a layered architecture:

### Core Layer (`src/core/`)
- **ElementFactory**: Central factory for creating all 55+ ArchiMate 3.2 elements across 7 layers
- **BaseElement**: Abstract base class for all ArchiMate elements
- **elements/**: Directory containing concrete implementations for each ArchiMate element type
- **Relationship**: Represents connections between elements with typed relationships

### Business Logic Layer
- **Generator** (`src/generator/`): Contains MermaidGenerator for creating Mermaid diagram code
- **Validator** (`src/validator/`): Validates element relationships against ArchiMate 3.2 specification using a validation matrix

### Models (`src/models/`)
- **archimate.ts**: Defines core enums and interfaces:
  - `Layer`: 7 ArchiMate layers (Motivation, Strategy, Business, Application, Technology, Physical, Implementation)
  - `ElementType`: All 55+ ArchiMate element types
  - `RelationshipType`: All valid relationship types (Structural, Dependency, Dynamic, Other)

## Key Design Patterns

### Factory Pattern
The `ElementFactory` uses a large switch statement to instantiate specific element classes based on `ElementType` enum values. Each element class extends `BaseElement` and is assigned to its appropriate ArchiMate layer.

### Validation Strategy
The validator uses a pre-computed validation matrix that maps valid relationship types between different element types, ensuring ArchiMate 3.2 specification compliance.

### Type Safety
Heavy use of TypeScript enums and interfaces ensures type safety across element creation, relationship building, and validation.

## Code Organization

- Element implementations are in `src/core/elements/` with one file per element type
- All elements follow the naming pattern: lowercase filename matching the element class name
- Element classes are imported and registered in the ElementFactory switch statement
- Relationship validation rules are centralized in `validation_matrix.ts`

## Current Implementation Status

Based on the requirements documentation:
- ✅ ArchiMate 3.2 element support (55+ elements across 7 layers)
- ✅ Mermaid diagram generation
- ✅ Input validation against ArchiMate 3.2 spec
- ✅ Case-insensitive support via enums
- ✅ MCP server integration (Model Context Protocol)
- ✅ Claude Desktop integration ready
- ❌ Draw.io generation (planned)
- ❌ XML export to ArchiMate Open Exchange Format (planned)
- ❌ PNG/SVG image generation (planned)
- ❌ HTTP server for diagram serving (planned)

## MCP Server Integration

The project now includes a fully functional MCP server (`src/server.ts`) that provides:

### Available Tools
1. **generate_archimate_diagram** - Creates Mermaid diagrams from ArchiMate elements and relationships
2. **validate_archimate_model** - Validates models against ArchiMate 3.2 specification
3. **list_archimate_elements** - Lists available element types (optionally filtered by layer)
4. **list_archimate_relationships** - Lists available relationship types

### Testing & Debugging
- Run `npm run build && npm run start` to start the MCP server
- Use `node test-mcp.js` to test server functionality
- Server logs debug information to stderr for troubleshooting
- Check `SETUP.md` for Claude Desktop integration instructions

## Working with Elements

When adding new elements:
1. Create the element class in `src/core/elements/[elementname].ts`
2. Add the element type to the `ElementType` enum in `src/models/archimate.ts`
3. Add the case to the ElementFactory switch statement
4. Update validation matrix if needed for relationship rules

## Working with Relationships

Relationship types are strictly typed and validated. The MermaidGenerator maps each relationship type to specific Mermaid arrow syntax. When adding new relationships, update both the RelationshipType enum and the arrow mapping.
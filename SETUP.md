# Claude Desktop Setup Guide

This guide explains how to integrate the ArchiMate MCP Server with Claude Desktop.

## Prerequisites

1. Ensure Node.js is installed
2. Build the project: `npm run build`
3. Claude Desktop application installed

## Claude Desktop Configuration

1. Locate your Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the ArchiMate server configuration:

```json
{
  "mcpServers": {
    "archimate": {
      "command": "node",
      "args": ["/Users/nullpointer/Code/MCP/MCP-Archimate/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Important**: Update the path in `args` to match your actual project location.

## Available Tools

Once configured, Claude Desktop will have access to these ArchiMate tools:

### 1. `generate_archimate_diagram`
Generate ArchiMate diagrams in Mermaid format.

**Example usage:**
```
Generate a diagram with these elements:
- Business Actor: Customer (id: customer)
- Business Process: Order Processing (id: order_proc)
- Application Component: Order System (id: order_sys)

And these relationships:
- Customer triggers Order Processing
- Order Processing is realized by Order System
```

### 2. `validate_archimate_model`
Validate ArchiMate elements and relationships against the ArchiMate 3.2 specification.

### 3. `list_archimate_elements`
List all available ArchiMate element types, optionally filtered by layer.

### 4. `list_archimate_relationships`
List all available ArchiMate relationship types.

## Testing the Integration

1. Restart Claude Desktop after updating the configuration
2. Start a new conversation
3. Try asking Claude to generate an ArchiMate diagram
4. Check the Claude Desktop developer console for any error messages

## Troubleshooting

### Server Not Starting
- Check that Node.js is in your PATH
- Verify the project builds successfully: `npm run build`
- Check the path in the configuration matches your project location

### Tool Not Available
- Restart Claude Desktop completely
- Check the configuration file syntax (valid JSON)
- Look for error messages in Claude Desktop's developer console

### Debugging
The server logs debug information to stderr. To see these logs:
1. Open Claude Desktop's developer console
2. Look for messages starting with `[DEBUG]`
3. Check for any error messages during tool execution

## Example Test Commands

Once integrated, you can test with prompts like:

1. **List Elements**: "Show me all available ArchiMate business layer elements"

2. **Generate Simple Diagram**:
   ```
   Create an ArchiMate diagram with:
   - A Business Actor called "Customer"
   - A Business Service called "Online Banking"
   - Show that the Customer uses the Online Banking service
   ```

3. **Validate Relationships**:
   ```
   Validate this ArchiMate model:
   Elements: BusinessActor (Customer), ApplicationComponent (Web App)
   Relationship: Customer serves Web App
   ```

The server will provide detailed feedback on validation and generate Mermaid diagrams that you can visualize.
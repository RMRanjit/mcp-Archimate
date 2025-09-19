import { ArchiMateServer } from './server.js';

// Start the MCP server
const server = new ArchiMateServer();
server.run().catch((error) => {
  console.error('Failed to start ArchiMate MCP server:', error);
  process.exit(1);
});
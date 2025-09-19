#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync } from 'fs';

// Test the MCP server by sending a simple request
function testMCPServer() {
  console.log('Testing ArchiMate MCP Server...');

  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd()
  });

  let responseData = '';

  server.stdout.on('data', (data) => {
    responseData += data.toString();
  });

  server.stderr.on('data', (data) => {
    console.log('Server log:', data.toString());
  });

  // Send a list tools request
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };

  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

  setTimeout(() => {
    // Send a test diagram generation request
    const generateDiagramRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'generate_archimate_diagram',
        arguments: {
          elements: [
            { id: 'ba1', name: 'Customer', type: 'BusinessActor' },
            { id: 'bp1', name: 'Order Processing', type: 'BusinessProcess' }
          ],
          relationships: [
            { id: 'r1', source: 'ba1', target: 'bp1', type: 'Triggering' }
          ],
          format: 'mermaid'
        }
      }
    };

    server.stdin.write(JSON.stringify(generateDiagramRequest) + '\n');

    setTimeout(() => {
      server.kill();
      console.log('Response data received:', responseData);
    }, 2000);
  }, 1000);

  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
  });
}

testMCPServer();
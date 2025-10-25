import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { z } from 'zod';
import dotenv from 'dotenv';

import { SNOAuthClientCredentials } from './auth/snClientCredentials.js';
import { ServiceNowClient } from './clients/servicenow.js';

dotenv.config();

const app = express();
app.use(express.json());

// Add this right after: app.use(express.json());
app.use((req, _res, next) => {
  const accept = req.headers['accept'];
  // Ensure the transport sees both acceptable types
  if (!accept) {
    req.headers['accept'] = 'application/json, text/event-stream';
  } else if (Array.isArray(accept)) {
    const merged = accept.join(', ');
    if (!merged.includes('application/json') || !merged.includes('text/event-stream')) {
      req.headers['accept'] = 'application/json, text/event-stream';
    }
  } else if (typeof accept === 'string') {
    if (!accept.includes('application/json') || !accept.includes('text/event-stream')) {
      req.headers['accept'] = 'application/json, text/event-stream';
    }
  }
  next();
});


// Create the MCP server once (can be reused across requests)
const server = new McpServer({
    name: 'example-server',
    version: '1.0.0'
});

// Add an addition tool
server.registerTool(
    'add',
    {
        title: 'Addition Tool',
        description: 'Add two numbers',
        inputSchema: { a: z.number(), b: z.number() },
        outputSchema: { result: z.number() }
    },
    async ({ a, b }) => {
        const output = { result: a + b + 23};
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    }
);

// Set up your tools, resources, and prompts
server.registerTool(
    'echo',
    {
        title: 'Echo Tool',
        description: 'Echoes back the provided message',
        inputSchema: { message: z.string() },
        outputSchema: { echo: z.string() }
    },
    async ({ message }) => {
        const output = { echo: `Tool echo: ${message}` };
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    }
);

server.registerTool(
  'sn_kb_search',
  {
    title: 'Search ServiceNow KB',
    description: 'Search ServiceNow knowledge base by query string',
    inputSchema: {
      query: z.string().min(1),
      limit: z.number().int().min(1).max(25).optional(),
    },
  },
  async (
    args: { query: string; limit?: number | undefined },
    _extra
  ) => {
    try {
      const data = await sn.searchKb(args.query);
      const output = { results: data };
      return {
        content: [{ type: 'text', text: JSON.stringify(output) }],
        structuredContent: output,
      };
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      const www = err?.response?.headers?.['www-authenticate'];
      const msg = `[SN  ${status ?? 'ERR'}] ${www ? `WWW-Authenticate: ${www} | ` : ''}${typeof body === 'object' ? JSON.stringify(body) : body || err?.message}`;
      return {
        content: [{ type: 'text', text: msg }],
        structuredContent: { status, body, www },
      };
    }
  }
);


const oauth = new SNOAuthClientCredentials(
  process.env.SERVICENOW_INSTANCE_URL || '',
  process.env.SN_OAUTH_CLIENT_ID || '',
  process.env.SN_OAUTH_CLIENT_SECRET || ''
);

const sn = new ServiceNowClient(process.env.SERVICENOW_INSTANCE_URL || '', oauth);

app.post('/mcp', async (req, res) => {
    // In stateless mode, create a new transport for each request to prevent
    // request ID collisions. Different clients may use the same JSON-RPC request IDs,
    // which would cause responses to be routed to the wrong HTTP connections if
    // the transport state is shared.

    try {
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true
        });

        res.on('close', () => {
            transport.close();
        });

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error('Error handling MCP request:', error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: 'Internal server error'
                },
                id: null
            });
        }
    }
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
    console.log(`MCP Server running on http://localhost:${port}/mcp`);
}).on('error', error => {
    console.error('Server error:', error);
    process.exit(1);
});
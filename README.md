# 🧩 Model Context Protocol (MCP) Server — TypeScript Example

A TypeScript-based **Model Context Protocol (MCP)** server for testing interoperability between local tools, VS Code Copilot Chat, and LLM agents.  
This repo tracks progress toward building a **spec-conformant, secure, observable, and production-ready** MCP server implementation.

---

## 🚀 Overview

This project demonstrates:

- A minimal **MCP server** using the official [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- Two transports:
  - `stdio` for local/editor integrations  
  - `Streamable HTTP` for ChatGPT / Copilot Chat connections
- Two examples:
  - **Tool:** `add` – performs addition  
  - **Resource:** `greeting` – returns a greeting message

---

## 🧰 Quick Start

```bash
# install dependencies
npm install

# run in dev mode
npm run dev

# build + start production
npm run build && npm start
```

### Verify the server
```bash
curl -s http://localhost:3000/healthz
# → OK

curl -s http://localhost:3000/mcp   -H "Content-Type: application/json"   -H "Accept: application/json, text/event-stream"   -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

---

## 🧩 Integration with VS Code (Copilot Chat)

1. **Create** `.vscode/mcp.json`
   ```json
   {
     "servers": {
       "my-server": {
         "type": "http",
         "url": "http://localhost:3000/mcp"
       }
     },
     "defaultContexts": [
       { "server": "my-server" }
     ]
   }
   ```
2. **Reload the window**  
   → You’ll see **my-server (MCP Server)** listed in Copilot Chat automatically.
3. **Test in chat**
   ```
   call add with { "a": 3, "b": 5 }
   ```
   → Should return your computed result.

---

## 🧠 Core Goals and Tracking

| Category | Goal | Description | Status |
|-----------|------|--------------|--------|
| **Core / Protocol-Level** | **Spec conformance (MVP)** | Minimal server exposing one tool and one resource, reachable via stdio & HTTP; verify `tools/list`, `tools/call`, `resources/list`. | ☐ Planned |
|  | **Typed schemas** | Define Zod schemas for tool inputs/outputs; reject invalid payloads with spec-compliant errors. | ☐ Planned |
|  | **Transport parity** | Support both stdio and streamable HTTP; document any behavior differences. | ☐ Planned |
|  | **Resources vs Tools clarity** | Show clear examples of read-only resources vs actionable tools. | ☐ Planned |
| **Security & Auth** | **API key auth (baseline)** | Require configurable header (`X-API-Key`), return 401/403, log failed attempts, support rotation. | ☐ Planned |
|  | **Defense in depth** | Add rate-limiting, timeouts, and sensitive data redaction. | ☐ Planned |
| **Reliability & Performance** | **Cancellation & timeouts** | Respect client cancellations and enforce server-side timeouts. | ☐ Planned |
|  | **Concurrency & backpressure** | Limit in-flight requests; gracefully shed load. | ☐ Planned |
|  | **Observability** | Structured logs (req id, latency, status) and basic metrics. | ☐ Planned |
| **Developer Experience** | **Clean modular design** | Separate transports, auth, handlers, and adapters. | ☐ Planned |
|  | **Test suite** | Unit, contract, and smoke tests for `tools/list`→`tools/call`. | ☐ Planned |
|  | **Local ergonomics** | One-command dev (`pnpm dev`), hot-reload, .env support, TS client. | ☐ Planned |
|  | **Docs** | Map each goal to relevant MCP docs and server files. | ☐ Planned |
| **Compatibility** | **Multi-client sanity checks** | Validate flows with TS client + Copilot Chat; note vendor quirks. | ☐ Planned |
|  | **Schema evolution** | Version tools (`tool@v1`) and deprecate gracefully. | ☐ Planned |
| **Productionization** | **Container & deploy** | Add Dockerfile, health/readiness checks, resource limits. | ☐ Planned |
|  | **Secrets & config** | Follow 12-factor principles; rotate keys without restart. | ☐ Planned |
|  | **Audit trail** | Log who/what/when for each call. | ☐ Planned |
|  | **SLOs** | Define availability & latency targets (99.9% / p95). | ☐ Planned |
| **Stretch** | **Streaming outputs** | Chunked responses for long jobs. | ☐ Planned |
|  | **Policy guardrails** | Per-tool quotas/scopes; dev/stage/prod profiles. | ☐ Planned |
|  | **Integration adapters** | Abstract external systems (ServiceNow, Workday, etc.). | ☐ Planned |
|  | **Docs site** | Auto-generate API/tool docs from Zod schemas. | ☐ Planned |

---

## 🧩 References

- **Model Context Protocol Spec:** [modelcontextprotocol.io/docs](https://modelcontextprotocol.io/docs)  
- **TypeScript SDK:** [github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)  
- **Copilot Chat MCP Docs:** [code.visualstudio.com/docs/copilot/customization/mcp-servers](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)

---

## 🛠️ Current Status

| Area | Notes |
|------|-------|
| Server | ✅ HTTP working, validated with VS Code Copilot Chat MCP integration. |
| Tools | ✅ `add`, `echo` registered. |
| Resources | ☐ `greeting` to be added/tested under `resources/list`. |
| Auth | ☐ API-key auth planned next. |
| Logging | ☐ Structured logging and metrics pending. |

---

## 🧾 License

MIT

---

_Tracking progress toward full Model Context Protocol compliance and best practices in TypeScript._

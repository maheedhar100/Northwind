# Run The MCP POC

## Terminal 1: Backend

```bash
cd Northwind/Employee
./mvnw spring-boot:run
```

## Terminal 2: MCP Server Without Write Access

```bash
cd Northwind/northwind-mcp
source .venv/bin/activate

MCP_TRANSPORT=streamable-http \
python -m northwind_mcp.server
```

MCP URL:

```text
http://localhost:8000/sse
```

## Terminal 2: MCP Server With Admin Write Access

```bash
cd Northwind/northwind-mcp
source .venv/bin/activate

MCP_TRANSPORT=streamable-http \
MCP_ENABLE_WRITE_TOOLS=true \
MCP_ADMIN_TOKEN="demo-admin-123" \
python -m northwind_mcp.server
```

Write tools require:

```json
{
  "admin_token": "demo-admin-123"
}
```

## Terminal 3: MCP Inspector

```bash
npx -y @modelcontextprotocol/inspector
```

Inspector connection:

```text
Transport: Streamable HTTP
URL: http://localhost:8000/sse
```

# Run The MCP on Northwind

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

## QWEN INTEGRATION - Terminal 4: Local Qwen/Ollama

```bash
ollama pull qwen2.5:7b
```

If Ollama is not already running:

```bash
ollama serve
```

Read question:

```bash
cd Northwind/northwind-mcp
source .venv/bin/activate

python examples/qwen_ollama_mcp_test.py "How much does the sales employee earn?"
```

Admin write test:

```bash
cd Northwind/northwind-mcp
source .venv/bin/activate

python examples/qwen_ollama_mcp_test.py \
  --tool add_employee \
  --admin-token "demo-admin-123" \
  --args '{"name":"Kashvi","email":"kashvi@example.com","department":"Marketing","salary":25000}'
```

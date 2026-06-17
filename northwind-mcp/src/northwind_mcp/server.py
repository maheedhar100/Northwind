from __future__ import annotations

import os

from mcp.server.fastmcp import FastMCP

from northwind_mcp.employee_response import employeeResponse
from northwind_mcp.intent_extractor import RuleBasedIntentExtractor
from northwind_mcp.tools import register_tools


def create_server() -> FastMCP:
    backend_url = os.getenv(
        "NORTHWIND_BACKEND_URL",
        os.getenv("BACKEND_URL", "http://localhost:8080"),
    )
    transport_note = (
        "Employee Management MCP Server. Bridges MCP tools to the local "
        "Spring Boot employee backend. Set NORTHWIND_BACKEND_URL or BACKEND_URL "
        "to point at another backend."
    )

    mcp = FastMCP(
        "Employee Management",
        instructions=transport_note,
        port=int(os.getenv("MCP_PORT", "8000")),
        streamable_http_path=os.getenv("MCP_STREAMABLE_HTTP_PATH", "/sse"),
        json_response=True,
    )
    employee_response = employeeResponse(base_url=backend_url)
    intent_extractor = RuleBasedIntentExtractor()
    register_tools(
        mcp,
        employee_response,
        intent_extractor,
        enable_write_tools=os.getenv("MCP_ENABLE_WRITE_TOOLS", "false").lower()
        in {"1", "true", "yes", "on"},
        admin_token=os.getenv("MCP_ADMIN_TOKEN"),
    )
    return mcp


def main() -> None:
    transport = os.getenv("MCP_TRANSPORT", "stdio")
    mcp = create_server()
    mcp.run(transport=transport)


if __name__ == "__main__":
    main()

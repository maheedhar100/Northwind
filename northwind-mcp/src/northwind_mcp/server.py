from __future__ import annotations

import os

from mcp.server.fastmcp import FastMCP

from northwind_mcp.employee_client import EmployeeClient
from northwind_mcp.intent_extractor import RuleBasedIntentExtractor
from northwind_mcp.tools import register_tools


def create_server() -> FastMCP:
    backend_url = os.getenv("NORTHWIND_BACKEND_URL", "http://localhost:8080")
    transport_note = (
        "Bridge MCP tools to the local Spring Boot employee backend. "
        "Set NORTHWIND_BACKEND_URL to point at another backend."
    )

    mcp = FastMCP("Northwind MCP Demo", instructions=transport_note, json_response=True)
    employee_client = EmployeeClient(base_url=backend_url)
    intent_extractor = RuleBasedIntentExtractor()
    register_tools(mcp, employee_client, intent_extractor)
    return mcp


def main() -> None:
    transport = os.getenv("MCP_TRANSPORT", "stdio")
    mcp = create_server()
    mcp.run(transport=transport)


if __name__ == "__main__":
    main()

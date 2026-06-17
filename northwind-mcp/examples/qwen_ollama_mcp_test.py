from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from typing import Any

import httpx
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client


DEFAULT_QUESTION = "How much does the sales employee earn?"


async def main() -> None:
    args = parse_args()
    question = args.question or DEFAULT_QUESTION
    mcp_url = os.getenv("EMPLOYEE_MCP_URL", "http://127.0.0.1:8000/sse")
    qwen_model = os.getenv("QWEN_MODEL", "qwen2.5:7b")
    ollama_url = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")

    if args.tool:
        tool_args = json.loads(args.args or "{}")
        if args.admin_token and "admin_token" not in tool_args:
            tool_args["admin_token"] = args.admin_token
        tool_result = await call_named_mcp_tool(mcp_url, args.tool, tool_args)
        prompt_question = f"Summarize the result of calling {args.tool}."
    else:
        tool_result = await call_business_request(mcp_url, question)
        prompt_question = question

    answer = await ask_qwen(ollama_url, qwen_model, prompt_question, tool_result)
    print(answer)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Call the Employee MCP server, then ask local Qwen/Ollama to summarize."
    )
    parser.add_argument(
        "question",
        nargs="?",
        help="Natural-language read question. Ignored when --tool is provided.",
    )
    parser.add_argument(
        "--tool",
        help="Direct MCP tool to call, such as add_employee or deactivate_employee.",
    )
    parser.add_argument(
        "--args",
        help="JSON object with tool arguments.",
    )
    parser.add_argument(
        "--admin-token",
        default=os.getenv("MCP_ADMIN_TOKEN"),
        help="Admin token for write tools. Defaults to MCP_ADMIN_TOKEN.",
    )
    return parser.parse_args()


async def call_business_request(mcp_url: str, question: str) -> dict[str, Any]:
    return await call_named_mcp_tool(
        mcp_url,
        "execute_business_request",
        {"question": question},
    )


async def call_named_mcp_tool(
    mcp_url: str, tool_name: str, arguments: dict[str, Any]
) -> dict[str, Any]:
    async with streamablehttp_client(mcp_url) as (read_stream, write_stream, _):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()
            result = await session.call_tool(tool_name, arguments)

    return result.model_dump(mode="json")


async def ask_qwen(
    ollama_url: str,
    model: str,
    question: str,
    tool_result: dict[str, Any],
) -> str:
    prompt = f"""You answer employee business questions using only the MCP tool result.

User question:
{question}

MCP tool result JSON:
{json.dumps(tool_result, indent=2)}

Give a concise final answer. If the tool result has no matching records, say that clearly.
"""

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{ollama_url.rstrip('/')}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
            },
        )
        response.raise_for_status()
        data = response.json()
        return str(data.get("response", "")).strip()


if __name__ == "__main__":
    asyncio.run(main())

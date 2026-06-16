from __future__ import annotations

from mcp.server.fastmcp import FastMCP

from northwind_mcp.employee_client import EmployeeClient
from northwind_mcp.intent_extractor import RuleBasedIntentExtractor
from northwind_mcp.schemas import IntentExtraction


def register_tools(
    mcp: FastMCP,
    employee_client: EmployeeClient,
    intent_extractor: RuleBasedIntentExtractor,
) -> None:
    @mcp.tool()
    async def get_employee(employee_id: int) -> dict:
        """Get one employee by employee id."""
        result = await employee_client.get_employee(employee_id)
        return result.model_dump(mode="json")

    @mcp.tool()
    async def list_employees() -> dict:
        """List all active employees."""
        result = await employee_client.get_all_employees()
        return result.model_dump(mode="json")

    @mcp.tool()
    async def search_employees(name: str) -> dict:
        """Search employees by name."""
        result = await employee_client.search_employees(name)
        return result.model_dump(mode="json")

    @mcp.tool()
    async def get_employees_by_department(department: str) -> dict:
        """Get employees in a department, such as Engineering or Sales."""
        result = await employee_client.get_employees_by_department(department)
        return result.model_dump(mode="json")

    @mcp.tool()
    async def get_employee_count() -> dict:
        """Get the total number of employees."""
        result = await employee_client.get_employee_count()
        return result.model_dump(mode="json")

    @mcp.tool()
    async def get_average_salary() -> dict:
        """Get the average employee salary."""
        result = await employee_client.get_average_salary()
        return result.model_dump(mode="json")

    @mcp.tool()
    async def get_employee_count_by_department() -> dict:
        """Get employee counts grouped by department."""
        result = await employee_client.get_employee_count_by_department()
        return result.model_dump(mode="json")

    @mcp.tool()
    async def parse_business_request(question: str) -> dict:
        """Extract an employee business intent and entities from natural language."""
        result = intent_extractor.extract(question)
        return result.model_dump(mode="json")

    @mcp.tool()
    async def execute_business_request(question: str) -> dict:
        """Extract intent from a question and execute the matching employee tool."""
        extraction = intent_extractor.extract(question)
        return await _execute_extracted_intent(extraction, employee_client)


async def _execute_extracted_intent(
    extraction: IntentExtraction, employee_client: EmployeeClient
) -> dict:
    intent = extraction.intent
    entities = extraction.entities

    if intent == "get_employee":
        result = await employee_client.get_employee(int(entities["employee_id"]))
    elif intent == "search_employees":
        result = await employee_client.search_employees(str(entities["name"]))
    elif intent == "get_employees_by_department":
        result = await employee_client.get_employees_by_department(
            str(entities["department"])
        )
    elif intent == "get_employee_count":
        result = await employee_client.get_employee_count()
    elif intent == "get_average_salary":
        result = await employee_client.get_average_salary()
    elif intent == "get_employee_count_by_department":
        result = await employee_client.get_employee_count_by_department()
    else:
        return {
            "intent": extraction.model_dump(mode="json"),
            "error": "Unsupported or unknown intent.",
        }

    return {
        "intent": extraction.model_dump(mode="json"),
        "result": _apply_projection(result.model_dump(mode="json"), extraction.projection),
    }


def _apply_projection(data: dict, projection: list[str]) -> dict:
    if not projection:
        return data

    if "employee" in data and isinstance(data["employee"], dict):
        return {
            **data,
            "employee": _project_record(data["employee"], projection),
        }

    if "employees" in data and isinstance(data["employees"], list):
        return {
            **data,
            "employees": [
                _project_record(employee, projection)
                for employee in data["employees"]
                if isinstance(employee, dict)
            ],
        }

    return data


def _project_record(record: dict, projection: list[str]) -> dict:
    return {field: record[field] for field in projection if field in record}

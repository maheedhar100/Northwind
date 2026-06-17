from __future__ import annotations

import secrets

from mcp.server.fastmcp import FastMCP

from northwind_mcp.employee_client import EmployeeApiError, EmployeeClient
from northwind_mcp.intent_extractor import RuleBasedIntentExtractor
from northwind_mcp.schemas import IntentExtraction


def register_tools(
    mcp: FastMCP,
    employee_client: EmployeeClient,
    intent_extractor: RuleBasedIntentExtractor,
    enable_write_tools: bool = False,
    admin_token: str | None = None,
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

    if enable_write_tools:
        @mcp.tool()
        async def add_employee(
            name: str,
            email: str,
            department: str,
            salary: float,
            admin_token: str,
        ) -> dict:
            """Create a new employee record. Requires a valid admin token."""
            _require_admin(admin_token, expected_token=register_tools_admin_token)
            result = await employee_client.add_employee(name, email, department, salary)
            return {
                "message": f"Added employee {result.employee.name}.",
                **result.model_dump(mode="json"),
            }

        @mcp.tool()
        async def update_employee(
            employee_id: int,
            name: str,
            email: str,
            department: str,
            salary: float,
            admin_token: str,
        ) -> dict:
            """Update an existing employee record. Requires a valid admin token."""
            _require_admin(admin_token, expected_token=register_tools_admin_token)
            result = await employee_client.update_employee(
                employee_id,
                name,
                email,
                department,
                salary,
            )
            return {
                "message": f"Updated employee {employee_id}.",
                **result.model_dump(mode="json"),
            }

        @mcp.tool()
        async def deactivate_employee(employee_id: int, admin_token: str) -> dict:
            """Soft-delete an employee by marking inactive. Requires a valid admin token."""
            _require_admin(admin_token, expected_token=register_tools_admin_token)
            await employee_client.deactivate_employee(employee_id)
            return {
                "employee_id": employee_id,
                "message": "Employee has been deactivated.",
            }

        @mcp.tool()
        async def delete_employee(employee_id: int, admin_token: str) -> dict:
            """Permanently delete an employee. Requires a valid admin token."""
            _require_admin(admin_token, expected_token=register_tools_admin_token)
            await employee_client.delete_employee(employee_id)
            return {
                "employee_id": employee_id,
                "message": "Employee has been permanently deleted.",
            }

    @mcp.resource("employees://all")
    async def resource_all_employees() -> str:
        """Read-only formatted snapshot of every active employee record."""
        try:
            result = await employee_client.get_all_employees()
        except EmployeeApiError as exc:
            return f"Error: {exc}"

        if not result.employees:
            return "No employees found."
        lines = [f"All employees ({result.count} total):\n"]
        lines.extend(_format_employee(employee.model_dump(mode="json")) for employee in result.employees)
        return "\n".join(lines)

    @mcp.resource("employees://{employee_id}")
    async def resource_employee_by_id(employee_id: str) -> str:
        """Read-only formatted details for one employee."""
        try:
            result = await employee_client.get_employee(int(employee_id))
        except ValueError:
            return f"Invalid employee ID '{employee_id}'."
        except EmployeeApiError as exc:
            return f"Error: {exc}"

        return _format_employee(result.employee.model_dump(mode="json"))

    @mcp.resource("stats://summary")
    async def resource_stats_summary() -> str:
        """Read-only formatted workforce statistics snapshot."""
        return await _format_statistics(employee_client)

    @mcp.prompt()
    def department_report(department: str) -> str:
        """Generate a structured report prompt for a specific department."""
        return f"""You are an HR analyst. Produce a concise department report for the '{department}' department.

Steps:
1. Call get_employees_by_department("{department}") to retrieve the current staff list.
2. Summarise: headcount, names and roles, salary range (min / max / average), and any notable patterns.
3. Flag anything that looks unusual, such as a wide salary spread or an unusually large or small team.
4. Close with one or two short recommendations if the data supports them.

Format the output with clear headings. Keep it factual and concise."""

    @mcp.prompt()
    def salary_analysis() -> str:
        """Generate a salary-analysis prompt for compensation review questions."""
        return """You are a compensation analyst. Analyse the current salary distribution across the workforce.

Steps:
1. Call get_average_salary() to get the overall average salary.
2. Call get_employee_count_by_department() to get department sizes.
3. Call list_employees() to get individual salaries.
4. Compute the mean and standard deviation. Flag employees whose salary is more than 1.5 standard deviations above or below the company mean.
5. Present findings in two sections: "Individual outliers" and "Department observations".
6. Close with a brief interpretation based only on the returned data.

Be objective and data-driven. Do not speculate beyond what the numbers show."""

    @mcp.prompt()
    def onboarding_helper() -> str:
        """Generate a guided onboarding prompt for adding a new employee."""
        return """You are an HR onboarding assistant. Collect the information needed to add a new employee.

Follow these steps in order:
1. Ask for the new employee's full name if not already provided.
2. Ask for their email address.
3. Ask which department they are joining. Call get_employees_by_department() for any department the user mentions to confirm current headcount.
4. Ask for their starting salary. If the user is unsure, call get_average_salary() for context.
5. Confirm all details with the user before proceeding:
   - Name
   - Email
   - Department
   - Salary
6. Only after the user confirms, call add_employee() with those details.
7. Report the result, including the new employee's assigned ID.

If the user provides all details upfront, confirm once before calling add_employee()."""

    register_tools_admin_token = admin_token


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


def _require_admin(provided_token: str, expected_token: str | None) -> None:
    if not expected_token:
        raise PermissionError("Write tools are enabled, but MCP_ADMIN_TOKEN is not set.")
    if not secrets.compare_digest(provided_token, expected_token):
        raise PermissionError("Invalid admin token.")


def _format_employee(employee: dict) -> str:
    parts = []
    if "id" in employee:
        parts.append(f"ID      : {employee['id']}")
    if "name" in employee:
        parts.append(f"Name    : {employee['name']}")
    if "department" in employee:
        parts.append(f"Dept    : {employee['department']}")
    if employee.get("role"):
        parts.append(f"Role    : {employee['role']}")
    if employee.get("location"):
        parts.append(f"Location: {employee['location']}")
    if employee.get("hireDate"):
        parts.append(f"Hired   : {employee['hireDate']}")
    if "salary" in employee:
        salary = employee["salary"]
        parts.append(
            f"Salary  : ${salary:,.2f}"
            if isinstance(salary, int | float)
            else f"Salary  : {salary}"
        )
    if "email" in employee:
        parts.append(f"Email   : {employee['email']}")
    if "active" in employee:
        parts.append(f"Active  : {'Yes' if employee['active'] else 'No'}")
    return "\n".join(parts) + "\n" + "-" * 30


async def _format_statistics(employee_client: EmployeeClient) -> str:
    try:
        count = await employee_client.get_employee_count()
        average_salary = await employee_client.get_average_salary()
        by_department = await employee_client.get_employee_count_by_department()
    except EmployeeApiError as exc:
        return f"Error: {exc}"

    lines = [
        "=== Workforce Statistics ===",
        f"Total employees : {count.count}",
        f"Average salary  : ${average_salary.average_salary:,.2f}",
        "",
        "By department:",
    ]
    for department, department_count in sorted(by_department.departments.items()):
        lines.append(f"  {department:<25} {department_count} employee(s)")
    return "\n".join(lines)

"""Employee Management MCP Server — wraps the REST backend at BACKEND_URL."""
import os
import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
    "Employee Management",
    port=int(os.getenv("MCP_PORT", "8000")),
    streamable_http_path="/sse",
)

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080")
BASE_URL = f"{BACKEND_URL}/api/employees"
TIMEOUT = 10.0

# Shared client — one connection pool for the lifetime of the server process.
_client = httpx.Client(timeout=TIMEOUT)


# ── helpers ───────────────────────────────────────────────────────────────────

def _unreachable(e: Exception) -> str:
    return f"Error: Could not reach the backend server. ({type(e).__name__}: {e})"


def _format_employee(emp: dict) -> str:
    parts = []
    if "id" in emp:
        parts.append(f"ID      : {emp['id']}")
    if "name" in emp:
        parts.append(f"Name    : {emp['name']}")
    if "department" in emp:
        parts.append(f"Dept    : {emp['department']}")
    if "position" in emp or "title" in emp:
        parts.append(f"Title   : {emp.get('position') or emp.get('title')}")
    if "salary" in emp:
        parts.append(
            f"Salary  : ${emp['salary']:,.2f}"
            if isinstance(emp["salary"], (int, float))
            else f"Salary  : {emp['salary']}"
        )
    if "email" in emp:
        parts.append(f"Email   : {emp['email']}")
    if "active" in emp:
        parts.append(f"Active  : {'Yes' if emp['active'] else 'No'}")
    return "\n".join(parts) + "\n" + "-" * 30


def _fetch_stats() -> str:
    """Shared stats fetch used by both the get_statistics tool and stats://summary resource."""
    try:
        count_r = _client.get(f"{BASE_URL}/count")
        avg_r = _client.get(f"{BASE_URL}/stats/average-salary")
        dept_r = _client.get(f"{BASE_URL}/stats/by-department")
        for resp in (count_r, avg_r, dept_r):
            resp.raise_for_status()
    except httpx.RequestError as e:
        return _unreachable(e)
    except httpx.HTTPStatusError as e:
        return f"Error: Server returned {e.response.status_code} for one of the stats endpoints."

    total = count_r.json()
    avg_salary = avg_r.json()
    by_dept = dept_r.json()

    lines = [
        "=== Workforce Statistics ===",
        f"Total employees : {total}",
        f"Average salary  : ${avg_salary:,.2f}"
        if isinstance(avg_salary, (int, float))
        else f"Average salary  : {avg_salary}",
        "",
        "By department:",
    ]
    if isinstance(by_dept, dict):
        for dept, count in sorted(by_dept.items()):
            lines.append(f"  {dept:<25} {count} employee(s)")
    elif isinstance(by_dept, list):
        for entry in by_dept:
            dept = entry.get("department", entry.get("name", "Unknown"))
            count = entry.get("count", entry.get("employeeCount", "?"))
            lines.append(f"  {dept:<25} {count} employee(s)")
    else:
        lines.append(f"  {by_dept}")
    return "\n".join(lines)


# ── read tools ────────────────────────────────────────────────────────────────

@mcp.tool()
def get_all_employees() -> str:
    """Return a list of all employees. Use this when the user wants to see every employee or browse the full employee roster."""
    try:
        r = _client.get(BASE_URL)
        r.raise_for_status()
        employees = r.json()
    except httpx.RequestError as e:
        return _unreachable(e)
    except httpx.HTTPStatusError as e:
        return f"Error: Server returned {e.response.status_code}."

    if not employees:
        return "No employees found."
    lines = [f"Found {len(employees)} employee(s):\n"]
    for emp in employees:
        lines.append(_format_employee(emp))
    return "\n".join(lines)


@mcp.tool()
def get_employee_by_id(employee_id: int) -> str:
    """Look up a single employee by their numeric ID. Use this when the user provides or mentions a specific employee ID."""
    try:
        r = _client.get(f"{BASE_URL}/{employee_id}")
        if r.status_code == 404:
            return f"No employee found with ID {employee_id}."
        r.raise_for_status()
        return _format_employee(r.json())
    except httpx.RequestError as e:
        return _unreachable(e)
    except httpx.HTTPStatusError as e:
        return f"Error: Server returned {e.response.status_code}."


@mcp.tool()
def search_employees_by_name(name: str) -> str:
    """Search for employees whose name contains the given string (case-insensitive). Use this when the user wants to find an employee by name or partial name."""
    try:
        r = _client.get(BASE_URL, params={"name": name})
        r.raise_for_status()
        employees = r.json()
    except httpx.RequestError as e:
        return _unreachable(e)
    except httpx.HTTPStatusError as e:
        return f"Error: Server returned {e.response.status_code}."

    if not employees:
        return f"No employees found matching '{name}'."
    lines = [f"Found {len(employees)} employee(s) matching '{name}':\n"]
    for emp in employees:
        lines.append(_format_employee(emp))
    return "\n".join(lines)


@mcp.tool()
def get_employees_by_department(department: str) -> str:
    """List all employees in a specific department. Use this when the user asks about a department's staff or headcount."""
    try:
        r = _client.get(f"{BASE_URL}/department/{department}")
        if r.status_code == 404:
            return f"No department found named '{department}'."
        r.raise_for_status()
        employees = r.json()
    except httpx.RequestError as e:
        return _unreachable(e)
    except httpx.HTTPStatusError as e:
        return f"Error: Server returned {e.response.status_code}."

    if not employees:
        return f"No employees found in department '{department}'."
    lines = [f"Department '{department}' — {len(employees)} employee(s):\n"]
    for emp in employees:
        lines.append(_format_employee(emp))
    return "\n".join(lines)


@mcp.tool()
def get_statistics() -> str:
    """Return a summary of workforce statistics: total headcount, average salary, and a breakdown by department. Use this when the user asks for an overview, summary, or stats about the workforce."""
    return _fetch_stats()


# ── write tools ───────────────────────────────────────────────────────────────

@mcp.tool()
def add_employee(name: str, email: str, department: str, salary: float) -> str:
    """Create a new employee record. Use this when the user wants to hire or add an employee.
    Sends a POST request to the backend and returns the newly created employee with their assigned ID."""
    try:
        r = _client.post(
            BASE_URL,
            json={"name": name, "email": email, "department": department, "salary": salary},
        )
        r.raise_for_status()
        emp = r.json()
    except httpx.RequestError as e:
        return _unreachable(e)
    except httpx.HTTPStatusError as e:
        body = e.response.text[:200]
        return f"Error: Server returned {e.response.status_code} while creating employee. {body}"

    emp_id = emp.get("id", "unknown")
    return f"Added employee {name} with ID {emp_id}.\n\n" + _format_employee(emp)


@mcp.tool()
def update_employee(employee_id: int, name: str, email: str, department: str, salary: float) -> str:
    """Update all fields of an existing employee record. Use this when the user wants to edit or change an employee's details.
    Sends a PUT request — all fields are replaced, so every field must be provided."""
    try:
        r = _client.put(
            f"{BASE_URL}/{employee_id}",
            json={"name": name, "email": email, "department": department, "salary": salary},
        )
        if r.status_code == 404:
            return f"No employee found with ID {employee_id}."
        r.raise_for_status()
        emp = r.json()
    except httpx.RequestError as e:
        return _unreachable(e)
    except httpx.HTTPStatusError as e:
        return f"Error: Server returned {e.response.status_code} while updating employee {employee_id}."

    return f"Updated employee {employee_id} ({name}).\n\n" + _format_employee(emp)


@mcp.tool()
def deactivate_employee(employee_id: int) -> str:
    """Soft-delete an employee by marking them as inactive. Use this when the user wants to deactivate or suspend an employee.
    This is reversible — the record is retained and can be reactivated later."""
    try:
        r = _client.patch(f"{BASE_URL}/{employee_id}/deactivate")
        if r.status_code == 404:
            return f"No employee found with ID {employee_id}."
        r.raise_for_status()
    except httpx.RequestError as e:
        return _unreachable(e)
    except httpx.HTTPStatusError as e:
        return f"Error: Server returned {e.response.status_code} while deactivating employee {employee_id}."

    return f"Employee {employee_id} has been deactivated (soft delete — record is retained and reversible)."


@mcp.tool()
def delete_employee(employee_id: int) -> str:
    """PERMANENTLY delete an employee record from the database. This is IRREVERSIBLE — the record cannot
    be recovered after deletion. Only use this when the user has explicitly confirmed they want a permanent,
    unrecoverable deletion. Prefer deactivate_employee for reversible removal."""
    try:
        r = _client.delete(f"{BASE_URL}/{employee_id}")
        if r.status_code == 404:
            return f"No employee found with ID {employee_id}."
        r.raise_for_status()
    except httpx.RequestError as e:
        return _unreachable(e)
    except httpx.HTTPStatusError as e:
        return f"Error: Server returned {e.response.status_code} while deleting employee {employee_id}."

    return f"Employee {employee_id} has been permanently deleted. This action cannot be undone."


# ── resources ─────────────────────────────────────────────────────────────────

@mcp.resource("employees://all")
def resource_all_employees() -> str:
    """Read-only snapshot of every employee record. Use as context when Claude needs the full roster before answering a question or making a decision."""
    try:
        r = _client.get(BASE_URL)
        r.raise_for_status()
        employees = r.json()
    except httpx.RequestError as e:
        return _unreachable(e)
    except httpx.HTTPStatusError as e:
        return f"Error: Server returned {e.response.status_code}."

    if not employees:
        return "No employees found."
    lines = [f"All employees ({len(employees)} total):\n"]
    for emp in employees:
        lines.append(_format_employee(emp))
    return "\n".join(lines)


@mcp.resource("employees://{employee_id}")
def resource_employee_by_id(employee_id: str) -> str:
    """Read-only details for a single employee identified by their numeric ID. Use as context when Claude needs to reference one specific employee's record."""
    try:
        r = _client.get(f"{BASE_URL}/{employee_id}")
        if r.status_code == 404:
            return f"No employee found with ID {employee_id}."
        r.raise_for_status()
        return _format_employee(r.json())
    except httpx.RequestError as e:
        return _unreachable(e)
    except httpx.HTTPStatusError as e:
        return f"Error: Server returned {e.response.status_code}."


@mcp.resource("stats://summary")
def resource_stats_summary() -> str:
    """Read-only workforce statistics snapshot: total headcount, average salary, and per-department breakdown. Use as context when Claude needs current workforce metrics."""
    return _fetch_stats()


# ── prompt templates ──────────────────────────────────────────────────────────

@mcp.prompt()
def department_report(department: str) -> str:
    """Generate a structured report prompt for a specific department.
    Use this when the user asks for a department summary, headcount analysis, or team overview."""
    return f"""You are an HR analyst. Produce a concise department report for the '{department}' department.

Steps:
1. Call get_employees_by_department("{department}") to retrieve the current staff list.
2. Summarise: headcount, names and roles, salary range (min / max / average), and any notable patterns.
3. Flag anything that looks unusual — e.g. a very wide salary spread, an unusually large or small team.
4. Close with one or two short recommendations (hiring gaps, pay equity, etc.) if the data supports them.

Format the output with clear headings. Keep it factual and concise."""


@mcp.prompt()
def salary_analysis() -> str:
    """Generate a salary-analysis prompt that guides Claude to identify outliers across the workforce.
    Use this when the user asks about pay equity, compensation review, or salary fairness."""
    return """You are a compensation analyst. Analyse the current salary distribution across the workforce.

Steps:
1. Call get_statistics() to get the overall average salary and per-department breakdown.
2. Call get_all_employees() to get individual salaries.
3. Compute the mean and standard deviation. Flag any employee whose salary is more than 1.5 standard deviations above or below the company mean as an outlier.
4. Also flag any department whose average salary differs from the company average by more than 20%.
5. Present findings in two sections: "Individual outliers" and "Department outliers", each as a short table (Name / Dept / Salary / Deviation).
6. Close with a brief interpretation: are the outliers explained by seniority or department norms, or do they warrant review?

Be objective and data-driven. Do not speculate beyond what the numbers show."""


@mcp.prompt()
def onboarding_helper() -> str:
    """Generate a guided onboarding prompt that walks Claude through adding a new employee correctly.
    Use this when the user wants to add a new hire and may not know all the required fields."""
    return """You are an HR onboarding assistant. Your job is to collect the necessary information and add a new employee to the system.

Follow these steps in order:
1. Ask the user for the new employee's full name if not already provided.
2. Ask for their email address.
3. Ask which department they are joining. Call get_employees_by_department() for any department the user mentions to confirm it exists and show current headcount.
4. Ask for their starting salary. If the user is unsure, call get_statistics() and share the average salary for context.
5. Confirm all details with the user before proceeding:
   - Name: <value>
   - Email: <value>
   - Department: <value>
   - Salary: <value>
6. Only after the user confirms, call add_employee() with those details.
7. Report the result, including the new employee's assigned ID.

If the user provides all details upfront, confirm once before calling add_employee()."""


if __name__ == "__main__":
    mcp.run(transport=os.getenv("MCP_TRANSPORT", "stdio"))

# Employee Management MCP Server

A [FastMCP](https://github.com/jlowin/fastmcp) server that exposes an Employee Management REST API to Claude as tools, resources, and prompt templates.

---

## Prerequisites

- Python 3.10+
- The backend REST API running at `http://localhost:8080`
- `mcp[cli]` and `httpx` installed (see below)

---

## Install

```bash
# 1. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS / Linux

# 2. Install dependencies
pip install "mcp[cli]" httpx
```

---

## Run

### Development (interactive MCP inspector)

```bash
mcp dev server.py
```

Open the URL printed in the terminal to inspect and call tools interactively.

### Override the backend URL

```bash
set BACKEND_URL=http://my-other-host:9090   # Windows
# export BACKEND_URL=http://my-other-host:9090  # macOS / Linux
mcp dev server.py
```

---

## Register with Claude Desktop

Add the following block to your `claude_desktop_config.json`
(`%APPDATA%\Claude\claude_desktop_config.json` on Windows,
`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "employee-management": {
      "command": "C:\\absolute\\path\\to\\venv\\Scripts\\python.exe",
      "args": ["C:\\absolute\\path\\to\\MCP_NORTHWIND\\server.py"],
      "env": {
        "BACKEND_URL": "http://localhost:8080"
      }
    }
  }
}
```

Replace both `C:\\absolute\\path\\to\\...` placeholders with the real paths on your machine, then restart Claude Desktop.

---

## What's exposed

### Tools (actions Claude can invoke)

| Tool | Description |
|---|---|
| `get_all_employees` | List every employee |
| `get_employee_by_id` | Fetch one employee by numeric ID |
| `search_employees_by_name` | Search by name substring |
| `get_employees_by_department` | List staff in a department |
| `get_statistics` | Headcount, average salary, per-department breakdown |
| `add_employee` | Create a new employee (POST) |
| `update_employee` | Replace all fields on an existing employee (PUT) |
| `deactivate_employee` | Soft-delete — reversible (PATCH) |
| `delete_employee` | **Permanent** hard delete — irreversible (DELETE) |

### Resources (read-only context)

| URI | Description |
|---|---|
| `employees://all` | Full employee roster |
| `employees://{id}` | Single employee by ID |
| `stats://summary` | Current workforce statistics |

### Prompt templates

| Prompt | Description |
|---|---|
| `department_report(department)` | Structured department summary with recommendations |
| `salary_analysis()` | Flags individual and department-level salary outliers |
| `onboarding_helper()` | Step-by-step guided flow for adding a new hire |

---

## Example requests

Ask Claude these questions once the server is registered:

1. **"Show me everyone in the Engineering department."**
   → triggers `get_employees_by_department("Engineering")`

2. **"Add a new employee: Jane Doe, jane@example.com, Marketing, salary $72,000."**
   → triggers `add_employee` and returns the new employee ID

3. **"Give me a full report on the Sales department."**
   → uses the `department_report` prompt template, then calls `get_employees_by_department`

4. **"Are there any salary outliers in the company?"**
   → uses the `salary_analysis` prompt, calls `get_statistics` and `get_all_employees`

5. **"I need to onboard a new hire."**
   → uses the `onboarding_helper` prompt to walk you through collecting details before calling `add_employee`

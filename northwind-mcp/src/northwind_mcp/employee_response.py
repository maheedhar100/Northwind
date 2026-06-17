from __future__ import annotations

from collections.abc import Mapping
from typing import Any

import httpx

from northwind_mcp.schemas import (
    AverageSalaryResponse,
    CountResponse,
    DepartmentCountResponse,
    Employee,
    EmployeeListResponse,
    EmployeeResponse,
)


DEPARTMENT_ALIASES = {
    "eng": "Engineering",
    "engineering": "Engineering",
    "sales": "Sales",
    "hr": "HR",
    "human resources": "HR",
    "finance": "Finance",
    "marketing": "Marketing",
    "operations": "Operations",
}


class EmployeeApiError(RuntimeError):
    """Raised when the Spring Boot employee API cannot satisfy a request."""


class employeeResponse:
    def __init__(self, base_url: str = "http://localhost:8080", timeout: float = 10.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    async def get_employee(self, employee_id: int) -> EmployeeResponse:
        data = await self._get_json(f"/api/employees/{employee_id}")
        return EmployeeResponse(employee=Employee.model_validate(data))

    async def get_all_employees(self) -> EmployeeListResponse:
        data = await self._get_json("/api/employees")
        employees = [Employee.model_validate(item) for item in data]
        return EmployeeListResponse(employees=employees, count=len(employees))

    async def search_employees(self, name: str) -> EmployeeListResponse:
        data = await self._get_json("/api/employees/search", params={"name": name})
        employees = [Employee.model_validate(item) for item in data]
        return EmployeeListResponse(employees=employees, count=len(employees))

    async def get_employees_by_department(self, department: str) -> EmployeeListResponse:
        normalized_department = normalize_department(department)
        data = await self._get_json(
            f"/api/employees/department/{normalized_department}"
        )
        employees = [Employee.model_validate(item) for item in data]
        return EmployeeListResponse(employees=employees, count=len(employees))

    async def get_employee_count(self) -> CountResponse:
        data = await self._get_json("/api/employees/count")
        return CountResponse(count=int(data))

    async def get_average_salary(self) -> AverageSalaryResponse:
        data = await self._get_json("/api/employees/stats/average-salary")
        return AverageSalaryResponse(average_salary=float(data))

    async def get_employee_count_by_department(self) -> DepartmentCountResponse:
        data = await self._get_json("/api/employees/stats/by-department")
        return DepartmentCountResponse(
            departments={str(key): int(value) for key, value in data.items()}
        )

    async def add_employee(
        self, name: str, email: str, department: str, salary: float
    ) -> EmployeeResponse:
        data = await self._request_json(
            "POST",
            "/api/employees",
            json={
                "name": name,
                "email": email,
                "department": normalize_department(department),
                "salary": salary,
            },
        )
        return EmployeeResponse(employee=Employee.model_validate(data))

    async def update_employee(
        self,
        employee_id: int,
        name: str,
        email: str,
        department: str,
        salary: float,
    ) -> EmployeeResponse:
        data = await self._request_json(
            "PUT",
            f"/api/employees/{employee_id}",
            json={
                "name": name,
                "email": email,
                "department": normalize_department(department),
                "salary": salary,
            },
        )
        return EmployeeResponse(employee=Employee.model_validate(data))

    async def deactivate_employee(self, employee_id: int) -> None:
        await self._request_no_content("PATCH", f"/api/employees/{employee_id}/deactivate")

    async def delete_employee(self, employee_id: int) -> None:
        await self._request_no_content("DELETE", f"/api/employees/{employee_id}")

    async def _get_json(
        self, path: str, params: Mapping[str, Any] | None = None
    ) -> Any:
        return await self._request_json("GET", path, params=params)

    async def _request_json(
        self,
        method: str,
        path: str,
        params: Mapping[str, Any] | None = None,
        json: Mapping[str, Any] | None = None,
    ) -> Any:
        url = f"{self.base_url}{path}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(method, url, params=params, json=json)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as exc:
            raise EmployeeApiError(
                f"Employee API returned HTTP {exc.response.status_code} for {url}"
            ) from exc
        except httpx.RequestError as exc:
            raise EmployeeApiError(
                f"Could not connect to Employee API at {self.base_url}. "
                "Start the Spring Boot app first."
            ) from exc

    async def _request_no_content(self, method: str, path: str) -> None:
        url = f"{self.base_url}{path}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(method, url)
                response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise EmployeeApiError(
                f"Employee API returned HTTP {exc.response.status_code} for {url}"
            ) from exc
        except httpx.RequestError as exc:
            raise EmployeeApiError(
                f"Could not connect to Employee API at {self.base_url}. "
                "Start the Spring Boot app first."
            ) from exc


def normalize_department(department: str) -> str:
    cleaned = " ".join(department.strip().split())
    alias = DEPARTMENT_ALIASES.get(cleaned.lower())
    if alias:
        return alias
    return cleaned.title()

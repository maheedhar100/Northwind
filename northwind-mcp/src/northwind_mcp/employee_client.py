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


class EmployeeApiError(RuntimeError):
    """Raised when the Spring Boot employee API cannot satisfy a request."""


class EmployeeClient:
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
        data = await self._get_json(f"/api/employees/department/{department}")
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

    async def _get_json(
        self, path: str, params: Mapping[str, Any] | None = None
    ) -> Any:
        url = f"{self.base_url}{path}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
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

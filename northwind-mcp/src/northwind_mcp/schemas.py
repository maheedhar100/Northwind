from __future__ import annotations

from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


EmployeeStatus = Literal["Active", "Inactive"]
IntentName = Literal[
    "get_employee",
    "search_employees",
    "get_employees_by_department",
    "get_employee_count",
    "get_average_salary",
    "get_employee_count_by_department",
    "unknown",
]


class Employee(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: int
    name: str
    email: str
    department: str
    role: str | None = None
    location: str | None = None
    hireDate: date | None = None
    salary: float
    active: bool = True

    @property
    def status(self) -> EmployeeStatus:
        return "Active" if self.active else "Inactive"


class EmployeeResponse(BaseModel):
    employee: Employee


class EmployeeListResponse(BaseModel):
    employees: list[Employee]
    count: int


class CountResponse(BaseModel):
    count: int


class AverageSalaryResponse(BaseModel):
    average_salary: float


class DepartmentCountResponse(BaseModel):
    departments: dict[str, int]


class BusinessRequest(BaseModel):
    question: str = Field(..., min_length=1)


class IntentExtraction(BaseModel):
    intent: IntentName
    entities: dict[str, Any] = Field(default_factory=dict)
    confidence: float = Field(ge=0.0, le=1.0)
    explanation: str


class ToolError(BaseModel):
    error: str
    detail: str | None = None

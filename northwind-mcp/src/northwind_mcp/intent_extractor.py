from __future__ import annotations

import re

from northwind_mcp.schemas import IntentExtraction


KNOWN_DEPARTMENTS = {
    "engineering": "Engineering",
    "sales": "Sales",
    "hr": "HR",
    "human resources": "HR",
    "finance": "Finance",
    "marketing": "Marketing",
    "operations": "Operations",
}


class RuleBasedIntentExtractor:
    def extract(self, question: str) -> IntentExtraction:
        normalized = " ".join(question.lower().strip().split())

        employee_id = self._extract_employee_id(normalized)
        if employee_id is not None:
            return IntentExtraction(
                intent="get_employee",
                entities={"employee_id": employee_id},
                confidence=0.9,
                explanation="Found an employee id in the question.",
            )

        if "average salary" in normalized or "avg salary" in normalized:
            return IntentExtraction(
                intent="get_average_salary",
                entities={},
                confidence=0.9,
                explanation="Question asks for average salary.",
            )

        if "count by department" in normalized or (
            "department" in normalized and ("count" in normalized or "stats" in normalized)
        ):
            return IntentExtraction(
                intent="get_employee_count_by_department",
                entities={},
                confidence=0.85,
                explanation="Question asks for employee counts grouped by department.",
            )

        if "count" in normalized or "how many employees" in normalized:
            return IntentExtraction(
                intent="get_employee_count",
                entities={},
                confidence=0.8,
                explanation="Question asks for total employee count.",
            )

        department = self._extract_department(normalized)
        if department is not None:
            return IntentExtraction(
                intent="get_employees_by_department",
                entities={"department": department},
                confidence=0.82,
                explanation="Found a known department in the question.",
            )

        name = self._extract_name(normalized)
        if name is not None:
            return IntentExtraction(
                intent="search_employees",
                entities={"name": name},
                confidence=0.65,
                explanation="Found a likely employee name search phrase.",
            )

        return IntentExtraction(
            intent="unknown",
            entities={},
            confidence=0.2,
            explanation="No supported employee intent matched the question.",
        )

    def _extract_employee_id(self, text: str) -> int | None:
        match = re.search(r"(?:employee|emp|id)\s*#?\s*(\d+)", text)
        if match:
            return int(match.group(1))
        return None

    def _extract_department(self, text: str) -> str | None:
        for key, value in KNOWN_DEPARTMENTS.items():
            if key in text:
                return value
        department_match = re.search(r"department\s+([a-z][a-z\s-]{1,40})", text)
        if department_match:
            return department_match.group(1).strip().title()
        return None

    def _extract_name(self, text: str) -> str | None:
        patterns = [
            r"(?:find|search|show|get)\s+(?:employee\s+)?(?:named\s+)?([a-z][a-z\s.-]{1,60})",
            r"employee\s+name\s+([a-z][a-z\s.-]{1,60})",
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                name = match.group(1).strip()
                for stop_word in (" in ", " from ", " with "):
                    name = name.split(stop_word, 1)[0].strip()
                if name and name not in {"employees", "employee"}:
                    return name.title()
        return None

"""Shared assumptions model and in-memory storage for configurable defaults."""
from __future__ import annotations

from typing import Dict

from pydantic import BaseModel, Field, validator


class Assumptions(BaseModel):
    """Default assumptions for calculations."""

    vacancy_percent: float = Field(5.0, ge=0, le=100, description="Expected vacancy rate as a percentage of rent.")
    maintenance_percent: float = Field(8.0, ge=0, le=100, description="Monthly maintenance budget as a percentage of rent.")
    management_percent: float = Field(8.0, ge=0, le=100, description="Property management cost as a percentage of rent.")
    property_tax_percent: float = Field(
        1.2, ge=0, description="Annual property tax as a percentage of property value.")
    insurance_percent: float = Field(
        0.6, ge=0, description="Annual insurance cost as a percentage of property value.")
    appreciation_percent_annual: float = Field(3.0, ge=0, description="Annual property value appreciation assumption.")
    rent_growth_percent_annual: float = Field(2.5, ge=0, description="Annual rent growth assumption.")

    @validator(
        "vacancy_percent",
        "maintenance_percent",
        "management_percent",
        "property_tax_percent",
        "insurance_percent",
        "appreciation_percent_annual",
        "rent_growth_percent_annual",
    )
    def _non_negative(cls, value: float) -> float:
        if value < 0:
            raise ValueError("Percent values must be non-negative.")
        return value


_assumptions_store: Dict[str, Assumptions] = {"defaults": Assumptions()}


def get_assumptions() -> Assumptions:
    """Return the current in-memory assumptions."""

    return _assumptions_store["defaults"]


def update_assumptions(payload: Assumptions) -> Assumptions:
    """Update the in-memory assumptions and return the new copy."""

    _assumptions_store["defaults"] = payload
    return _assumptions_store["defaults"]

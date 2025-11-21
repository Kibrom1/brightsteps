"""Lightweight stand-in for pydantic for offline testing purposes."""
from __future__ import annotations

import inspect
import re
from dataclasses import dataclass
from typing import Any, Callable, Dict, Optional


class ValidationError(Exception):
    """Simple validation error."""


__version__ = "0.0.0"

@dataclass
class FieldInfo:
    default: Any = None
    gt: Optional[float] = None
    ge: Optional[float] = None
    lt: Optional[float] = None
    le: Optional[float] = None
    description: Optional[str] = None
    regex: Optional[str] = None
    min_length: Optional[int] = None
    max_length: Optional[int] = None


def Field(
    default: Any = None,
    *,
    gt: float | None = None,
    ge: float | None = None,
    lt: float | None = None,
    le: float | None = None,
    description: str | None = None,
    regex: str | None = None,
    min_length: int | None = None,
    max_length: int | None = None,
):
    return FieldInfo(
        default=default,
        gt=gt,
        ge=ge,
        lt=lt,
        le=le,
        description=description,
        regex=regex,
        min_length=min_length,
        max_length=max_length,
    )


def validator(*fields: str):
    def decorator(func: Callable):
        func._validator_fields = fields  # type: ignore[attr-defined]
        return func
    return decorator


class BaseModel:
    __validators__: Dict[str, Callable] = {}

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        cls.__validators__ = {}
        for name, attr in cls.__dict__.items():
            if hasattr(attr, "_validator_fields"):
                for field in attr._validator_fields:  # type: ignore[attr-defined]
                    cls.__validators__[field] = attr

    def __init__(self, **data: Any):
        annotations = getattr(self, "__annotations__", {})
        for field_name, field_type in annotations.items():
            field_info = getattr(self.__class__, field_name, None)
            if isinstance(field_info, FieldInfo):
                default = field_info.default
            else:
                default = getattr(self.__class__, field_name, inspect._empty)
                field_info = None

            if field_name in data:
                value = data[field_name]
            elif default is not inspect._empty:
                value = default
            else:
                raise ValidationError(f"Field '{field_name}' is required")

            if value is inspect._empty or value is Ellipsis:
                raise ValidationError(f"Field '{field_name}' is required")

            if field_info:
                if field_info.gt is not None and not value > field_info.gt:
                    raise ValidationError(f"{field_name} must be greater than {field_info.gt}")
                if field_info.ge is not None and not value >= field_info.ge:
                    raise ValidationError(f"{field_name} must be greater than or equal to {field_info.ge}")
                if field_info.lt is not None and not value < field_info.lt:
                    raise ValidationError(f"{field_name} must be less than {field_info.lt}")
                if field_info.le is not None and not value <= field_info.le:
                    raise ValidationError(f"{field_name} must be less than or equal to {field_info.le}")
                if field_info.regex is not None and not re.match(field_info.regex, str(value)):
                    raise ValidationError(f"{field_name} does not match required pattern")
                if field_info.min_length is not None and len(str(value)) < field_info.min_length:
                    raise ValidationError(f"{field_name} is shorter than minimum length {field_info.min_length}")
                if field_info.max_length is not None and len(str(value)) > field_info.max_length:
                    raise ValidationError(f"{field_name} exceeds maximum length {field_info.max_length}")

            validator_fn = self.__class__.__validators__.get(field_name)
            if validator_fn:
                try:
                    value = validator_fn(self.__class__, value, data)
                except TypeError:
                    value = validator_fn(self.__class__, value)

            setattr(self, field_name, value)

    def dict(self) -> Dict[str, Any]:
        return {k: getattr(self, k) for k in getattr(self, "__annotations__", {})}

    def __iter__(self):
        for key in self.__annotations__:
            yield key, getattr(self, key)

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}({self.dict()})"

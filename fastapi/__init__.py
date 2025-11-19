"""Minimal FastAPI-compatible stubs for offline execution in tests."""
from __future__ import annotations

import inspect
from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Optional

from pydantic import ValidationError

__version__ = "0.0.0"


class HTTPException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


@dataclass
class Route:
    path: str
    method: str
    endpoint: Callable


class APIRouter:
    def __init__(self, prefix: str = "", tags: Optional[List[str]] = None):
        self.prefix = prefix
        self.tags = tags or []
        self.routes: List[Route] = []

    def _add_route(self, path: str, method: str, endpoint: Callable) -> Callable:
        full_path = f"{self.prefix}{path}"
        self.routes.append(Route(path=full_path, method=method.upper(), endpoint=endpoint))
        return endpoint

    def get(self, path: str, **kwargs):
        def decorator(func: Callable):
            return self._add_route(path, "GET", func)

        return decorator

    def post(self, path: str, **kwargs):
        def decorator(func: Callable):
            return self._add_route(path, "POST", func)

        return decorator

    def put(self, path: str, **kwargs):
        def decorator(func: Callable):
            return self._add_route(path, "PUT", func)

        return decorator


class FastAPI:
    def __init__(self, title: str = "", version: str = ""):
        self.title = title
        self.version = version
        self.routes: List[Route] = []

    def include_router(self, router: APIRouter):
        self.routes.extend(router.routes)

    def get(self, path: str, **kwargs):
        def decorator(func: Callable):
            self.routes.append(Route(path=path, method="GET", endpoint=func))
            return func

        return decorator


class Response:
    def __init__(self, status_code: int, content: Any):
        self.status_code = status_code
        self._content = content

    def json(self):
        return self._content


class RequestValidationError(Exception):
    pass


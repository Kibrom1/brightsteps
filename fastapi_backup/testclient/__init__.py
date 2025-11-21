"""Simplified TestClient that dispatches to registered FastAPI routes."""
from __future__ import annotations

import inspect
from typing import Any, Dict

from fastapi import HTTPException
from pydantic import ValidationError


class SimpleResponse:
    def __init__(self, status_code: int, data: Any):
        self.status_code = status_code
        self._data = data

    def json(self):
        if hasattr(self._data, "dict"):
            return self._data.dict()
        return self._data


class TestClient:
    __test__ = False  # prevent pytest from collecting this helper as a test class
    def __init__(self, app):
        self.app = app
        self.routes = {(r.method, r.path): r.endpoint for r in app.routes}

    def _call_route(self, method: str, path: str, json: Dict | None = None):
        route = self.routes.get((method.upper(), path))
        if not route:
            return SimpleResponse(404, {"detail": "Not Found"})

        try:
            sig = inspect.signature(route)
            params = sig.parameters
            if not params:
                result = route()
            else:
                param = next(iter(params.values()))
                model_type = param.annotation
                if isinstance(model_type, str):
                    model_type = route.__globals__.get(model_type)
                if json is None:
                    raise ValidationError("Request body required")
                model = model_type(**json)
                result = route(model)
            return SimpleResponse(200, result)
        except ValidationError as exc:
            return SimpleResponse(422, {"detail": str(exc)})
        except HTTPException as exc:
            return SimpleResponse(exc.status_code, {"detail": exc.detail})

    def post(self, path: str, json: Dict | None = None):
        return self._call_route("POST", path, json)

    def get(self, path: str):
        return self._call_route("GET", path)

    def put(self, path: str, json: Dict | None = None):
        return self._call_route("PUT", path, json)

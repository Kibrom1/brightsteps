"""Local stub for OpenAI client when package is unavailable."""

class _ChatCompletions:
    def create(self, **kwargs):  # pragma: no cover - stubbed
        raise RuntimeError("OpenAI client not configured in offline stub")


class _Chat:
    def __init__(self):
        self.completions = _ChatCompletions()


class OpenAI:  # pragma: no cover - stub
    def __init__(self, api_key: str | None = None, **_):
        self.api_key = api_key
        self.chat = _Chat()


api_key = None

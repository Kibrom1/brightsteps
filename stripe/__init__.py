"""Local Stripe stub to satisfy imports during offline testing."""

api_key = None


class error:
    class SignatureVerificationError(Exception):
        pass


class Webhook:
    @staticmethod
    def construct_event(payload, sig_header, secret):  # pragma: no cover - stub
        return {"type": "noop", "data": {"object": {}}}


class _Session:
    def __init__(self, url: str = "http://localhost/mock-checkout"):
        self.url = url

    @staticmethod
    def create(**kwargs):  # pragma: no cover - stub
        return _Session()


class checkout:
    Session = _Session

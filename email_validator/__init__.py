"""Lightweight local email validator stub for offline environments."""
import re

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class EmailNotValidError(ValueError):
    """Raised when an email address fails validation."""


class ValidatedEmail:
    """Simple container for validated email values."""

    def __init__(self, email: str):
        self.email = email
        local, _, domain = email.partition("@")
        self.local_part = local
        self.domain = domain
        self.normalized = email


def validate_email(email: str, *_, **__):
    """Validate an email address using a basic regex."""
    if not isinstance(email, str) or not EMAIL_REGEX.match(email):
        raise EmailNotValidError("Invalid email address")
    return ValidatedEmail(email)


__all__ = ["validate_email", "EmailNotValidError", "ValidatedEmail"]

import pytest


@pytest.fixture(autouse=True)
def clear_auth_env(monkeypatch):
    monkeypatch.delenv("ORIGINLENS_API_TOKEN", raising=False)
    monkeypatch.delenv("ORIGINLENS_REQUIRE_TOKEN", raising=False)
    monkeypatch.delenv("ORIGINLENS_ENV", raising=False)

import pytest

from originlens import providers
from originlens.payloads import get_payload
from originlens.providers import (
    GeminiAgentOutput,
    LiveProviderUnavailable,
    generate_agent_steps,
    provider_status,
)


def _summary(payload):
    return f"fallback summary for {payload.id}"


def _memory(payload):
    return f"fallback memory for {payload.id}"


def test_provider_status_counts_gemini_keys(monkeypatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY_1", "one")
    monkeypatch.setenv("GEMINI_API_KEY_2", "two")

    status = provider_status()

    assert status["gemini"] == "ready"
    assert status["keysConfigured"] == 2


def test_key_failover_masks_attempts(monkeypatch) -> None:
    providers._COOLDOWN_UNTIL.clear()
    monkeypatch.setenv("GEMINI_API_KEY_1", "bad-secret")
    monkeypatch.setenv("GEMINI_API_KEY_2", "good-secret")

    def fake_generate(api_key: str, model: str, prompt: str) -> GeminiAgentOutput:
        if api_key == "bad-secret":
            raise RuntimeError("429 for bad-secret")
        return GeminiAgentOutput(
            reviewerSummary="live reviewer summary",
            memoryClaim="live memory claim",
        )

    monkeypatch.setattr(providers, "_generate_with_gemini", fake_generate)

    result = generate_agent_steps(get_payload("pr_01"), "live", _summary, _memory)

    assert result.evidence.source == "live"
    assert result.evidence.selectedKey == "key_2"
    assert result.reviewerSummary == "live reviewer summary"
    assert "bad-secret" not in result.evidence.attempts[0].reason


def test_all_keys_failed_falls_back(monkeypatch) -> None:
    providers._COOLDOWN_UNTIL.clear()
    monkeypatch.setenv("GEMINI_API_KEY_1", "bad-one")
    monkeypatch.setenv("GEMINI_API_KEY_2", "bad-two")

    def fake_generate(api_key: str, model: str, prompt: str) -> GeminiAgentOutput:
        raise RuntimeError(f"failed {api_key}")

    monkeypatch.setattr(providers, "_generate_with_gemini", fake_generate)

    result = generate_agent_steps(get_payload("pr_01"), "hybrid", _summary, _memory)

    assert result.evidence.source == "fallback"
    assert result.evidence.provider == "deterministic_fallback"
    assert result.reviewerSummary.startswith("fallback summary")
    assert len(result.evidence.attempts) == 2
    assert "bad-one" not in str(result.evidence.model_dump())


def test_live_mode_does_not_fall_back(monkeypatch) -> None:
    providers._COOLDOWN_UNTIL.clear()
    monkeypatch.setenv("GEMINI_API_KEY_1", "bad-one")

    def fake_generate(api_key: str, model: str, prompt: str) -> GeminiAgentOutput:
        raise RuntimeError(f"failed {api_key}")

    monkeypatch.setattr(providers, "_generate_with_gemini", fake_generate)

    with pytest.raises(LiveProviderUnavailable) as exc_info:
        generate_agent_steps(get_payload("pr_01"), "live", _summary, _memory)

    assert exc_info.value.evidence.source == "fallback"
    assert exc_info.value.evidence.mode == "live"
    assert "bad-one" not in str(exc_info.value.evidence.model_dump())

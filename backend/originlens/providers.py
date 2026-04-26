from __future__ import annotations

import os
from typing import Literal

ProviderMode = Literal["demo", "live", "hybrid"]
Source = Literal["live", "fallback"]


def provider_status() -> dict[str, str]:
    claude_ready = "ready" if os.getenv("ANTHROPIC_API_KEY") else "unavailable"
    gemini_ready = "ready" if os.getenv("GOOGLE_GENERATIVE_AI_API_KEY") else "unavailable"
    live_ready = "ready" if claude_ready == "ready" or gemini_ready == "ready" else "unavailable"
    return {
        "live": live_ready,
        "claude": claude_ready,
        "gemini": gemini_ready,
        "fallback": "ready",
    }


def select_source(provider_mode: str) -> Source:
    # The provider interface is explicit, but deterministic fallback remains the
    # demo-safe execution path until live adapters are wired behind this seam.
    if provider_mode == "live" and provider_status()["live"] == "ready":
        return "fallback"
    if provider_mode == "hybrid" and provider_status()["live"] == "ready":
        return "fallback"
    return "fallback"

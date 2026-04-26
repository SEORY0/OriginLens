from __future__ import annotations

from datetime import datetime, timezone


def stable_hash(value: str) -> str:
    hash_value = 2166136261
    for char in value:
        hash_value ^= ord(char)
        hash_value += (
            (hash_value << 1)
            + (hash_value << 4)
            + (hash_value << 7)
            + (hash_value << 8)
            + (hash_value << 24)
        )
    return f"h_{hash_value & 0xFFFFFFFF:x}"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

from __future__ import annotations

from typing import get_args

from originlens.guard.provenance_ledger import TRUSTED_ORIGINS
from originlens.schemas import ClaimType, GateResult, MemoryClaim, TRUST_ORDER

SENSITIVE_CLAIM_TYPES: frozenset[ClaimType] = frozenset(
    {
        "user_approval",
        "project_policy",
        "tool_policy_change",
        "external_recipient",
        "physical_authorization",
    }
)
UNKNOWN_SENSITIVE_CLAIM_TYPES = sorted(
    set(SENSITIVE_CLAIM_TYPES) - set(get_args(ClaimType))
)
if UNKNOWN_SENSITIVE_CLAIM_TYPES:
    raise ValueError(
        f"Sensitive claim types are not present in ClaimType: {UNKNOWN_SENSITIVE_CLAIM_TYPES}."
    )


def inspect_memory_write(claim: MemoryClaim) -> GateResult:
    if claim.claimType not in SENSITIVE_CLAIM_TYPES:
        return GateResult(
            allowed=True,
            reason="Memory write preserves provenance.",
        )

    if not claim.derivedFrom:
        return GateResult(
            allowed=False,
            reason="Sensitive memory claims must reference source context.",
        )

    if not claim.originChain:
        return GateResult(
            allowed=False,
            reason="Sensitive memory claims must carry an origin chain.",
        )

    if TRUST_ORDER[claim.effectiveTrust] < TRUST_ORDER["trusted"]:
        return GateResult(
            allowed=False,
            reason="Instruction-like memory cannot be promoted from non-trusted provenance.",
        )

    has_trusted_origin = any(origin in TRUSTED_ORIGINS for origin in claim.originChain)
    if not has_trusted_origin:
        return GateResult(
            allowed=False,
            reason="Trusted sensitive memory must be backed by a trusted origin.",
        )

    return GateResult(
        allowed=True,
        reason="Memory write preserves provenance.",
    )

from __future__ import annotations

from originlens.schemas import GateResult, MemoryClaim

SENSITIVE_CLAIM_TYPES = {
    "user_approval",
    "project_policy",
    "tool_policy_change",
    "external_recipient",
    "physical_authorization",
}


def inspect_memory_write(claim: MemoryClaim) -> GateResult:
    risky = claim.claimType in SENSITIVE_CLAIM_TYPES and claim.effectiveTrust != "trusted"
    return GateResult(
        allowed=not risky,
        reason=(
            "Instruction-like memory cannot be promoted from untrusted provenance."
            if risky
            else "Memory write preserves provenance."
        ),
    )

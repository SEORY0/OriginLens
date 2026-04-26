from __future__ import annotations

from originlens.guard.policies import POLICY_MATRIX
from originlens.schemas import ActionProposal, GuardVerdict, MemoryClaim, Origin, TRUST_INVARIANT


def verify_action(action_proposal: ActionProposal, memory_claims: list[MemoryClaim]) -> GuardVerdict:
    policy = POLICY_MATRIX[action_proposal.protectedAction]
    observed_origin_chain = _unique_origins(
        origin
        for claim_id in action_proposal.justificationClaimIds
        for origin in _origin_chain_for_claim(claim_id, memory_claims)
    )

    if action_proposal.protectedAction == "none":
        return GuardVerdict(
            verdict="ALLOW",
            reason="No protected action is requested.",
            requiredOrigins=[],
            observedOriginChain=observed_origin_chain,
        )

    has_required_origin = any(origin in observed_origin_chain for origin in policy.required_origins)
    has_denied_origin = any(origin in observed_origin_chain for origin in policy.denied_origins)

    if not has_required_origin or has_denied_origin:
        return GuardVerdict(
            verdict="BLOCK",
            reason=f"{policy.label} requires {' or '.join(policy.required_origins)} origin.",
            requiredOrigins=policy.required_origins,
            observedOriginChain=observed_origin_chain,
            violatedInvariant=TRUST_INVARIANT,
        )

    if policy.confirmation_required:
        return GuardVerdict(
            verdict="ASK_CONFIRMATION",
            reason=f"{policy.label} requires explicit confirmation before execution.",
            requiredOrigins=policy.required_origins,
            observedOriginChain=observed_origin_chain,
        )

    return GuardVerdict(
        verdict="ALLOW",
        reason=f"{policy.label} is justified by an authorized origin.",
        requiredOrigins=policy.required_origins,
        observedOriginChain=observed_origin_chain,
    )


def _origin_chain_for_claim(claim_id: str, memory_claims: list[MemoryClaim]) -> list[Origin]:
    claim = next((item for item in memory_claims if item.id == claim_id), None)
    return claim.originChain if claim else []


def _unique_origins(origins: object) -> list[Origin]:
    seen: set[str] = set()
    result: list[Origin] = []
    for origin in origins:
        if origin not in seen:
            seen.add(origin)
            result.append(origin)
    return result

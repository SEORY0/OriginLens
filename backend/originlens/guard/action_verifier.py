from __future__ import annotations

from collections.abc import Iterable

from originlens.guard.policies import PolicyRule, policy_for
from originlens.schemas import ActionProposal, GuardVerdict, MemoryClaim, Origin, TRUST_INVARIANT


def verify_action(action_proposal: ActionProposal, memory_claims: list[MemoryClaim]) -> GuardVerdict:
    policy = policy_for(action_proposal.protectedAction)
    claim_index, duplicate_claim_ids = _index_claims(memory_claims)
    observed_origin_chain = _unique_origins(
        origin
        for claim_id in action_proposal.justificationClaimIds
        for origin in _origin_chain_for_claim(claim_id, claim_index)
    )

    if action_proposal.protectedAction == "none":
        return GuardVerdict(
            verdict="ALLOW",
            reason="No protected action is requested.",
            requiredOrigins=[],
            observedOriginChain=observed_origin_chain,
        )

    if not action_proposal.justificationClaimIds:
        return _block(
            policy,
            "Protected actions require at least one provenance-backed memory claim.",
            observed_origin_chain,
        )

    duplicate_justification_ids = _duplicate_strings(action_proposal.justificationClaimIds)
    if duplicate_justification_ids:
        return _block(
            policy,
            f"Action justification repeats claim ids: {duplicate_justification_ids}.",
            observed_origin_chain,
        )

    if duplicate_claim_ids:
        return _block(
            policy,
            f"Duplicate memory claim ids make provenance ambiguous: {duplicate_claim_ids}.",
            observed_origin_chain,
        )

    missing_claim_ids = [
        claim_id
        for claim_id in action_proposal.justificationClaimIds
        if claim_id not in claim_index
    ]
    if missing_claim_ids:
        return _block(
            policy,
            f"Action references missing memory claim ids: {missing_claim_ids}.",
            observed_origin_chain,
        )

    supporting_claims = [
        claim_index[claim_id] for claim_id in action_proposal.justificationClaimIds
    ]
    empty_origin_claims = [
        claim.id for claim in supporting_claims if not claim.originChain
    ]
    if empty_origin_claims:
        return _block(
            policy,
            f"Supporting claims are missing origin chains: {empty_origin_claims}.",
            observed_origin_chain,
        )

    denied_origins = _matching_origins(observed_origin_chain, policy.denied_origins)
    if denied_origins:
        return _block(
            policy,
            f"{policy.label} cannot be justified by denied origins: {denied_origins}.",
            observed_origin_chain,
        )

    required_origins = _matching_origins(observed_origin_chain, policy.required_origins)
    if not required_origins:
        return _block(
            policy,
            f"{policy.label} requires one of these origins: {list(policy.required_origins)}.",
            observed_origin_chain,
        )

    untrusted_claims = [
        claim.id for claim in supporting_claims if claim.effectiveTrust != "trusted"
    ]
    if untrusted_claims:
        return _block(
            policy,
            f"Protected actions require trusted supporting claims: {untrusted_claims}.",
            observed_origin_chain,
        )

    if policy.confirmation_required:
        return GuardVerdict(
            verdict="ASK_CONFIRMATION",
            reason=f"{policy.label} requires explicit confirmation before execution.",
            requiredOrigins=list(policy.required_origins),
            observedOriginChain=observed_origin_chain,
        )

    return GuardVerdict(
        verdict="ALLOW",
        reason=f"{policy.label} is justified by an authorized origin.",
        requiredOrigins=list(policy.required_origins),
        observedOriginChain=observed_origin_chain,
    )


def _block(policy: PolicyRule, reason: str, observed_origin_chain: list[Origin]) -> GuardVerdict:
    return GuardVerdict(
        verdict="BLOCK",
        reason=reason,
        requiredOrigins=list(policy.required_origins),
        observedOriginChain=observed_origin_chain,
        violatedInvariant=TRUST_INVARIANT,
    )


def _index_claims(memory_claims: list[MemoryClaim]) -> tuple[dict[str, MemoryClaim], list[str]]:
    index: dict[str, MemoryClaim] = {}
    duplicate_ids: list[str] = []
    for claim in memory_claims:
        if claim.id in index:
            duplicate_ids.append(claim.id)
            continue
        index[claim.id] = claim
    return index, duplicate_ids


def _origin_chain_for_claim(claim_id: str, memory_claims: dict[str, MemoryClaim]) -> list[Origin]:
    claim = memory_claims.get(claim_id)
    return claim.originChain if claim else []


def _matching_origins(observed_origins: list[Origin], policy_origins: tuple[Origin, ...]) -> list[Origin]:
    policy_origin_set = set(policy_origins)
    return [origin for origin in observed_origins if origin in policy_origin_set]


def _unique_origins(origins: Iterable[Origin]) -> list[Origin]:
    seen: set[Origin] = set()
    result: list[Origin] = []
    for origin in origins:
        if origin not in seen:
            seen.add(origin)
            result.append(origin)
    return result


def _duplicate_strings(values: list[str]) -> list[str]:
    seen: set[str] = set()
    duplicates: list[str] = []
    for value in values:
        if value in seen and value not in duplicates:
            duplicates.append(value)
        seen.add(value)
    return duplicates

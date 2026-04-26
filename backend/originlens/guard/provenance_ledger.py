from __future__ import annotations

from originlens.schemas import ActionProposal, ContextPiece, MemoryClaim, Origin, TrustLevel
from originlens.utils import now_iso, stable_hash

TRUSTED_ORIGINS: set[Origin] = {
    "system",
    "user",
    "authenticated_operator",
    "safety_controller",
}
DELEGATED_ORIGINS: set[Origin] = {"subagent_summary", "compacted_memory"}


class ProvenanceIntegrityError(ValueError):
    pass


class ProvenanceCollisionError(ProvenanceIntegrityError):
    pass


def trust_for_origin(origin: Origin) -> TrustLevel:
    if origin in TRUSTED_ORIGINS:
        return "trusted"
    if origin in DELEGATED_ORIGINS:
        return "delegated"
    return "untrusted"


class ProvenanceLedger:
    def __init__(self) -> None:
        self._id_kinds: dict[str, str] = {}
        self.context_pieces: dict[str, ContextPiece] = {}
        self.memory_claims: dict[str, MemoryClaim] = {}
        self.actions: dict[str, ActionProposal] = {}

    def capture_context(
        self,
        *,
        id: str,
        origin: Origin,
        source: str,
        content: str,
        parent_ids: list[str] | None = None,
    ) -> ContextPiece:
        normalized_parent_ids = _unique_strings(parent_ids or [])
        missing_parent_ids = [
            parent_id
            for parent_id in normalized_parent_ids
            if parent_id not in self.context_pieces
        ]
        if missing_parent_ids:
            raise ProvenanceIntegrityError(
                f"Context {id} references missing parent context ids: {missing_parent_ids}."
            )

        piece = ContextPiece(
            id=id,
            content=content,
            origin=origin,
            source=source,
            parentIds=normalized_parent_ids,
            trustLevel=trust_for_origin(origin),
            hash=stable_hash(f"{origin}:{source}:{content}"),
            timestamp=now_iso(),
        )
        self._register_id(piece.id, "context")
        self.context_pieces[piece.id] = piece
        return piece

    def capture_memory_claim(self, claim: MemoryClaim) -> MemoryClaim:
        missing_context_ids = [
            context_id
            for context_id in _unique_strings(claim.derivedFrom)
            if context_id not in self.context_pieces
        ]
        if missing_context_ids:
            raise ProvenanceIntegrityError(
                f"Memory claim {claim.id} references missing context ids: {missing_context_ids}."
            )

        self._register_id(claim.id, "memory_claim")
        self.memory_claims[claim.id] = claim
        return claim

    def capture_action(self, action: ActionProposal) -> ActionProposal:
        missing_claim_ids = [
            claim_id
            for claim_id in _unique_strings(action.justificationClaimIds)
            if claim_id not in self.memory_claims
        ]
        if missing_claim_ids:
            raise ProvenanceIntegrityError(
                f"Action {action.id} references missing memory claim ids: {missing_claim_ids}."
            )

        self._register_id(action.id, "action")
        self.actions[action.id] = action
        return action

    def _register_id(self, item_id: str, kind: str) -> None:
        existing_kind = self._id_kinds.get(item_id)
        if existing_kind:
            raise ProvenanceCollisionError(
                f"Provenance id {item_id!r} is already registered as {existing_kind}; "
                f"cannot reuse it as {kind}."
            )
        self._id_kinds[item_id] = kind


def _unique_strings(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            result.append(value)
    return result

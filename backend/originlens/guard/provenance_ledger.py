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


def trust_for_origin(origin: Origin) -> TrustLevel:
    if origin in TRUSTED_ORIGINS:
        return "trusted"
    if origin in DELEGATED_ORIGINS:
        return "delegated"
    return "untrusted"


class ProvenanceLedger:
    def __init__(self) -> None:
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
        piece = ContextPiece(
            id=id,
            content=content,
            origin=origin,
            source=source,
            parentIds=parent_ids or [],
            trustLevel=trust_for_origin(origin),
            hash=stable_hash(f"{origin}:{source}:{content}"),
            timestamp=now_iso(),
        )
        self.context_pieces[piece.id] = piece
        return piece

    def capture_memory_claim(self, claim: MemoryClaim) -> MemoryClaim:
        self.memory_claims[claim.id] = claim
        return claim

    def capture_action(self, action: ActionProposal) -> ActionProposal:
        self.actions[action.id] = action
        return action

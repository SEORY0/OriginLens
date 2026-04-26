from __future__ import annotations

from collections.abc import Iterable

from originlens.guard.provenance_ledger import trust_for_origin
from originlens.schemas import ContextPiece, GateResult, MemoryClaim, Origin


def inspect_compaction(context_pieces: list[ContextPiece], memory_claim: MemoryClaim) -> GateResult:
    context_by_id, duplicate_context_ids = _index_context(context_pieces)
    if duplicate_context_ids:
        return GateResult(
            allowed=False,
            reason=f"Compaction inputs contain duplicate context ids: {duplicate_context_ids}.",
        )

    if not memory_claim.derivedFrom:
        return GateResult(
            allowed=False,
            reason="Compacted claims must reference source context.",
        )

    missing_context_ids = [
        context_id for context_id in memory_claim.derivedFrom if context_id not in context_by_id
    ]
    if missing_context_ids:
        return GateResult(
            allowed=False,
            reason=f"Compaction references missing source context ids: {missing_context_ids}.",
        )

    if not memory_claim.originChain:
        return GateResult(
            allowed=False,
            reason="Compacted claims must carry an origin chain.",
        )

    expected_origins = _unique_origins(
        context_by_id[context_id].origin for context_id in memory_claim.derivedFrom
    )
    dropped_origins = [
        origin for origin in expected_origins if origin not in memory_claim.originChain
    ]
    if dropped_origins:
        return GateResult(
            allowed=False,
            reason=f"Compaction dropped source origins: {dropped_origins}.",
        )

    promoted_origins = [
        origin
        for origin in memory_claim.originChain
        if trust_for_origin(origin) == "trusted" and origin not in expected_origins
    ]
    if promoted_origins:
        return GateResult(
            allowed=False,
            reason=f"Compaction introduced trusted origins not present in sources: {promoted_origins}.",
        )

    return GateResult(
        allowed=True,
        reason="Compaction preserved the input origin chain.",
    )


def _index_context(context_pieces: list[ContextPiece]) -> tuple[dict[str, ContextPiece], list[str]]:
    index: dict[str, ContextPiece] = {}
    duplicate_ids: list[str] = []
    for piece in context_pieces:
        if piece.id in index:
            duplicate_ids.append(piece.id)
            continue
        index[piece.id] = piece
    return index, duplicate_ids


def _unique_origins(origins: Iterable[Origin]) -> list[Origin]:
    seen: set[Origin] = set()
    result: list[Origin] = []
    for origin in origins:
        if origin not in seen:
            seen.add(origin)
            result.append(origin)
    return result

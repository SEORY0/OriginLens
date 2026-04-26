from __future__ import annotations

from originlens.schemas import ContextPiece, GateResult, MemoryClaim


def inspect_compaction(context_pieces: list[ContextPiece], memory_claim: MemoryClaim) -> GateResult:
    expected_origins = [
        piece.origin for piece in context_pieces if piece.id in memory_claim.derivedFrom
    ]
    preserves_origin = all(origin in memory_claim.originChain for origin in expected_origins)
    return GateResult(
        allowed=preserves_origin,
        reason=(
            "Compaction preserved the input origin chain."
            if preserves_origin
            else "Compaction dropped origin information from the derived claim."
        ),
    )

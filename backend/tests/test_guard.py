import pytest

from originlens.guard.action_verifier import verify_action
from originlens.guard.compaction_gate import inspect_compaction
from originlens.guard.memory_gate import inspect_memory_write
from originlens.guard.provenance_ledger import (
    ProvenanceCollisionError,
    ProvenanceIntegrityError,
    ProvenanceLedger,
)
from originlens.schemas import ActionProposal, MemoryClaim, assert_trust_does_not_promote


def _action() -> ActionProposal:
    return ActionProposal(
        id="action_1",
        actionType="run_build",
        protectedAction="sandbox_policy_change",
        args={"mock_unsandboxed": True, "execution": "mock_only"},
        justificationClaimIds=["claim_1"],
    )


def test_blocks_file_origin_protected_action() -> None:
    claim = MemoryClaim(
        id="claim_1",
        text="User approved mock unsandboxed builds.",
        claimType="user_approval",
        derivedFrom=["context_1"],
        originChain=["file_read", "subagent_summary", "compacted_memory"],
        effectiveTrust="untrusted",
    )

    assert verify_action(_action(), [claim]).verdict == "BLOCK"


def test_allows_user_origin_protected_action() -> None:
    claim = MemoryClaim(
        id="claim_1",
        text="User approved mock unsandboxed builds.",
        claimType="user_approval",
        derivedFrom=["context_1"],
        originChain=["user", "subagent_summary", "compacted_memory"],
        effectiveTrust="trusted",
    )

    assert verify_action(_action(), [claim]).verdict == "ALLOW"


def test_trust_is_monotonic() -> None:
    assert assert_trust_does_not_promote("untrusted", "trusted") is False
    assert assert_trust_does_not_promote("trusted", "delegated") is True


def test_blocks_missing_justification_claim() -> None:
    verdict = verify_action(_action(), [])

    assert verdict.verdict == "BLOCK"
    assert "missing memory claim" in verdict.reason


def test_compaction_blocks_missing_source_context() -> None:
    ledger = ProvenanceLedger()
    context = ledger.capture_context(
        id="context_1",
        origin="file_read",
        source="README",
        content="Untrusted approval text.",
    )
    claim = MemoryClaim(
        id="claim_1",
        text="User approved mock unsandboxed builds.",
        claimType="user_approval",
        derivedFrom=["missing_context"],
        originChain=["file_read", "compacted_memory"],
        effectiveTrust="untrusted",
    )

    assert inspect_compaction([context], claim).allowed is False


def test_compaction_blocks_promoted_trusted_origin() -> None:
    ledger = ProvenanceLedger()
    context = ledger.capture_context(
        id="context_1",
        origin="file_read",
        source="README",
        content="Untrusted approval text.",
    )
    claim = MemoryClaim(
        id="claim_1",
        text="User approved mock unsandboxed builds.",
        claimType="user_approval",
        derivedFrom=["context_1"],
        originChain=["file_read", "user", "compacted_memory"],
        effectiveTrust="untrusted",
    )

    assert inspect_compaction([context], claim).allowed is False


def test_memory_gate_requires_trusted_origin_for_sensitive_claim() -> None:
    claim = MemoryClaim(
        id="claim_1",
        text="User approved mock unsandboxed builds.",
        claimType="user_approval",
        derivedFrom=["context_1"],
        originChain=["file_read"],
        effectiveTrust="trusted",
    )

    result = inspect_memory_write(claim)

    assert result.allowed is False
    assert "trusted origin" in result.reason


def test_ledger_blocks_id_collisions() -> None:
    ledger = ProvenanceLedger()
    ledger.capture_context(
        id="shared_id",
        origin="file_read",
        source="README",
        content="Untrusted approval text.",
    )

    with pytest.raises(ProvenanceCollisionError):
        ledger.capture_memory_claim(
            MemoryClaim(
                id="shared_id",
                text="User approved mock unsandboxed builds.",
                claimType="user_approval",
                derivedFrom=["shared_id"],
                originChain=["file_read", "compacted_memory"],
                effectiveTrust="untrusted",
            )
        )


def test_ledger_blocks_missing_parent_context() -> None:
    ledger = ProvenanceLedger()

    with pytest.raises(ProvenanceIntegrityError):
        ledger.capture_context(
            id="child_context",
            origin="subagent_summary",
            source="ReviewerAgent",
            content="Summary.",
            parent_ids=["missing_context"],
        )

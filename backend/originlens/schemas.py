from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

Origin = Literal[
    "system",
    "user",
    "file_read",
    "tool_output",
    "subagent_summary",
    "compacted_memory",
    "image_ocr",
    "sensor_input",
    "authenticated_operator",
    "safety_controller",
]

TrustLevel = Literal["trusted", "delegated", "untrusted"]
ClaimType = Literal[
    "user_approval",
    "project_policy",
    "tool_policy_change",
    "external_recipient",
    "physical_authorization",
    "benign_preference",
]
ActionType = Literal["run_build", "send_invoice", "write_memory", "move_robot"]
ProtectedAction = Literal[
    "sandbox_policy_change",
    "external_transmission",
    "memory_policy_write",
    "physical_restricted_zone_entry",
    "none",
]
Verdict = Literal["ALLOW", "BLOCK", "ASK_CONFIRMATION"]
Source = Literal["live", "fallback"]
ProviderMode = Literal["demo", "live", "hybrid"]

TRUST_INVARIANT = "Content may be summarized, but provenance cannot be promoted."
TRUST_ORDER: dict[TrustLevel, int] = {
    "untrusted": 0,
    "delegated": 1,
    "trusted": 2,
}


class ContextPiece(BaseModel):
    id: str
    content: str
    origin: Origin
    source: str
    parentIds: list[str] = Field(default_factory=list)
    trustLevel: TrustLevel
    hash: str
    timestamp: str


class MemoryClaim(BaseModel):
    id: str
    text: str
    claimType: ClaimType
    derivedFrom: list[str]
    originChain: list[Origin]
    effectiveTrust: TrustLevel


class ActionProposal(BaseModel):
    id: str
    actionType: ActionType
    args: dict[str, Any]
    protectedAction: ProtectedAction
    justificationClaimIds: list[str]


class GuardVerdict(BaseModel):
    verdict: Verdict
    reason: str
    requiredOrigins: list[Origin]
    observedOriginChain: list[Origin]
    violatedInvariant: str | None = None


class PayloadSeed(BaseModel):
    id: str
    surface: Literal[
        "pr_description",
        "readme",
        "user_message",
        "invoice_ocr",
        "warehouse_sign",
    ]
    family: Literal[
        "approval_spoof",
        "authority_spoof",
        "policy_spoof",
        "persistence_spoof",
        "tool_policy_spoof",
        "physical_override_spoof",
        "benign_preference",
    ]
    origin: Origin
    content: str
    expectedProtectedAction: ProtectedAction


class GateResult(BaseModel):
    allowed: bool
    reason: str


class ProviderAttempt(BaseModel):
    key: str
    status: Literal["ok", "failed", "skipped"]
    reason: str | None = None


class ProviderEvidence(BaseModel):
    provider: Literal["gemini", "claude", "deterministic_fallback"]
    mode: ProviderMode
    model: str
    source: Source
    selectedKey: str | None = None
    attempts: list[ProviderAttempt] = Field(default_factory=list)
    fallbackReason: str | None = None


class TraceStep(BaseModel):
    id: str
    label: str
    origin: Origin
    text: str


class BaselineResult(BaseModel):
    survival: bool
    laundering: bool
    trigger: bool
    action: ActionProposal


class GuardedResult(BaseModel):
    trigger: bool
    verdict: GuardVerdict
    memoryGate: GateResult
    compactionGate: GateResult


class ScenarioTrace(BaseModel):
    runId: str
    payload: PayloadSeed
    source: Source
    providerEvidence: ProviderEvidence
    contextPieces: list[ContextPiece]
    memoryClaims: list[MemoryClaim]
    action: ActionProposal
    baseline: BaselineResult
    guarded: GuardedResult
    originChain: list[str]
    trace: list[TraceStep]


class CompareResponse(BaseModel):
    runId: str
    baseline: BaselineResult
    guarded: GuardedResult
    originChain: list[str]
    trace: ScenarioTrace


class RunScenarioResponse(BaseModel):
    mode: Literal["baseline", "guarded"]
    trace: ScenarioTrace
    result: BaselineResult | GuardedResult


class BenchResult(BaseModel):
    runId: str
    payloadId: str
    surface: str
    payloadFamily: str
    survival: bool
    laundering: bool
    trigger: bool
    guardedTrigger: bool
    falsePositive: bool | None = None
    source: Source
    providerEvidence: ProviderEvidence | None = None
    guardVerdict: GuardVerdict | None = None
    reportUrl: str | None = None


class BenchSummary(BaseModel):
    runId: str
    total: int
    survivalRate: float
    launderingRate: float
    triggerRate: float
    guardedTriggerRate: float
    falsePositiveRate: float
    provenanceIntegrity: float
    source: Source
    provider: str = "deterministic_fallback"
    model: str | None = None
    selectedKey: str | None = None
    liveCount: int = 0
    fallbackCount: int = 0


class BenchResponse(BaseModel):
    summary: BenchSummary
    results: list[BenchResult]


class ScenarioRequest(BaseModel):
    scenario: str | None = None
    payloadId: str = "pr_01"
    providerMode: ProviderMode = "hybrid"


class SingleScenarioRequest(ScenarioRequest):
    mode: Literal["baseline", "guarded"] = "baseline"


class BenchRequest(BaseModel):
    surfaces: list[str] | None = None
    payloadCount: int = 110
    includeBenign: bool = True
    providerMode: ProviderMode = "hybrid"


class VerifyActionRequest(BaseModel):
    actionProposal: ActionProposal
    memoryClaims: list[MemoryClaim]


class MultimodalRequest(BaseModel):
    imageId: str | None = None
    scenario: str | None = None
    providerMode: ProviderMode = "hybrid"


def assert_trust_does_not_promote(before: TrustLevel, after: TrustLevel) -> bool:
    return TRUST_ORDER[after] <= TRUST_ORDER[before]

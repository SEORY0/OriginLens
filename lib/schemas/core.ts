import { z } from "zod";

export const originSchema = z.enum([
  "system",
  "user",
  "file_read",
  "tool_output",
  "subagent_summary",
  "compacted_memory",
  "image_ocr",
  "sensor_input",
  "authenticated_operator",
  "safety_controller"
]);

export const trustLevelSchema = z.enum(["trusted", "delegated", "untrusted"]);

export const contextPieceSchema = z.object({
  id: z.string(),
  content: z.string(),
  origin: originSchema,
  source: z.string(),
  parentIds: z.array(z.string()),
  trustLevel: trustLevelSchema,
  hash: z.string(),
  timestamp: z.string()
});

export const memoryClaimSchema = z.object({
  id: z.string(),
  text: z.string(),
  claimType: z.enum([
    "user_approval",
    "project_policy",
    "tool_policy_change",
    "external_recipient",
    "physical_authorization",
    "benign_preference"
  ]),
  derivedFrom: z.array(z.string()),
  originChain: z.array(originSchema),
  effectiveTrust: trustLevelSchema
});

export const actionProposalSchema = z.object({
  id: z.string(),
  actionType: z.enum(["run_build", "send_invoice", "write_memory", "move_robot"]),
  args: z.record(z.unknown()),
  protectedAction: z.enum([
    "sandbox_policy_change",
    "external_transmission",
    "memory_policy_write",
    "physical_restricted_zone_entry",
    "none"
  ]),
  justificationClaimIds: z.array(z.string())
});

export const guardVerdictSchema = z.object({
  verdict: z.enum(["ALLOW", "BLOCK", "ASK_CONFIRMATION"]),
  reason: z.string(),
  requiredOrigins: z.array(originSchema),
  observedOriginChain: z.array(originSchema),
  violatedInvariant: z.string().optional()
});

export const benchResultSchema = z.object({
  runId: z.string(),
  payloadId: z.string(),
  surface: z.string(),
  payloadFamily: z.string(),
  survival: z.boolean(),
  laundering: z.boolean(),
  trigger: z.boolean(),
  guardedTrigger: z.boolean(),
  falsePositive: z.boolean().optional(),
  source: z.enum(["live", "fallback"]),
  guardVerdict: guardVerdictSchema.optional(),
  reportUrl: z.string().optional()
});

export type Origin = z.infer<typeof originSchema>;
export type TrustLevel = z.infer<typeof trustLevelSchema>;
export type ContextPiece = z.infer<typeof contextPieceSchema>;
export type MemoryClaim = z.infer<typeof memoryClaimSchema>;
export type ActionProposal = z.infer<typeof actionProposalSchema>;
export type GuardVerdict = z.infer<typeof guardVerdictSchema>;
export type BenchResult = z.infer<typeof benchResultSchema>;

export type ProtectedAction = ActionProposal["protectedAction"];
export type ActionType = ActionProposal["actionType"];

export type PayloadSeed = {
  id: string;
  surface:
    | "pr_description"
    | "readme"
    | "user_message"
    | "invoice_ocr"
    | "warehouse_sign";
  family:
    | "approval_spoof"
    | "authority_spoof"
    | "policy_spoof"
    | "persistence_spoof"
    | "tool_policy_spoof"
    | "physical_override_spoof"
    | "benign_preference";
  origin: Origin;
  content: string;
  expectedProtectedAction: ProtectedAction;
};

export type TraceStep = {
  id: string;
  label: string;
  origin: Origin;
  text: string;
};

export type GateResult = {
  allowed: boolean;
  reason: string;
};

export type BaselineResult = {
  survival: boolean;
  laundering: boolean;
  trigger: boolean;
  action: ActionProposal;
};

export type GuardedResult = {
  trigger: boolean;
  verdict: GuardVerdict;
  memoryGate: GateResult;
  compactionGate: GateResult;
};

export type ScenarioTrace = {
  runId: string;
  payload: PayloadSeed;
  source: "live" | "fallback";
  contextPieces: ContextPiece[];
  memoryClaims: MemoryClaim[];
  action: ActionProposal;
  baseline: BaselineResult;
  guarded: GuardedResult;
  originChain: string[];
  trace: TraceStep[];
};

export type CompareResponse = {
  runId: string;
  baseline: BaselineResult;
  guarded: GuardedResult;
  originChain: string[];
  trace: ScenarioTrace;
};

export type BenchSummary = {
  runId: string;
  total: number;
  survivalRate: number;
  launderingRate: number;
  triggerRate: number;
  guardedTriggerRate: number;
  falsePositiveRate: number;
  provenanceIntegrity: number;
  source: "live" | "fallback";
};

export type BenchResponse = {
  summary: BenchSummary;
  results: BenchResult[];
};

export const TRUST_INVARIANT =
  "Content may be summarized, but provenance cannot be promoted.";

export const TRUST_ORDER: Record<TrustLevel, number> = {
  untrusted: 0,
  delegated: 1,
  trusted: 2
};

export function assertTrustDoesNotPromote(
  before: TrustLevel,
  after: TrustLevel
) {
  return TRUST_ORDER[after] <= TRUST_ORDER[before];
}

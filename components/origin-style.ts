import type { Origin, TrustLevel } from "@/lib/schemas/core";

export type TrustTier = "system" | "user" | "delegated" | "tool" | "untrusted";

const ORIGIN_TIER: Record<Origin, TrustTier> = {
  system: "system",
  user: "user",
  authenticated_operator: "user",
  safety_controller: "user",
  subagent_summary: "delegated",
  compacted_memory: "delegated",
  tool_output: "tool",
  file_read: "untrusted",
  image_ocr: "untrusted",
  sensor_input: "untrusted"
};

const TIER_LABEL: Record<TrustTier, string> = {
  system: "system",
  user: "trusted user",
  delegated: "delegated agent",
  tool: "tool boundary",
  untrusted: "untrusted source"
};

const TIER_BADGE: Record<TrustTier, string> = {
  system:
    "border-trust-system bg-trust-system/10 text-trust-system",
  user:
    "border-trust-user bg-trust-user/12 text-trust-user",
  delegated:
    "border-trust-delegated bg-trust-delegated/12 text-trust-delegated",
  tool:
    "border-trust-tool bg-trust-tool/15 text-[#7a5817]",
  untrusted:
    "border-trust-untrusted bg-trust-untrusted/12 text-trust-untrusted"
};

const TIER_DOT: Record<TrustTier, string> = {
  system: "bg-trust-system",
  user: "bg-trust-user",
  delegated: "bg-trust-delegated",
  tool: "bg-trust-tool",
  untrusted: "bg-trust-untrusted"
};

const TIER_RANK: Record<TrustTier, number> = {
  untrusted: 0,
  tool: 1,
  delegated: 2,
  user: 3,
  system: 4
};

export function originTier(origin: Origin): TrustTier {
  return ORIGIN_TIER[origin] ?? "untrusted";
}

export function originBadgeClasses(origin: Origin): string {
  return TIER_BADGE[originTier(origin)];
}

export function originDotClasses(origin: Origin): string {
  return TIER_DOT[originTier(origin)];
}

export function trustTierLabel(tier: TrustTier): string {
  return TIER_LABEL[tier];
}

export function trustTierForLevel(level: TrustLevel): TrustTier {
  if (level === "trusted") return "user";
  if (level === "delegated") return "delegated";
  return "untrusted";
}

export function trustRankDelta(from: Origin, to: Origin): number {
  return TIER_RANK[originTier(to)] - TIER_RANK[originTier(from)];
}

export function trustTierRank(tier: TrustTier): number {
  return TIER_RANK[tier];
}

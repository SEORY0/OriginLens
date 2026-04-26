import type { ScenarioTrace } from "@/lib/schemas/core";
import { Badge } from "@/components/ui";
import { OriginChip } from "@/components/GuardVerdictCard";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const CLAIM_LABEL: Record<string, string> = {
  user_approval: "user approval",
  project_policy: "project policy",
  tool_policy_change: "tool policy",
  external_recipient: "external recipient",
  physical_authorization: "physical authorization",
  benign_preference: "benign preference"
};

export function MemoryDiff({ trace }: { trace: ScenarioTrace }) {
  const memory = trace.memoryClaims[0];
  const trusted = memory?.effectiveTrust === "trusted";

  return (
    <div className="grid gap-2">
      <Stage
        side="input"
        title="Untrusted input"
        subLabel={trace.payload.surface}
        origin={trace.payload.origin}
        body={trace.payload.content}
      />

      <div className="relative flex items-center justify-center py-1">
        <div className="flex items-center gap-2 rounded-full border border-trust-untrusted/40 bg-white px-3 py-1 text-[11px] font-semibold text-trust-untrusted shadow-sm">
          <ArrowDown size={12} />
          laundered as
          {memory ? (
            <Badge tone={trusted ? "good" : "warn"} size="sm">
              {CLAIM_LABEL[memory.claimType] ?? memory.claimType}
            </Badge>
          ) : null}
        </div>
      </div>

      <Stage
        side="memory"
        title="Compacted memory"
        subLabel={memory?.claimType ?? "memory"}
        body={memory?.text ?? "—"}
        chain={memory?.originChain}
        trusted={trusted}
      />
    </div>
  );
}

function Stage({
  side,
  title,
  subLabel,
  body,
  origin,
  chain,
  trusted
}: {
  side: "input" | "memory";
  title: string;
  subLabel: string;
  body: string;
  origin?: import("@/lib/schemas/core").Origin;
  chain?: import("@/lib/schemas/core").Origin[];
  trusted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-3 shadow-sm",
        side === "input" && "border-trust-untrusted/40",
        side === "memory" && (trusted ? "border-trust-user/40" : "border-trust-tool/40")
      )}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge tone={side === "input" ? "bad" : trusted ? "good" : "warn"} size="sm">
            {title}
          </Badge>
          <span className="text-[11px] uppercase tracking-wide text-ink/55">
            {subLabel}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {origin ? <OriginChip origin={origin} size="sm" /> : null}
          {chain
            ? chain.map((o, idx) => <OriginChip key={`${o}-${idx}`} origin={o} size="sm" />)
            : null}
        </div>
      </div>
      <p className="text-sm leading-6">
        <span className={side === "memory" ? "laundered-mark" : undefined}>{body}</span>
      </p>
    </div>
  );
}

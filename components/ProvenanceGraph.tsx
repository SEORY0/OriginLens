import type { ScenarioTrace } from "@/lib/schemas/core";
import {
  originBadgeClasses,
  originDotClasses,
  originTier,
  trustTierRank
} from "@/components/origin-style";
import { cn } from "@/lib/utils";
import type { Origin } from "@/lib/schemas/core";

const KNOWN_ORIGINS = new Set<string>([
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

export function ProvenanceGraph({ trace }: { trace: ScenarioTrace }) {
  const chain = trace.originChain;

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {chain.map((node, index) => {
          const knownOrigin = KNOWN_ORIGINS.has(node);
          const origin = (knownOrigin ? node : trace.payload.origin) as Origin;
          const tier = originTier(origin);
          const prevOrigin =
            index > 0 && KNOWN_ORIGINS.has(chain[index - 1])
              ? (chain[index - 1] as Origin)
              : null;
          const drift = prevOrigin
            ? trustTierRank(originTier(prevOrigin)) - trustTierRank(tier)
            : 0;
          return (
            <div key={`${node}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    "text-lg font-bold",
                    drift > 0 ? "text-trust-untrusted" : "text-line"
                  )}
                >
                  →
                </span>
              ) : null}
              <div
                className={cn(
                  "flex min-w-[120px] flex-col items-start rounded-lg border bg-white px-3 py-2 shadow-sm",
                  knownOrigin ? originBadgeClasses(origin) : "border-line text-ink/70"
                )}
                title={knownOrigin ? `${tier} tier` : "trace stage"}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      knownOrigin ? originDotClasses(origin) : "bg-line"
                    )}
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                    stage {index + 1}
                  </span>
                </div>
                <span className="mt-1 text-sm font-bold">{node}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-[11px] text-ink/55">
        <span>trust →</span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-trust-system" /> system
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-trust-user" /> user
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-trust-delegated" /> delegated
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-trust-tool" /> tool
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-trust-untrusted" /> untrusted
        </span>
      </div>
    </div>
  );
}

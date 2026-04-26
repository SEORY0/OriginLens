import type { TraceStep } from "@/lib/schemas/core";
import { OriginChip } from "@/components/GuardVerdictCard";
import {
  originDotClasses,
  originTier,
  trustTierLabel,
  trustTierRank
} from "@/components/origin-style";
import { cn } from "@/lib/utils";

export function LifecycleTimeline({ steps }: { steps: TraceStep[] }) {
  return (
    <ol className="relative grid gap-2">
      {steps.map((step, index) => {
        const prev = index > 0 ? steps[index - 1] : null;
        const tier = originTier(step.origin);
        const prevTier = prev ? originTier(prev.origin) : null;
        const promoted =
          prevTier && trustTierRank(tier) > trustTierRank(prevTier);
        const demoted =
          prevTier && trustTierRank(tier) < trustTierRank(prevTier);
        return (
          <li key={step.id} className="grid grid-cols-[28px_1fr] gap-3">
            <div className="relative flex flex-col items-center">
              <span
                className={cn(
                  "z-10 grid h-7 w-7 place-items-center rounded-full border bg-white text-xs font-bold shadow-sm",
                  originDotClasses(step.origin),
                  "text-white"
                )}
              >
                {index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "mt-1 w-px flex-1",
                    demoted ? "bg-trust-untrusted/60" : "bg-line"
                  )}
                />
              ) : null}
            </div>
            <div
              className={cn(
                "rounded-md border bg-white p-3 shadow-sm",
                promoted && "border-trust-untrusted/40",
                !promoted && "border-line"
              )}
            >
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <strong className="text-sm">{step.label}</strong>
                <OriginChip origin={step.origin} size="sm" />
                {promoted ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-trust-untrusted">
                    ↑ trust promoted
                  </span>
                ) : null}
                {demoted ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-trust-tool">
                    ↓ derived
                  </span>
                ) : null}
                <span className="ml-auto text-[10px] uppercase tracking-wider text-ink/45">
                  {trustTierLabel(tier)}
                </span>
              </div>
              <p className="text-sm leading-6 text-ink/75">{step.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

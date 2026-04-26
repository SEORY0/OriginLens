import type { PolicyMatrixResponse } from "@/lib/python-client";
import { OriginChip } from "@/components/GuardVerdictCard";
import type { Origin } from "@/lib/schemas/core";

export function PolicyMatrix({ policies }: { policies: PolicyMatrixResponse }) {
  const entries = Object.entries(policies).filter(([key]) => key !== "none");
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {entries.map(([key, policy]) => (
        <article
          key={key}
          className="rounded-lg border border-line bg-white p-4 shadow-sm"
        >
          <header className="mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-moss">
              Protected action
            </p>
            <h3 className="mt-0.5 text-sm font-bold">{policy.label}</h3>
            <p className="text-[11px] uppercase tracking-wide text-ink/45">{key}</p>
          </header>
          <div className="grid gap-3">
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-trust-user">
                ✓ required
              </p>
              <div className="flex flex-wrap gap-1.5">
                {policy.requiredOrigins.length ? (
                  policy.requiredOrigins.map((o) => (
                    <OriginChip key={o} origin={o as Origin} size="sm" />
                  ))
                ) : (
                  <span className="text-xs text-ink/50">—</span>
                )}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-trust-untrusted">
                ✕ denied
              </p>
              <div className="flex flex-wrap gap-1.5">
                {policy.deniedOrigins.length ? (
                  policy.deniedOrigins.map((o) => (
                    <OriginChip key={o} origin={o as Origin} size="sm" />
                  ))
                ) : (
                  <span className="text-xs text-ink/50">—</span>
                )}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

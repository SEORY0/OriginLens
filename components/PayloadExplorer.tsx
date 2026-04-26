"use client";

import { useMemo, useState } from "react";
import type { PayloadSeed } from "@/lib/schemas/core";
import { Badge } from "@/components/ui";
import { OriginChip } from "@/components/GuardVerdictCard";
import { cn } from "@/lib/utils";

const FAMILY_TONE: Record<PayloadSeed["family"], "bad" | "warn" | "info" | "good"> = {
  approval_spoof: "bad",
  authority_spoof: "bad",
  policy_spoof: "warn",
  persistence_spoof: "warn",
  tool_policy_spoof: "warn",
  physical_override_spoof: "info",
  benign_preference: "good"
};

export function PayloadExplorer({ payloads }: { payloads: PayloadSeed[] }) {
  const families = useMemo(() => {
    const set = new Set<string>();
    payloads.forEach((p) => set.add(p.family));
    return Array.from(set);
  }, [payloads]);

  const [active, setActive] = useState<string | null>(null);
  const filtered = active ? payloads.filter((p) => p.family === active) : payloads;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-1.5">
        <FilterChip
          label={`all · ${payloads.length}`}
          active={active === null}
          onClick={() => setActive(null)}
        />
        {families.map((family) => (
          <FilterChip
            key={family}
            label={family}
            tone={FAMILY_TONE[family as PayloadSeed["family"]]}
            count={payloads.filter((p) => p.family === family).length}
            active={active === family}
            onClick={() => setActive(family)}
          />
        ))}
      </div>
      <div className="overflow-auto rounded-lg border border-line bg-white">
        <table className="sticky-header w-full min-w-[780px] text-left text-sm">
          <thead className="bg-field text-[11px] uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-3 py-3">Payload</th>
              <th className="px-3 py-3">Surface</th>
              <th className="px-3 py-3">Family</th>
              <th className="px-3 py-3">Origin</th>
              <th className="px-3 py-3">Protected Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((payload) => (
              <tr key={payload.id} className="border-t border-line">
                <td className="px-3 py-3 font-semibold">{payload.id}</td>
                <td className="px-3 py-3 text-ink/75">{payload.surface}</td>
                <td className="px-3 py-3">
                  <Badge tone={FAMILY_TONE[payload.family]} size="sm">
                    {payload.family}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <OriginChip origin={payload.origin} size="sm" />
                </td>
                <td className="px-3 py-3 text-ink/75">{payload.expectedProtectedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  count,
  tone,
  active,
  onClick
}: {
  label: string;
  count?: number;
  tone?: "bad" | "warn" | "info" | "good";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition",
        active
          ? "border-ink bg-ink text-white"
          : "border-line bg-white text-ink/70 hover:border-ink"
      )}
    >
      {tone ? (
        <span
          aria-hidden
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "bad" && "bg-trust-untrusted",
            tone === "warn" && "bg-trust-tool",
            tone === "info" && "bg-trust-delegated",
            tone === "good" && "bg-trust-user"
          )}
        />
      ) : null}
      {label}
      {typeof count === "number" ? (
        <span className={cn("text-[10px]", active ? "text-white/70" : "text-ink/45")}>
          ({count})
        </span>
      ) : null}
    </button>
  );
}

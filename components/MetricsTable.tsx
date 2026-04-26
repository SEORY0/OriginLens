import type { BenchResult, BenchSummary } from "@/lib/schemas/core";
import { percent } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

type MetricRow = {
  key: string;
  label: string;
  value: number;
  ideal: "low" | "high";
  hint: string;
};

export function MetricsTable({
  summary,
  results
}: {
  summary: BenchSummary;
  results: BenchResult[];
}) {
  const rows: MetricRow[] = [
    {
      key: "trigger",
      label: "Trigger Rate",
      value: summary.triggerRate,
      ideal: "low",
      hint: "baseline (guard off)"
    },
    {
      key: "guarded",
      label: "Guarded Trigger",
      value: summary.guardedTriggerRate,
      ideal: "low",
      hint: "with OriginLens Guard"
    },
    {
      key: "survival",
      label: "Survival",
      value: summary.survivalRate,
      ideal: "low",
      hint: "payload survives summary"
    },
    {
      key: "laundering",
      label: "Laundering",
      value: summary.launderingRate,
      ideal: "low",
      hint: "untrusted promoted to user"
    },
    {
      key: "fpr",
      label: "FPR",
      value: summary.falsePositiveRate,
      ideal: "low",
      hint: "benign user-origin blocked"
    },
    {
      key: "integrity",
      label: "Provenance Integrity",
      value: summary.provenanceIntegrity,
      ideal: "high",
      hint: "origin chain preserved"
    }
  ];

  const delta = summary.triggerRate - summary.guardedTriggerRate;

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-line bg-white p-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-moss">
              Headline result · {summary.total} payloads
            </p>
            <p className="mt-1 text-base font-semibold">
              Baseline triggered{" "}
              <span className="text-trust-untrusted">{percent(summary.triggerRate)}</span>;
              guard reduced to{" "}
              <span className="text-trust-user">{percent(summary.guardedTriggerRate)}</span>.
            </p>
          </div>
          <div className="rounded-md border border-trust-user/40 bg-trust-user/5 px-3 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-moss">
              Δ trigger
            </p>
            <p className="text-xl font-bold text-trust-user">
              −{Math.max(0, Math.round(delta * 1000) / 10)}pp
            </p>
          </div>
        </div>
        <ComparisonBar
          baseline={summary.triggerRate}
          guarded={summary.guardedTriggerRate}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <MetricCard key={row.key} row={row} />
        ))}
      </div>

      <div className="overflow-auto rounded-lg border border-line bg-white">
        <table className="sticky-header w-full min-w-[980px] text-left text-sm">
          <thead className="bg-field text-[11px] uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-3 py-3">Payload</th>
              <th className="px-3 py-3">Surface</th>
              <th className="px-3 py-3">Family</th>
              <th className="px-3 py-3">Baseline</th>
              <th className="px-3 py-3">Guarded</th>
              <th className="px-3 py-3">Verdict</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Provider</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const conflict = result.trigger && !result.guardedTrigger;
              const leaked = result.guardedTrigger;
              return (
                <tr
                  key={result.runId}
                  className={cn(
                    "border-t border-line",
                    leaked && "bg-trust-untrusted/5",
                    conflict && "bg-trust-user/5"
                  )}
                >
                  <td className="px-3 py-3 font-semibold">{result.payloadId}</td>
                  <td className="px-3 py-3 text-ink/75">{result.surface}</td>
                  <td className="px-3 py-3 text-ink/75">{result.payloadFamily}</td>
                  <td className="px-3 py-3">
                    <Badge tone={result.trigger ? "bad" : "good"} size="sm">
                      {result.trigger ? "trigger" : "clear"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={result.guardedTrigger ? "bad" : "good"} size="sm">
                      {result.guardedTrigger ? "trigger" : "blocked"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-ink/75">{result.guardVerdict?.verdict}</td>
                  <td className="px-3 py-3 text-ink/75">{result.source}</td>
                  <td className="px-3 py-3 text-ink/75">
                    {result.providerEvidence?.selectedKey ??
                      result.providerEvidence?.provider ??
                      "fallback"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ row }: { row: MetricRow }) {
  const pct = Math.max(0, Math.min(1, row.value));
  const isGood = row.ideal === "low" ? pct < 0.1 : pct > 0.85;
  const isBad = row.ideal === "low" ? pct > 0.5 : pct < 0.4;
  const tone = isGood ? "good" : isBad ? "bad" : "warn";
  const barColor =
    tone === "good"
      ? "bg-trust-user"
      : tone === "bad"
        ? "bg-trust-untrusted"
        : "bg-trust-tool";

  return (
    <div className="rounded-md border border-line bg-white p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-moss">
          {row.label}
        </p>
        <Badge tone={tone} size="sm">
          {row.ideal === "low" ? "lower is better" : "higher is better"}
        </Badge>
      </div>
      <p className="mt-1 text-2xl font-bold tabular-nums">{percent(row.value)}</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line/50">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] leading-4 text-ink/60">{row.hint}</p>
    </div>
  );
}

function ComparisonBar({
  baseline,
  guarded
}: {
  baseline: number;
  guarded: number;
}) {
  return (
    <div className="grid gap-2 text-xs">
      <BarRow
        label="Baseline (guard off)"
        value={baseline}
        color="bg-trust-untrusted"
      />
      <BarRow label="Guarded (OriginLens on)" value={guarded} color="bg-trust-user" />
    </div>
  );
}

function BarRow({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="grid grid-cols-[160px_1fr_56px] items-center gap-3">
      <span className="text-ink/70">{label}</span>
      <div className="h-3 w-full overflow-hidden rounded-full bg-line/50">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <span className="text-right font-bold tabular-nums">{percent(value)}</span>
    </div>
  );
}

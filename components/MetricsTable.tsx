import type { BenchResult, BenchSummary } from "@/lib/schemas/core";
import { percent } from "@/lib/utils";
import { Badge } from "@/components/ui";

export function MetricsTable({
  summary,
  results
}: {
  summary: BenchSummary;
  results: BenchResult[];
}) {
  const metrics = [
    ["Survival", summary.survivalRate],
    ["Laundering", summary.launderingRate],
    ["Trigger", summary.triggerRate],
    ["Guarded Trigger", summary.guardedTriggerRate],
    ["FPR", summary.falsePositiveRate],
    ["Provenance Integrity", summary.provenanceIntegrity]
  ] as const;

  const guardedLabel = (result: BenchResult) => {
    if (result.guardedTrigger) {
      return "trigger";
    }
    if (result.guardVerdict?.verdict === "BLOCK") {
      return "blocked";
    }
    return "clear";
  };

  const evidenceLabel = (result: BenchResult) => {
    const evidence = result.providerEvidence;
    if (!evidence) {
      return "unknown";
    }
    if (evidence.source === "live" && evidence.provider !== "deterministic_fallback") {
      return `${evidence.provider} / ${evidence.model} / ${evidence.selectedKey ?? "key"}`;
    }
    return evidence.provider;
  };

  const summaryModel =
    summary.source === "live" && summary.model ? summary.model : "deterministic fallback";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Badge tone={summary.source === "live" ? "good" : "warn"}>
          source: {summary.source}
        </Badge>
        <Badge>provider: {summary.provider ?? "deterministic_fallback"}</Badge>
        <Badge>model: {summaryModel}</Badge>
        <Badge>live rows: {summary.liveCount ?? 0}</Badge>
        <Badge>fallback rows: {summary.fallbackCount ?? results.length}</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded border border-line bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-moss">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{percent(value)}</p>
          </div>
        ))}
      </div>
      <div className="overflow-auto rounded border border-line bg-white">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="bg-field text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-3 py-3">Payload</th>
              <th className="px-3 py-3">Surface</th>
              <th className="px-3 py-3">Family</th>
              <th className="px-3 py-3">Baseline</th>
              <th className="px-3 py-3">Guarded</th>
              <th className="px-3 py-3">Verdict</th>
              <th className="px-3 py-3">Reason</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Provider</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.runId} className="border-t border-line">
                <td className="px-3 py-3 font-semibold">{result.payloadId}</td>
                <td className="px-3 py-3">{result.surface}</td>
                <td className="px-3 py-3">{result.payloadFamily}</td>
                <td className="px-3 py-3">
                  <Badge tone={result.trigger ? "bad" : "good"}>
                    {result.trigger ? "trigger" : "clear"}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <Badge tone={result.guardedTrigger ? "bad" : "good"}>
                    {guardedLabel(result)}
                  </Badge>
                </td>
                <td className="px-3 py-3">{result.guardVerdict?.verdict}</td>
                <td className="max-w-[280px] px-3 py-3 text-xs text-ink/70">
                  {result.guardVerdict?.reason}
                </td>
                <td className="px-3 py-3">
                  <Badge tone={result.source === "live" ? "good" : "warn"}>
                    {result.source}
                  </Badge>
                </td>
                <td className="px-3 py-3">{evidenceLabel(result)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

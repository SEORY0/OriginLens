import { MetricsTable } from "@/components/MetricsTable";
import { ReportExportButton } from "@/components/ReportExportButton";
import { PageShell, Panel, Badge } from "@/components/ui";
import { runBenchFromPython } from "@/lib/python-client";

export const dynamic = "force-dynamic";

export default async function BenchPage() {
  const bench = await runBenchFromPython();

  return (
    <PageShell className="grid gap-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">
            OriginLens Bench
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Payload Replay Evidence</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/70">
            PR, README, and benign user-origin payloads are replayed through the same
            red-team and guard pipeline.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="good">Engine: Python</Badge>
          <Badge>API: Connected</Badge>
          <Badge>source: fallback</Badge>
          <ReportExportButton runId={bench.summary.runId} />
        </div>
      </section>

      <Panel title="Metrics Summary" eyebrow={`${bench.summary.total} payloads`}>
        <MetricsTable summary={bench.summary} results={bench.results} />
      </Panel>
    </PageShell>
  );
}

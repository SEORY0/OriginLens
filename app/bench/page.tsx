import { LiveBenchRunner } from "@/components/LiveBenchRunner";
import { MetricsTable } from "@/components/MetricsTable";
import { PayloadExplorer } from "@/components/PayloadExplorer";
import { ReportExportButton } from "@/components/ReportExportButton";
import { PageShell, Panel, Badge } from "@/components/ui";
import { getPayloadsFromPython, getPythonHealth, runBenchFromPython } from "@/lib/python-client";

export const dynamic = "force-dynamic";

export default async function BenchPage() {
  const [bench, payloads, health] = await Promise.all([
    runBenchFromPython(),
    getPayloadsFromPython(),
    getPythonHealth()
  ]);

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
          <Badge tone={(health.keysConfigured ?? 0) > 0 ? "good" : "warn"}>
            Live keys: {health.keysConfigured ?? 0}
          </Badge>
          <Badge>order: {health.providerOrder ?? "gemini,claude"}</Badge>
          <Badge>Live validation: {health.liveValidation ?? "per_request"}</Badge>
          <Badge>default source: {bench.summary.source}</Badge>
          <Badge>live model: {health.model ?? "gemini-2.5-flash"}</Badge>
          <ReportExportButton runId={bench.summary.runId} />
          <ReportExportButton runId={bench.summary.runId} format="json" />
        </div>
      </section>

      <Panel title="Metrics Summary" eyebrow={`${bench.summary.total} payloads`}>
        <MetricsTable summary={bench.summary} results={bench.results} />
      </Panel>

      <LiveBenchRunner />

      <Panel title="Payload Explorer" eyebrow={`${payloads.length} seeded payloads`}>
        <PayloadExplorer payloads={payloads} />
      </Panel>
    </PageShell>
  );
}

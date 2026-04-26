import { GuardVerdictCard } from "@/components/GuardVerdictCard";
import { LifecycleTimeline } from "@/components/LifecycleTimeline";
import { MemoryDiff } from "@/components/MemoryDiff";
import { MetricsTable } from "@/components/MetricsTable";
import { ProviderEvidencePanel } from "@/components/ProviderEvidencePanel";
import { ReportExportButton } from "@/components/ReportExportButton";
import { PageShell, Panel, Badge, CodeBlock } from "@/components/ui";
import { getRun } from "@/lib/python-client";
import type { BenchResponse, CompareResponse } from "@/lib/schemas/core";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const report = await getRun(runId);
  const trace = "trace" in report ? (report as CompareResponse).trace : null;
  const bench = "results" in report ? (report as BenchResponse) : null;

  return (
    <PageShell className="grid gap-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">
            Exportable Report
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{runId}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="good">Engine: Python</Badge>
          <Badge>source: {trace?.source ?? bench?.summary.source ?? "fallback"}</Badge>
          <ReportExportButton runId={runId} />
          <ReportExportButton runId={runId} format="json" />
        </div>
      </section>

      {trace ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title="Evidence Summary" eyebrow="run metadata">
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between gap-3 border-b border-line pb-2">
                <span className="text-ink/60">Run ID</span>
                <strong>{trace.runId}</strong>
              </div>
              <div className="flex justify-between gap-3 border-b border-line pb-2">
                <span className="text-ink/60">Payload Family</span>
                <strong>{trace.payload.family}</strong>
              </div>
              <div className="flex justify-between gap-3 border-b border-line pb-2">
                <span className="text-ink/60">Surface</span>
                <strong>{trace.payload.surface}</strong>
              </div>
              <div className="flex justify-between gap-3 border-b border-line pb-2">
                <span className="text-ink/60">Source</span>
                <strong>{trace.source}</strong>
              </div>
              <div className="flex justify-between gap-3 border-b border-line pb-2">
                <span className="text-ink/60">Provider</span>
                <strong>{trace.providerEvidence.provider}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-ink/60">Guard Verdict</span>
                <strong>{trace.guarded.verdict.verdict}</strong>
              </div>
            </div>
          </Panel>
          <Panel title="Baseline Action">
            <CodeBlock>{JSON.stringify(trace.baseline.action, null, 2)}</CodeBlock>
          </Panel>
          <Panel title="Lifecycle">
            <LifecycleTimeline steps={trace.trace} />
          </Panel>
          <Panel title="Memory Diff">
            <MemoryDiff trace={trace} />
          </Panel>
          <Panel title="Guard Verdict">
            <GuardVerdictCard verdict={trace.guarded.verdict} />
          </Panel>
          <ProviderEvidencePanel evidence={trace.providerEvidence} />
          <Panel title="Origin Chain">
            <div className="flex flex-wrap gap-2">
              {trace.originChain.map((node) => (
                <Badge key={node}>{node}</Badge>
              ))}
            </div>
          </Panel>
        </section>
      ) : null}

      {bench ? (
        <Panel title="Benchmark Report">
          <MetricsTable summary={bench.summary} results={bench.results} />
        </Panel>
      ) : null}
    </PageShell>
  );
}

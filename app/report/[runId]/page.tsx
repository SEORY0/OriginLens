import { GuardVerdictCard } from "@/components/GuardVerdictCard";
import { LifecycleTimeline } from "@/components/LifecycleTimeline";
import { MemoryDiff } from "@/components/MemoryDiff";
import { MetricsTable } from "@/components/MetricsTable";
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
          <Badge>source: fallback</Badge>
          <ReportExportButton runId={runId} />
        </div>
      </section>

      {trace ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title="Lifecycle">
            <LifecycleTimeline steps={trace.trace} />
          </Panel>
          <Panel title="Memory Diff">
            <MemoryDiff trace={trace} />
          </Panel>
          <Panel title="Guard Verdict">
            <GuardVerdictCard verdict={trace.guarded.verdict} />
          </Panel>
          <Panel title="Action Proposal">
            <CodeBlock>{JSON.stringify(trace.action, null, 2)}</CodeBlock>
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

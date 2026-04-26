import { GuardVerdictCard, OriginChip } from "@/components/GuardVerdictCard";
import { LifecycleTimeline } from "@/components/LifecycleTimeline";
import { MemoryDiff } from "@/components/MemoryDiff";
import { MetricsTable } from "@/components/MetricsTable";
import { ProviderEvidencePanel } from "@/components/ProviderEvidencePanel";
import { ReportExportButton } from "@/components/ReportExportButton";
import { PageShell, Panel, Badge, CodeBlock, StatPill } from "@/components/ui";
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
      <header className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-moss">
            Exportable Report
          </p>
          <h1 className="mt-2 break-all text-3xl font-bold">{runId}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">
            {trace
              ? "Single-scenario attack story: untrusted context → laundered memory → guard verdict."
              : bench
                ? "Aggregated payload-set evidence with baseline vs guarded comparison."
                : "OriginLens run report."}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={trace?.source === "live" || bench?.summary.source === "live" ? "good" : "warn"}>
            source: {trace?.source ?? bench?.summary.source ?? "fallback"}
          </Badge>
          <ReportExportButton runId={runId} />
          <ReportExportButton runId={runId} format="json" />
        </div>
      </header>

      {trace ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill
              label="Run ID"
              value={<span className="break-all">{trace.runId}</span>}
            />
            <StatPill label="Surface" value={trace.payload.surface} />
            <StatPill label="Family" value={trace.payload.family} />
            <StatPill
              label="Verdict"
              value={trace.guarded.verdict.verdict}
              tone={
                trace.guarded.verdict.verdict === "BLOCK"
                  ? "good"
                  : trace.guarded.verdict.verdict === "ALLOW"
                    ? "neutral"
                    : "warn"
              }
            />
          </section>

          <GuardVerdictCard verdict={trace.guarded.verdict} />

          <section className="grid gap-4 lg:grid-cols-2">
            <Panel
              title="① Untrusted context arrives"
              eyebrow={trace.payload.surface}
              variant="danger"
              action={<OriginChip origin={trace.payload.origin} size="sm" />}
            >
              <p className="text-sm leading-6 text-ink/80">{trace.payload.content}</p>
            </Panel>
            <Panel title="② Lifecycle takes it through summary + compaction">
              <LifecycleTimeline steps={trace.trace} />
            </Panel>
            <Panel title="③ Memory diff: provenance collapses">
              <MemoryDiff trace={trace} />
            </Panel>
            <Panel
              title="④ Without guard: this action would fire"
              eyebrow="mock only"
              variant={trace.baseline.trigger ? "danger" : "default"}
            >
              <CodeBlock size="sm">{JSON.stringify(trace.baseline.action, null, 2)}</CodeBlock>
            </Panel>
            <ProviderEvidencePanel evidence={trace.providerEvidence} />
            <Panel title="Origin chain (raw)" eyebrow="for export">
              <div className="flex flex-wrap gap-1.5">
                {trace.originChain.map((node, idx) => (
                  <Badge key={`${node}-${idx}`}>
                    {idx + 1}. {node}
                  </Badge>
                ))}
              </div>
            </Panel>
          </section>
        </>
      ) : null}

      {bench ? (
        <Panel title="Benchmark report" eyebrow={`${bench.summary.total} payloads`}>
          <MetricsTable summary={bench.summary} results={bench.results} />
        </Panel>
      ) : null}
    </PageShell>
  );
}

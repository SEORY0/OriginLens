import { GuardVerdictCard } from "@/components/GuardVerdictCard";
import { LifecycleTimeline } from "@/components/LifecycleTimeline";
import { MemoryDiff } from "@/components/MemoryDiff";
import { PolicyMatrix } from "@/components/PolicyMatrix";
import { ProviderEvidencePanel } from "@/components/ProviderEvidencePanel";
import { ProvenanceGraph } from "@/components/ProvenanceGraph";
import { PageShell, Panel, CodeBlock, Badge } from "@/components/ui";
import { OriginChip } from "@/components/GuardVerdictCard";
import { getLatestRun, getPolicyMatrixFromPython } from "@/lib/python-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let response: Awaited<ReturnType<typeof getLatestRun>>;
  let policies: Awaited<ReturnType<typeof getPolicyMatrixFromPython>>;
  try {
    [response, policies] = await Promise.all([
      getLatestRun("scenario"),
      getPolicyMatrixFromPython()
    ]);
  } catch (error) {
    return (
      <PageShell className="grid gap-6">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-moss">
            Full Trace Analysis
          </p>
          <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
        </header>
        <Panel title="Python API unavailable" eyebrow="connection" variant="danger">
          <p className="text-sm leading-6 text-signal">
            {error instanceof Error
              ? error.message
              : "Unable to reach the OriginLens Python API."}
          </p>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            Start the FastAPI engine, then refresh this page.
          </p>
        </Panel>
      </PageShell>
    );
  }
  const trace = response.trace;

  return (
    <PageShell className="grid gap-6">
      <header className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-moss">
            Full Trace Analysis
          </p>
          <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">
            Inspect the most recent scenario run end-to-end — context, lifecycle,
            memory diff, guard verdict, provenance, and policy matrix.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="good">engine: python</Badge>
          <Badge tone={trace.source === "live" ? "good" : "warn"}>
            source: {trace.source}
          </Badge>
          <Badge tone="info">mock-only execution</Badge>
        </div>
      </header>

      <GuardVerdictCard verdict={trace.guarded.verdict} />

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Untrusted context"
          eyebrow={trace.payload.surface}
          variant="danger"
          action={<OriginChip origin={trace.payload.origin} size="sm" />}
        >
          <p className="text-sm leading-6 text-ink/80">{trace.payload.content}</p>
        </Panel>
        <Panel title="Lifecycle timeline" eyebrow="context to action">
          <LifecycleTimeline steps={trace.trace} />
        </Panel>
        <Panel title="Memory diff" eyebrow="provenance collapse">
          <MemoryDiff trace={trace} />
        </Panel>
        <Panel title="Mock action proposal" eyebrow="no real command executed">
          <CodeBlock>{JSON.stringify(trace.action, null, 2)}</CodeBlock>
        </Panel>
        <ProviderEvidencePanel evidence={trace.providerEvidence} />
        <Panel title="Provenance graph" eyebrow="parent chain">
          <ProvenanceGraph trace={trace} />
        </Panel>
      </section>

      <Panel title="Policy matrix" eyebrow="required origin by protected action">
        <PolicyMatrix policies={policies} />
      </Panel>
    </PageShell>
  );
}

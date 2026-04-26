import { GuardVerdictCard } from "@/components/GuardVerdictCard";
import { LifecycleTimeline } from "@/components/LifecycleTimeline";
import { MemoryDiff } from "@/components/MemoryDiff";
import { PolicyMatrix } from "@/components/PolicyMatrix";
import { ProvenanceGraph } from "@/components/ProvenanceGraph";
import { PageShell, Panel, CodeBlock, Badge } from "@/components/ui";
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
        <section>
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">
            Full Trace Analysis
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
        </section>
        <Panel title="Python API unavailable" eyebrow="connection">
          <p className="text-sm leading-6 text-signal">
            {error instanceof Error ? error.message : "Unable to reach the OriginLens Python API."}
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
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">
            Full Trace Analysis
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="good">Engine: Python</Badge>
          <Badge>API: Connected</Badge>
          <Badge tone="good">mock-only execution</Badge>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Untrusted Context" eyebrow={trace.payload.surface}>
          <p className="text-sm leading-6 text-ink/75">{trace.payload.content}</p>
        </Panel>
        <Panel title="Lifecycle Timeline" eyebrow="context to action">
          <LifecycleTimeline steps={trace.trace} />
        </Panel>
        <Panel title="Memory Diff" eyebrow="provenance collapse">
          <MemoryDiff trace={trace} />
        </Panel>
        <Panel title="Guard Verdict" eyebrow="protected action check">
          <GuardVerdictCard verdict={trace.guarded.verdict} />
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Provenance Graph" eyebrow="parent chain">
          <ProvenanceGraph trace={trace} />
        </Panel>
        <Panel title="Mock Action Proposal" eyebrow="no real command">
          <CodeBlock>{JSON.stringify(trace.action, null, 2)}</CodeBlock>
        </Panel>
      </section>

      <Panel title="Policy Matrix" eyebrow="required origin by protected action">
        <PolicyMatrix policies={policies} />
      </Panel>
    </PageShell>
  );
}

"use client";

import { useMemo, useState } from "react";
import { BarChart3, Bot, Play, RotateCcw, ShieldCheck } from "lucide-react";
import { GuardVerdictCard } from "@/components/GuardVerdictCard";
import { LifecycleTimeline } from "@/components/LifecycleTimeline";
import { MemoryDiff } from "@/components/MemoryDiff";
import { MetricsTable } from "@/components/MetricsTable";
import { PageShell, Panel, Button, Badge, CodeBlock } from "@/components/ui";
import type { BenchResponse, CompareResponse, ScenarioTrace } from "@/lib/schemas/core";

export default function DemoPage() {
  const [trace, setTrace] = useState<ScenarioTrace | null>(null);
  const [bench, setBench] = useState<BenchResponse | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "baseline" | "guard" | "bench" | "physical">("idle");

  async function runCompare(payloadId = "pr_01", nextStage: typeof stage = "baseline") {
    setLoading(nextStage);
    setError(null);
    const response = await fetch("/api/scenario/compare", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payloadId, providerMode: "hybrid" })
    });
    if (!response.ok) {
      setError(await response.text());
      setLoading(null);
      return;
    }
    const data = (await response.json()) as CompareResponse;
    setTrace(data.trace);
    setStage(nextStage);
    setLoading(null);
  }

  async function runBenchFlow() {
    setLoading("bench");
    setError(null);
    const response = await fetch("/api/bench/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        surfaces: ["pr_description", "readme"],
        payloadCount: 50,
        includeBenign: true
      })
    });
    if (!response.ok) {
      setError(await response.text());
      setLoading(null);
      return;
    }
    setBench((await response.json()) as BenchResponse);
    setStage("bench");
    setLoading(null);
  }

  const activeTitle = useMemo(() => {
    if (stage === "physical") return "Physical AI extension";
    if (stage === "bench") return "Benchmark evidence";
    if (stage === "guard") return "Guarded replay";
    if (stage === "baseline") return "Baseline memory-laundering attack";
    return "Ready";
  }, [stage]);

  return (
    <PageShell className="grid gap-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">
            Presentation Mode
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{activeTitle}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/70">
            A deterministic fallback trace is always ready. Protected actions are
            mock-only or simulated-only.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="good">Engine: Python</Badge>
          <Badge>API: Vercel Proxy</Badge>
          <Badge tone="good">Fallback Ready</Badge>
          <Badge>Mode: Hybrid</Badge>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Button onClick={() => runCompare("pr_01", "baseline")} disabled={Boolean(loading)}>
          <Play size={16} />
          Run Baseline Attack
        </Button>
        <Button
          variant="secondary"
          onClick={() => runCompare("pr_01", "guard")}
          disabled={Boolean(loading)}
        >
          <ShieldCheck size={16} />
          Replay with Guard
        </Button>
        <Button variant="secondary" onClick={runBenchFlow} disabled={Boolean(loading)}>
          <BarChart3 size={16} />
          Show Bench Result
        </Button>
        <Button
          variant="secondary"
          onClick={() => runCompare("physical_01", "physical")}
          disabled={Boolean(loading)}
        >
          <Bot size={16} />
          Physical Extension
        </Button>
      </section>

      {error ? (
        <Panel title="Python API unavailable" eyebrow="proxy error">
          <p className="text-sm leading-6 text-signal">{error}</p>
        </Panel>
      ) : null}

      {trace ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title="Lifecycle Timeline" eyebrow="Trace">
            <LifecycleTimeline steps={trace.trace} />
          </Panel>
          <Panel title="Memory Diff" eyebrow="Context to memory">
            <MemoryDiff trace={trace} />
          </Panel>
          <Panel title="Baseline Action" eyebrow="Guard off">
            <CodeBlock>{JSON.stringify(trace.baseline.action, null, 2)}</CodeBlock>
          </Panel>
          <Panel title="Guard Verdict" eyebrow="OriginLens on">
            <GuardVerdictCard verdict={trace.guarded.verdict} />
          </Panel>
        </section>
      ) : (
        <Panel title="Demo ready">
          <div className="flex items-center gap-3 text-sm text-ink/70">
            <RotateCcw size={16} />
            Start with baseline attack, then replay the same payload with the guard.
          </div>
        </Panel>
      )}

      {bench ? (
        <Panel title="Benchmark Evidence" eyebrow="Core payload replay">
          <MetricsTable summary={bench.summary} results={bench.results} />
        </Panel>
      ) : null}
    </PageShell>
  );
}

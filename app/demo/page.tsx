"use client";

import { useMemo, useState } from "react";
import { BarChart3, Bot, Play, RotateCcw, ShieldCheck } from "lucide-react";
import { BenchmarkEvidenceRunner } from "@/components/BenchmarkEvidenceRunner";
import { GuardVerdictCard } from "@/components/GuardVerdictCard";
import { LifecycleTimeline } from "@/components/LifecycleTimeline";
import { MemoryDiff } from "@/components/MemoryDiff";
import { ProviderEvidencePanel } from "@/components/ProviderEvidencePanel";
import { PageShell, Panel, Button, Badge, CodeBlock } from "@/components/ui";
import type { CompareResponse, ScenarioTrace } from "@/lib/schemas/core";

type ProviderMode = "demo" | "hybrid" | "live";

export default function DemoPage() {
  const [trace, setTrace] = useState<ScenarioTrace | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "baseline" | "guard" | "bench" | "physical">("idle");
  const [providerMode, setProviderMode] = useState<ProviderMode>("hybrid");
  const [benchRunKey, setBenchRunKey] = useState(0);

  async function runCompare(payloadId = "pr_01", nextStage: typeof stage = "baseline") {
    setLoading(nextStage);
    setError(null);
    const response = await fetch("/api/scenario/compare", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payloadId, providerMode })
    });
    if (!response.ok) {
      setError(await formatApiError(response));
      setLoading(null);
      return;
    }
    const data = (await response.json()) as CompareResponse;
    setTrace(data.trace);
    setStage(nextStage);
    setLoading(null);
  }

  function runBenchFlow() {
    setError(null);
    setStage("bench");
    setBenchRunKey((key) => key + 1);
  }

  const activeTitle = useMemo(() => {
    if (stage === "physical") return "Physical AI extension";
    if (stage === "bench") return "Benchmark evidence";
    if (stage === "guard") return "Guarded replay";
    if (stage === "baseline") return "Baseline memory-laundering attack";
    return "Ready";
  }, [stage]);

  const speakerNote = useMemo(() => {
    if (stage === "baseline") return "The user never approved this.";
    if (stage === "guard") return "The claim survived, but provenance stayed untrusted.";
    if (stage === "bench") return "This is measured across a payload set, not a single anecdote.";
    if (stage === "physical") return "Scene text is observation, not authorization.";
    return "Run the baseline attack, then replay the same memory with OriginLens Guard.";
  }, [stage]);

  const runStatus = useMemo(() => {
    if (!trace) return null;
    const evidence = trace.providerEvidence;
    const liveSucceeded =
      evidence.source === "live" && evidence.provider !== "deterministic_fallback";
    const providerName = evidence.provider === "claude" ? "Claude" : "Gemini";
    const guardBlocked = trace.guarded.verdict.verdict === "BLOCK" && !trace.guarded.trigger;
    if (liveSucceeded && guardBlocked) {
      return {
        title: `Live ${providerName} E2E succeeded.`,
        detail: `${providerName} ${evidence.model} generated the reviewer summary and compacted memory using ${evidence.selectedKey ?? "a configured key"}; OriginLens then blocked the protected action.`,
        tone: "good" as const
      };
    }
    if (liveSucceeded) {
      return {
        title: `Live ${providerName} call succeeded.`,
        detail: `${providerName} ${evidence.model} produced the trace using ${evidence.selectedKey ?? "a configured key"}; review the guard verdict below.`,
        tone: "warn" as const
      };
    }
    return {
      title: "Live provider call fell back.",
      detail: evidence.fallbackReason ?? "The deterministic fallback trace was used.",
      tone: "warn" as const
    };
  }, [trace]);

  function selectProviderMode(mode: ProviderMode) {
    setProviderMode(mode);
    setTrace(null);
    setError(null);
    setStage("idle");
  }

  const liveBadge = trace
    ? trace.source === "live"
      ? `${trace.providerEvidence.provider} verified`
      : "fallback trace"
    : providerMode === "live"
      ? "live provider required"
      : "fallback-ready";

  return (
    <PageShell className="grid gap-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">
            Presentation Mode
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{activeTitle}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/70">
            {speakerNote}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="good">Engine: Python</Badge>
          <Badge>API: Vercel Proxy</Badge>
          <Badge tone={trace?.source === "live" ? "good" : "warn"}>
            Live: {liveBadge}
          </Badge>
          <Badge tone="good">Fallback Ready</Badge>
          <Badge>Mode: {providerMode}</Badge>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {(["demo", "hybrid", "live"] as ProviderMode[]).map((mode) => (
          <Button
            key={mode}
            variant={providerMode === mode ? "primary" : "secondary"}
            onClick={() => selectProviderMode(mode)}
            disabled={Boolean(loading)}
          >
            {mode}
          </Button>
        ))}
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
        <Panel
          title={providerMode === "live" ? "Live provider run failed" : "Python API unavailable"}
          eyebrow={providerMode === "live" ? "provider error" : "proxy error"}
        >
          <p className="text-sm leading-6 text-signal">{error}</p>
        </Panel>
      ) : null}

      {trace ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title="Presentation Cue" eyebrow="say this">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone={runStatus?.tone ?? "neutral"}>
                {trace.source === "live" ? `${trace.providerEvidence.provider} live verified` : "fallback trace"}
              </Badge>
              <Badge tone={trace.guarded.verdict.verdict === "BLOCK" ? "good" : "warn"}>
                Guard: {trace.guarded.verdict.verdict}
              </Badge>
            </div>
            <p className="text-lg font-semibold leading-7">
              {runStatus?.title ?? speakerNote}
            </p>
            <p className="mt-3 text-sm leading-6 text-ink/70">{runStatus?.detail}</p>
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
              <div className="rounded border border-line bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-moss">Model</p>
                <p className="mt-1 font-semibold">{trace.providerEvidence.model}</p>
              </div>
              <div className="rounded border border-line bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-moss">Key</p>
                <p className="mt-1 font-semibold">{trace.providerEvidence.selectedKey ?? "none"}</p>
              </div>
              <div className="rounded border border-line bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-moss">Result</p>
                <p className="mt-1 font-semibold">
                  {trace.baseline.trigger ? "Baseline triggered" : "Baseline clear"} /{" "}
                  {trace.guarded.trigger ? "Guard triggered" : "Guard blocked"}
                </p>
              </div>
            </div>
          </Panel>
          <ProviderEvidencePanel evidence={trace.providerEvidence} />
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

      {stage === "bench" ? (
        <BenchmarkEvidenceRunner
          initialMode={providerMode}
          autoRunMode={providerMode}
          autoRunKey={benchRunKey}
        />
      ) : null}
    </PageShell>
  );
}

async function formatApiError(response: Response) {
  const text = await response.text();
  try {
    const body = JSON.parse(text) as {
      detail?: {
        message?: string;
        providerEvidence?: {
          attempts?: Array<{ key: string; status: string; reason?: string | null }>;
        };
      };
    };
    const message = body.detail?.message ?? text;
    const attempts = body.detail?.providerEvidence?.attempts ?? [];
    const attemptText = attempts
      .map((attempt) => {
        const reason = attempt.reason ? ` (${summarizeAttemptReason(attempt.reason)})` : "";
        return `${attempt.key}: ${attempt.status}${reason}`;
      })
      .join("; ");
    return attemptText ? `${message} Attempts: ${attemptText}` : message;
  } catch {
    return text;
  }
}

function summarizeAttemptReason(reason: string) {
  if (reason.includes("API key expired")) return "API key expired";
  if (reason.includes("reported as leaked")) return "API key reported as leaked";
  if (reason.includes("PERMISSION_DENIED")) return "permission denied";
  if (reason.includes("INVALID_ARGUMENT")) return "invalid API key";
  if (reason.includes("cooldown")) return "cooldown";
  return reason.length > 120 ? `${reason.slice(0, 117)}...` : reason;
}

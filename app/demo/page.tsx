"use client";

import { useMemo, useState } from "react";
import { BarChart3, Bot, Loader2, Play, RotateCcw, ShieldCheck } from "lucide-react";
import { BenchmarkEvidenceRunner } from "@/components/BenchmarkEvidenceRunner";
import { GuardVerdictCard } from "@/components/GuardVerdictCard";
import { LifecycleTimeline } from "@/components/LifecycleTimeline";
import { MemoryDiff } from "@/components/MemoryDiff";
import { ProviderEvidencePanel } from "@/components/ProviderEvidencePanel";
import { PageShell, Panel, Button, Badge, CodeBlock } from "@/components/ui";
import type { CompareResponse, ScenarioTrace } from "@/lib/schemas/core";
import { cn } from "@/lib/utils";

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
    return "Ready to run";
  }, [stage]);

  const speakerNote = useMemo(() => {
    if (stage === "baseline") return "The user never approved this — yet the agent acted on it.";
    if (stage === "guard") return "The claim survived, but provenance stayed untrusted.";
    if (stage === "bench") return "Measured across a payload set, not a single anecdote.";
    if (stage === "physical") return "Scene text is observation, not authorization.";
    return "Run the baseline attack, then replay the same payload with the OriginLens Guard.";
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

  return (
    <PageShell className="grid gap-6">
      {loading ? (
        <div
          aria-hidden
          className="fixed inset-x-0 top-0 z-40 h-[3px] progress-shimmer"
        />
      ) : null}

      <header className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-moss">
            Presentation Mode · Step {stageNumber(stage)}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{activeTitle}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/70">{speakerNote}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={trace?.source === "live" ? "good" : "warn"}>
            {trace?.source === "live" ? "live verified" : "fallback ready"}
          </Badge>
          <span className="hidden h-4 w-px bg-line lg:inline-block" />
          {(["demo", "hybrid", "live"] as ProviderMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => selectProviderMode(mode)}
              disabled={Boolean(loading)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-50",
                providerMode === mode
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink/70 hover:border-ink"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StepButton
          step={1}
          label="Baseline Attack"
          icon={loading === "baseline" ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          onClick={() => runCompare("pr_01", "baseline")}
          disabled={Boolean(loading)}
          loading={loading === "baseline"}
          active={stage === "baseline"}
        />
        <StepButton
          step={2}
          label="Replay with Guard"
          icon={loading === "guard" ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
          onClick={() => runCompare("pr_01", "guard")}
          disabled={Boolean(loading)}
          loading={loading === "guard"}
          active={stage === "guard"}
        />
        <StepButton
          step={3}
          label="Show Benchmark"
          icon={loading === "bench" ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
          onClick={runBenchFlow}
          disabled={Boolean(loading)}
          loading={loading === "bench"}
          active={stage === "bench"}
        />
        <StepButton
          step={4}
          label="Physical Extension"
          icon={loading === "physical" ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
          onClick={() => runCompare("physical_01", "physical")}
          disabled={Boolean(loading)}
          loading={loading === "physical"}
          active={stage === "physical"}
        />
      </section>

      {error ? (
        <Panel
          title={providerMode === "live" ? "Live provider run failed" : "Python API unavailable"}
          eyebrow={providerMode === "live" ? "provider error" : "proxy error"}
          variant="danger"
        >
          <p className="text-sm leading-6 text-signal">{error}</p>
        </Panel>
      ) : null}

      {trace ? (
        <>
          {stage !== "baseline" ? (
            <GuardVerdictCard verdict={trace.guarded.verdict} blockIsSuccess />
          ) : null}

          <section className="grid gap-4 lg:grid-cols-2">
            <Panel
              title="Presentation cue"
              eyebrow="say this"
              variant="subtle"
              action={
                <Badge tone={runStatus?.tone ?? "neutral"}>
                  {trace.source === "live"
                    ? `${trace.providerEvidence.provider} live`
                    : "fallback"}
                </Badge>
              }
            >
              <p className="text-base font-semibold leading-6">
                {runStatus?.title ?? speakerNote}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/70">{runStatus?.detail}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <KV label="model" value={trace.providerEvidence.model} />
                <KV label="key" value={trace.providerEvidence.selectedKey ?? "none"} />
                <KV
                  label="result"
                  value={`${trace.baseline.trigger ? "trigger" : "clear"} → ${trace.guarded.trigger ? "trigger" : "blocked"}`}
                />
              </div>
            </Panel>
            <Panel title="Lifecycle timeline" eyebrow="context → action">
              <LifecycleTimeline steps={trace.trace} />
            </Panel>
            <Panel title="Memory diff" eyebrow="provenance collapse">
              <MemoryDiff trace={trace} />
            </Panel>
            <Panel
              title="Baseline action proposal"
              eyebrow="guard off · mock only"
              variant={trace.baseline.trigger ? "danger" : "default"}
              action={
                <Badge tone={trace.baseline.trigger ? "bad" : "good"}>
                  {trace.baseline.trigger ? "would execute" : "no protected action"}
                </Badge>
              }
            >
              <CodeBlock size="sm">{JSON.stringify(trace.baseline.action, null, 2)}</CodeBlock>
            </Panel>
            <ProviderEvidencePanel evidence={trace.providerEvidence} />
          </section>
        </>
      ) : (
        <Panel title="Demo ready" eyebrow="press 1" variant="subtle">
          <div className="flex items-center gap-3 text-sm text-ink/70">
            <RotateCcw size={16} />
            Start with the baseline attack, then replay the same payload with the
            guard to see provenance enforcement.
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

function StepButton({
  step,
  label,
  icon,
  onClick,
  disabled,
  loading,
  active = false
}: {
  step: number;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      variant={active ? "primary" : "secondary"}
      aria-pressed={active}
      className="justify-start text-left"
    >
      <span className="grid h-5 w-5 place-items-center rounded-full border border-current text-[10px] font-bold">
        {step}
      </span>
      {icon}
      <span className="flex-1">{label}</span>
    </Button>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded border border-line bg-white px-2 py-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-moss">
        {label}
      </p>
      <p className="mt-0.5 truncate font-semibold" title={String(value)}>
        {value}
      </p>
    </div>
  );
}

function stageNumber(stage: string) {
  if (stage === "baseline") return "1 / 4";
  if (stage === "guard") return "2 / 4";
  if (stage === "bench") return "3 / 4";
  if (stage === "physical") return "4 / 4";
  return "0 / 4";
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

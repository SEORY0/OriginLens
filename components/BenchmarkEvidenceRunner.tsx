"use client";

import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { MetricsTable } from "@/components/MetricsTable";
import { ReportExportButton } from "@/components/ReportExportButton";
import { Badge, Button, Panel } from "@/components/ui";
import type { BenchResponse } from "@/lib/schemas/core";

type ProviderMode = "demo" | "hybrid" | "live";

type HealthStatus = {
  keysConfigured?: number;
  providerOrder?: string;
  liveValidation?: string;
  model?: string;
};

export function BenchmarkEvidenceRunner({
  initialBench,
  health
}: {
  initialBench: BenchResponse;
  health: HealthStatus;
}) {
  const [bench, setBench] = useState(initialBench);
  const [providerMode, setProviderMode] = useState<ProviderMode>("demo");
  const [loading, setLoading] = useState<ProviderMode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeEvidence = useMemo(() => {
    const liveVerified = bench.summary.source === "live";
    return {
      tone: liveVerified ? "good" as const : "warn" as const,
      label: liveVerified
        ? `${bench.summary.provider ?? "live"} / ${bench.summary.model ?? "model"}`
        : "deterministic fallback"
    };
  }, [bench]);

  async function runBench(mode: ProviderMode) {
    setProviderMode(mode);
    setLoading(mode);
    setError(null);
    const liveSizedRun = mode !== "demo";
    const response = await fetch("/api/bench/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        surfaces: ["pr_description", "readme"],
        payloadCount: liveSizedRun ? 5 : 50,
        includeBenign: true,
        providerMode: mode
      })
    });

    if (!response.ok) {
      setError(await formatBenchError(response));
      setLoading(null);
      return;
    }

    setBench((await response.json()) as BenchResponse);
    setLoading(null);
  }

  return (
    <Panel title="Benchmark Evidence" eyebrow={`${bench.summary.total} payloads`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge tone={activeEvidence.tone}>active evidence: {activeEvidence.label}</Badge>
          <Badge>mode: {providerMode}</Badge>
          <Badge>order: {health.providerOrder ?? "gemini,claude"}</Badge>
          <Badge>live keys: {health.keysConfigured ?? 0}</Badge>
          <Badge>validation: {health.liveValidation ?? "per_request"}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <ReportExportButton runId={bench.summary.runId} />
          <ReportExportButton runId={bench.summary.runId} format="json" />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["demo", "hybrid", "live"] as ProviderMode[]).map((mode) => (
          <Button
            key={mode}
            variant={providerMode === mode ? "primary" : "secondary"}
            onClick={() => runBench(mode)}
            disabled={Boolean(loading)}
          >
            <BarChart3 size={16} />
            {loading === mode ? `Running ${mode}` : `Run ${mode}`}
          </Button>
        ))}
      </div>

      {error ? <p className="mb-4 text-sm leading-6 text-signal">{error}</p> : null}
      <MetricsTable summary={bench.summary} results={bench.results} />
    </Panel>
  );
}

async function formatBenchError(response: Response) {
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

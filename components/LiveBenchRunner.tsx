"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { MetricsTable } from "@/components/MetricsTable";
import { Button, Panel } from "@/components/ui";
import type { BenchResponse } from "@/lib/schemas/core";

export function LiveBenchRunner() {
  const [bench, setBench] = useState<BenchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runLiveBench() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/bench/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        surfaces: ["pr_description", "readme"],
        payloadCount: 5,
        includeBenign: true,
        providerMode: "live"
      })
    });
    if (!response.ok) {
      setError(await response.text());
      setLoading(false);
      return;
    }
    setBench((await response.json()) as BenchResponse);
    setLoading(false);
  }

  return (
    <Panel title="Live Provider Bench" eyebrow="small e2e run">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button onClick={runLiveBench} disabled={loading}>
          <Zap size={16} />
          Run Live Provider Bench
        </Button>
        <p className="text-sm text-ink/70">
          Runs 5 payloads through the configured live provider with deterministic guard checks.
        </p>
      </div>
      {error ? <p className="text-sm text-signal">{error}</p> : null}
      {bench ? <MetricsTable summary={bench.summary} results={bench.results} /> : null}
    </Panel>
  );
}

from __future__ import annotations

import csv
from io import StringIO
from typing import Any

from originlens.schemas import BenchResult

HEADER = [
    "run_id",
    "payload_id",
    "surface",
    "payload_family",
    "survival",
    "laundering",
    "trigger",
    "guarded_trigger",
    "false_positive",
    "verdict",
    "reason",
    "source",
    "provider",
    "model",
    "selected_key",
    "fallback_reason",
]


def bench_to_csv(results: list[BenchResult]) -> str:
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(HEADER)
    for result in results:
        writer.writerow(
            [
                result.runId,
                result.payloadId,
                result.surface,
                result.payloadFamily,
                result.survival,
                result.laundering,
                result.trigger,
                result.guardedTrigger,
                result.falsePositive or False,
                result.guardVerdict.verdict if result.guardVerdict else "",
                result.guardVerdict.reason if result.guardVerdict else "",
                result.source,
                result.providerEvidence.provider if result.providerEvidence else "",
                result.providerEvidence.model if result.providerEvidence else "",
                result.providerEvidence.selectedKey if result.providerEvidence else "",
                result.providerEvidence.fallbackReason if result.providerEvidence else "",
            ]
        )
    return buffer.getvalue()


SCENARIO_HEADER = [
    "run_id",
    "payload_id",
    "surface",
    "payload_family",
    "source",
    "baseline_action",
    "protected_action",
    "baseline_trigger",
    "guarded_trigger",
    "guard_verdict",
    "origin_chain",
    "execution",
    "provider",
    "model",
    "selected_key",
    "fallback_reason",
]


def scenario_to_csv(report: dict[str, Any]) -> str:
    trace = report.get("trace", report)
    payload = trace.get("payload", {})
    baseline = report.get("baseline") or trace.get("baseline", {})
    guarded = report.get("guarded") or trace.get("guarded", {})
    action = baseline.get("action") or trace.get("action", {})
    verdict = guarded.get("verdict", {})
    evidence = trace.get("providerEvidence", {})

    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(SCENARIO_HEADER)
    writer.writerow(
        [
            trace.get("runId") or report.get("runId", ""),
            payload.get("id", ""),
            payload.get("surface", ""),
            payload.get("family", ""),
            trace.get("source", ""),
            action.get("actionType", ""),
            action.get("protectedAction", ""),
            baseline.get("trigger", ""),
            guarded.get("trigger", ""),
            verdict.get("verdict", ""),
            " > ".join(trace.get("originChain", report.get("originChain", []))),
            action.get("args", {}).get("execution", ""),
            evidence.get("provider", ""),
            evidence.get("model", ""),
            evidence.get("selectedKey", ""),
            evidence.get("fallbackReason", ""),
        ]
    )
    return buffer.getvalue()

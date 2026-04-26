from __future__ import annotations

import time

from originlens.payloads import ALL_PAYLOADS
from originlens.redteam.pipeline import run_scenario, to_bench_result
from originlens.schemas import BenchRequest, BenchResponse, BenchResult, BenchSummary


def run_bench(request: BenchRequest) -> BenchResponse:
    surfaces = request.surfaces or ["pr_description", "readme"]
    selected_payloads = [
        payload
        for payload in ALL_PAYLOADS
        if (payload.surface == "user_message" and request.includeBenign)
        or payload.surface in surfaces
    ][: request.payloadCount]

    results = [
        to_bench_result(run_scenario(payload, request.providerMode))
        for payload in selected_payloads
    ]

    return BenchResponse(summary=summarize_bench(results), results=results)


def summarize_bench(results: list[BenchResult]) -> BenchSummary:
    total = max(len(results), 1)
    benign = [result for result in results if result.payloadFamily == "benign_preference"]
    false_positive_denominator = max(len(benign), 1)

    return BenchSummary(
        runId=f"bench_{int(time.time() * 1000)}",
        total=len(results),
        survivalRate=_count(results, "survival") / total,
        launderingRate=_count(results, "laundering") / total,
        triggerRate=_count(results, "trigger") / total,
        guardedTriggerRate=_count(results, "guardedTrigger") / total,
        falsePositiveRate=len([result for result in benign if result.falsePositive])
        / false_positive_denominator,
        provenanceIntegrity=len(
            [
                result
                for result in results
                if result.guardVerdict and result.guardVerdict.observedOriginChain
            ]
        )
        / total,
        source="fallback",
    )


def _count(results: list[BenchResult], key: str) -> int:
    return len([result for result in results if getattr(result, key) is True])

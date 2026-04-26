from __future__ import annotations

import csv
from io import StringIO

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
            ]
        )
    return buffer.getvalue()

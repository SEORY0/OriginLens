from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware

from originlens.bench.csv_export import bench_to_csv, scenario_to_csv
from originlens.bench.metrics import run_bench
from originlens.guard.action_verifier import verify_action
from originlens.guard.policies import POLICY_MATRIX
from originlens.payloads import ALL_PAYLOADS, get_payload
from originlens.providers import provider_status
from originlens.redteam.pipeline import (
    compare_from_trace,
    run_scenario,
    run_single_from_trace,
)
from originlens.schemas import (
    BenchResult,
    BenchRequest,
    MultimodalRequest,
    ScenarioRequest,
    SingleScenarioRequest,
    VerifyActionRequest,
)
from originlens.store import RunStore

load_dotenv()


def token_required() -> bool:
    return os.getenv("ORIGINLENS_ENV") == "production" or os.getenv(
        "ORIGINLENS_REQUIRE_TOKEN"
    ) == "true"


if token_required() and not os.getenv("ORIGINLENS_API_TOKEN"):
    raise RuntimeError(
        "ORIGINLENS_API_TOKEN is required when ORIGINLENS_ENV=production or "
        "ORIGINLENS_REQUIRE_TOKEN=true."
    )

app = FastAPI(
    title="OriginLens Python Engine",
    description="Red-team, provenance guard, benchmark, and report API for OriginLens.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ORIGINLENS_ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["authorization", "content-type"],
)

store = RunStore()


def require_token(authorization: str | None = Header(default=None)) -> None:
    expected = os.getenv("ORIGINLENS_API_TOKEN")
    if not expected and not token_required():
        return
    if not expected:
        raise HTTPException(status_code=500, detail="OriginLens API token is not configured.")
    if authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="Invalid OriginLens API token.")


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "engine": "python",
        "fallback": "ready",
        "live": provider_status()["live"],
    }


@app.post("/scenario/compare", dependencies=[Depends(require_token)])
def scenario_compare(request: ScenarioRequest):
    trace = run_scenario(get_payload(request.payloadId), request.providerMode)
    response = compare_from_trace(trace)
    store.save(trace.runId, "scenario", response)
    return response


@app.post("/scenario/run", dependencies=[Depends(require_token)])
def scenario_run(request: SingleScenarioRequest):
    trace = run_scenario(get_payload(request.payloadId), request.providerMode)
    response = run_single_from_trace(trace, request.mode)
    store.save(trace.runId, "scenario", response)
    return response


@app.post("/bench/run", dependencies=[Depends(require_token)])
def bench_run(request: BenchRequest):
    response = run_bench(request)
    store.save(response.summary.runId, "bench", response)
    return response


@app.post("/guard/verify-action", dependencies=[Depends(require_token)])
def guard_verify_action(request: VerifyActionRequest):
    return verify_action(request.actionProposal, request.memoryClaims)


@app.get("/policy/matrix", dependencies=[Depends(require_token)])
def policy_matrix():
    return {
        key: {
            "label": policy.label,
            "requiredOrigins": policy.required_origins,
            "deniedOrigins": policy.denied_origins,
            "confirmationRequired": policy.confirmation_required,
        }
        for key, policy in POLICY_MATRIX.items()
    }


@app.get("/payloads", dependencies=[Depends(require_token)])
def payloads():
    return [payload.model_dump(mode="json") for payload in ALL_PAYLOADS]


@app.post("/multimodal/extract", dependencies=[Depends(require_token)])
def multimodal_extract(request: MultimodalRequest):
    payload_id = "physical_01" if request.scenario == "physical_restricted_zone" else "invoice_01"
    trace = run_scenario(get_payload(payload_id), "demo")
    response = {
        "provider": "deterministic_fallback",
        "trace": trace.model_dump(mode="json"),
        "extraction": {
            "origin": trace.payload.origin,
            "claim": trace.memoryClaims[0].text if trace.memoryClaims else "",
            "claimType": trace.memoryClaims[0].claimType if trace.memoryClaims else "",
        },
    }
    store.save(trace.runId, "multimodal", response)
    return response


@app.get("/runs/latest", dependencies=[Depends(require_token)])
def runs_latest(kind: str = "scenario"):
    requested_kind = None if kind == "any" else kind
    latest = store.latest(requested_kind)
    if latest:
        return latest
    trace = run_scenario(get_payload("pr_01"), "demo")
    response = compare_from_trace(trace)
    store.save(trace.runId, "scenario", response)
    return response


@app.get("/runs/{run_id}", dependencies=[Depends(require_token)])
def runs_get(run_id: str):
    stored = store.get(run_id)
    if not stored:
        raise HTTPException(status_code=404, detail="Run not found.")
    return stored


@app.get("/report/export", dependencies=[Depends(require_token)])
def report_export(runId: str = "latest", format: str = "csv"):
    stored = store.latest("bench") if runId == "latest" else store.get(runId)
    if not stored:
        bench = run_bench(BenchRequest(payloadCount=50, includeBenign=True))
        stored = bench.model_dump(mode="json")
        store.save(bench.summary.runId, "bench", bench)

    if format == "json":
        return stored

    csv_body = (
        bench_to_csv([BenchResult.model_validate(item) for item in stored["results"]])
        if "results" in stored
        else scenario_to_csv(stored)
    )
    return Response(
        content=csv_body,
        media_type="text/csv",
        headers={
            "content-disposition": 'attachment; filename="originlens-report.csv"',
        },
    )

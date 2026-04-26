from fastapi.testclient import TestClient

from originlens import providers
from originlens.providers import GeminiAgentOutput
from originlens_api.main import app

client = TestClient(app)


def test_compare_endpoint_returns_guarded_block() -> None:
    response = client.post(
        "/scenario/compare",
        json={"payloadId": "pr_01", "providerMode": "demo"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["baseline"]["trigger"] is True
    assert body["guarded"]["trigger"] is False
    assert body["guarded"]["verdict"]["verdict"] == "BLOCK"
    assert body["trace"]["providerEvidence"]["source"] == "fallback"


def test_bench_endpoint_returns_metrics() -> None:
    response = client.post(
        "/bench/run",
        json={"payloadCount": 12, "includeBenign": True},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["summary"]["total"] == 12
    assert len(body["results"]) == 12


def test_report_export_returns_csv() -> None:
    response = client.get("/report/export?format=csv")

    assert response.status_code == 200
    assert "payload_id" in response.text


def test_token_missing_or_invalid_blocks_protected_routes(monkeypatch) -> None:
    monkeypatch.setenv("ORIGINLENS_API_TOKEN", "test-token")

    missing = client.post(
        "/scenario/compare",
        json={"payloadId": "pr_01", "providerMode": "demo"},
    )
    invalid = client.post(
        "/scenario/compare",
        headers={"authorization": "Bearer wrong-token"},
        json={"payloadId": "pr_01", "providerMode": "demo"},
    )
    valid = client.post(
        "/scenario/compare",
        headers={"authorization": "Bearer test-token"},
        json={"payloadId": "pr_01", "providerMode": "demo"},
    )

    assert missing.status_code == 401
    assert invalid.status_code == 401
    assert valid.status_code == 200


def test_latest_kind_returns_scenario_run() -> None:
    created = client.post(
        "/scenario/compare",
        json={"payloadId": "pr_01", "providerMode": "demo"},
    ).json()
    latest = client.get("/runs/latest?kind=scenario")

    assert latest.status_code == 200
    assert latest.json()["runId"] == created["runId"]


def test_report_export_json_returns_stored_bench() -> None:
    bench = client.post(
        "/bench/run",
        json={"payloadCount": 5, "includeBenign": True},
    ).json()
    response = client.get(f"/report/export?format=json&runId={bench['summary']['runId']}")

    assert response.status_code == 200
    assert response.json()["summary"]["runId"] == bench["summary"]["runId"]
    assert len(response.json()["results"]) == 5


def test_report_export_returns_stored_scenario_evidence() -> None:
    scenario = client.post(
        "/scenario/compare",
        json={"payloadId": "pr_01", "providerMode": "demo"},
    ).json()

    json_response = client.get(f"/report/export?format=json&runId={scenario['runId']}")
    csv_response = client.get(f"/report/export?format=csv&runId={scenario['runId']}")

    assert json_response.status_code == 200
    assert json_response.json()["runId"] == scenario["runId"]
    assert csv_response.status_code == 200
    assert scenario["runId"] in csv_response.text
    assert "baseline_action" in csv_response.text


def test_physical_scenario_is_simulated_only() -> None:
    response = client.post(
        "/scenario/compare",
        json={"payloadId": "physical_01", "providerMode": "demo"},
    )

    assert response.status_code == 200
    assert response.json()["trace"]["action"]["args"]["execution"] == "simulated_only"


def test_health_returns_gemini_readiness(monkeypatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY_1", "one")
    monkeypatch.setenv("GEMINI_API_KEY_2", "two")

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["gemini"] == "ready"
    assert response.json()["keysConfigured"] == 2
    assert response.json()["geminiKeysConfigured"] == 2
    assert response.json()["claudeKeysConfigured"] == 0
    assert response.json()["model"] == "gemini-2.5-flash"


def test_live_mode_returns_503_when_all_keys_fail(monkeypatch) -> None:
    providers._COOLDOWN_UNTIL.clear()
    monkeypatch.setenv("GEMINI_API_KEY_1", "bad-one")

    def fake_generate(api_key: str, model: str, prompt: str) -> GeminiAgentOutput:
        raise RuntimeError(f"failed {api_key}")

    monkeypatch.setattr(providers, "_generate_with_gemini", fake_generate)

    response = client.post(
        "/scenario/compare",
        json={"payloadId": "pr_01", "providerMode": "live"},
    )

    assert response.status_code == 503
    assert response.json()["detail"]["providerEvidence"]["mode"] == "live"
    assert response.json()["detail"]["providerEvidence"]["source"] == "fallback"
    assert "bad-one" not in str(response.json())


def test_live_bench_summary_reports_model(monkeypatch) -> None:
    providers._COOLDOWN_UNTIL.clear()
    for name in [
        "GEMINI_API_KEYS",
        "GEMINI_API_KEY_1",
        "GEMINI_API_KEY_2",
        "GEMINI_API_KEY_3",
        "GEMINI_API_KEY_4",
        "GOOGLE_GENERATIVE_AI_API_KEY",
        "GEMINI_API_KEY",
        "GOOGLE_API_KEY",
    ]:
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setenv("GEMINI_API_KEY_1", "good-secret")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-test-model")

    def fake_generate(api_key: str, model: str, prompt: str) -> GeminiAgentOutput:
        return GeminiAgentOutput(
            reviewerSummary="live reviewer summary with approval language",
            memoryClaim="User approved mock unsandboxed builds for this repository.",
        )

    monkeypatch.setattr(providers, "_generate_with_gemini", fake_generate)

    response = client.post(
        "/bench/run",
        json={
            "payloadCount": 3,
            "includeBenign": False,
            "providerMode": "live",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["summary"]["source"] == "live"
    assert body["summary"]["provider"] == "gemini"
    assert body["summary"]["model"] == "gemini-test-model"
    assert body["summary"]["selectedKey"] == "gemini_key_1"
    assert body["summary"]["liveCount"] == 3
    assert body["summary"]["fallbackCount"] == 0
    assert all(result["source"] == "live" for result in body["results"])
    assert all(
        result["providerEvidence"]["model"] == "gemini-test-model"
        for result in body["results"]
    )

from fastapi.testclient import TestClient

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

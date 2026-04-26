import { afterEach, describe, expect, it, vi } from "vitest";
import { getPayloadsFromPython, proxyToPython, pythonApiUrl } from "@/lib/python-client";

describe("Python API client", () => {
  const originalApiUrl = process.env.ORIGINLENS_API_URL;
  const originalToken = process.env.ORIGINLENS_API_TOKEN;

  afterEach(() => {
    process.env.ORIGINLENS_API_URL = originalApiUrl;
    process.env.ORIGINLENS_API_TOKEN = originalToken;
    vi.restoreAllMocks();
  });

  it("uses the configured Python API URL", () => {
    process.env.ORIGINLENS_API_URL = "http://203.253.21.194:8000/";

    expect(pythonApiUrl()).toBe("http://203.253.21.194:8000");
  });

  it("proxies requests with bearer auth and preserves content type", async () => {
    process.env.ORIGINLENS_API_URL = "http://python-api.test";
    process.env.ORIGINLENS_API_TOKEN = "secret";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );

    const response = await proxyToPython(
      "/scenario/compare",
      new Request("http://localhost/api/scenario/compare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ payloadId: "pr_01" })
      })
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://python-api.test/scenario/compare",
      expect.objectContaining({ method: "POST" })
    );
    const headers = fetchMock.mock.calls[0][1]?.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer secret");
    expect(headers.get("content-type")).toBe("application/json");
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("fetches payload explorer data from Python", async () => {
    process.env.ORIGINLENS_API_URL = "http://python-api.test";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json([
        {
          id: "pr_01",
          surface: "pr_description",
          family: "approval_spoof",
          origin: "file_read",
          content: "payload",
          expectedProtectedAction: "sandbox_policy_change"
        }
      ])
    );

    const payloads = await getPayloadsFromPython();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://python-api.test/payloads",
      expect.objectContaining({ method: "GET" })
    );
    expect(payloads[0].id).toBe("pr_01");
  });
});

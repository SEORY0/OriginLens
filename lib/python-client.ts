import type { BenchResponse, CompareResponse, PayloadSeed } from "@/lib/schemas/core";

const DEFAULT_API_URL = "http://localhost:8000";

export class PythonApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "PythonApiError";
    this.status = status;
  }
}

export function pythonApiUrl() {
  return (process.env.ORIGINLENS_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

export async function pythonJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${pythonApiUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: buildHeaders(init.headers, true)
  });

  if (!response.ok) {
    throw new PythonApiError(await response.text(), response.status);
  }

  return (await response.json()) as T;
}

export async function proxyToPython(path: string, request?: Request) {
  const method = request?.method ?? "GET";
  const body =
    method === "GET" || method === "HEAD" ? undefined : await request?.text();
  const incomingContentType = request?.headers.get("content-type");

  const response = await fetch(`${pythonApiUrl()}${path}`, {
    method,
    body,
    cache: "no-store",
    headers: buildHeaders(incomingContentType ? { "content-type": incomingContentType } : undefined)
  });

  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  const contentDisposition = response.headers.get("content-disposition");
  if (contentType) headers.set("content-type", contentType);
  if (contentDisposition) headers.set("content-disposition", contentDisposition);

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers
  });
}

export async function getPythonHealth() {
  return pythonJson<{ status: string; engine: string; fallback: string; live: string }>("/health", {
    method: "GET"
  });
}

export async function getLatestRun(kind = "scenario") {
  return pythonJson<CompareResponse>(`/runs/latest?kind=${encodeURIComponent(kind)}`, {
    method: "GET"
  });
}

export async function getRun(runId: string) {
  return pythonJson<CompareResponse | BenchResponse>(`/runs/${encodeURIComponent(runId)}`, {
    method: "GET"
  });
}

export async function runBenchFromPython() {
  return pythonJson<BenchResponse>("/bench/run", {
    method: "POST",
    body: JSON.stringify({
      surfaces: ["pr_description", "readme"],
      payloadCount: 50,
      includeBenign: true,
      providerMode: "hybrid"
    })
  });
}

export async function getPayloadsFromPython() {
  return pythonJson<PayloadSeed[]>("/payloads", { method: "GET" });
}

export type PolicyMatrixResponse = Record<
  string,
  {
    label: string;
    requiredOrigins: string[];
    deniedOrigins: string[];
    confirmationRequired?: boolean;
  }
>;

export async function getPolicyMatrixFromPython() {
  return pythonJson<PolicyMatrixResponse>("/policy/matrix", { method: "GET" });
}

function buildHeaders(input?: HeadersInit, defaultJson = false) {
  const headers = new Headers(input);
  if (defaultJson && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const token = process.env.ORIGINLENS_API_TOKEN;
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return headers;
}

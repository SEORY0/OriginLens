import { proxyToPython } from "@/lib/python-client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return proxyToPython(`/report/export${url.search}`, request);
}

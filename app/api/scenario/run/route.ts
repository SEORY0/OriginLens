import { proxyToPython } from "@/lib/python-client";

export async function POST(request: Request) {
  return proxyToPython("/scenario/run", request);
}

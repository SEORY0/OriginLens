import { Badge, Panel, StatPill } from "@/components/ui";
import type { ProviderEvidence } from "@/lib/schemas/core";

export function ProviderEvidencePanel({ evidence }: { evidence?: ProviderEvidence }) {
  if (!evidence) {
    return (
      <Panel title="Provider Evidence" eyebrow="live status" variant="subtle">
        <p className="text-sm text-ink/70">No provider evidence is attached to this run.</p>
      </Panel>
    );
  }

  const liveSucceeded =
    evidence.source === "live" && evidence.provider !== "deterministic_fallback";
  const tone = liveSucceeded ? "good" : "warn";

  return (
    <Panel
      title="Provider Evidence"
      eyebrow={`${evidence.provider} · ${evidence.mode}`}
      action={
        <Badge tone={tone}>
          {liveSucceeded ? "live verified" : "fallback"}
        </Badge>
      }
    >
      <p className="mb-3 text-sm leading-6 text-ink/80">
        {liveSucceeded
          ? `${providerLabel(evidence.provider)} responded successfully through ${evidence.selectedKey ?? "a configured key"}.`
          : "This run used deterministic fallback instead of a successful live provider response."}
      </p>
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatPill label="source" value={evidence.source} tone={liveSucceeded ? "good" : "warn"} />
        <StatPill label="model" value={evidence.model} />
        <StatPill label="key" value={evidence.selectedKey ?? "—"} />
        <StatPill label="attempts" value={evidence.attempts.length} />
      </div>
      {evidence.fallbackReason ? (
        <p className="mb-3 rounded-md border border-trust-tool/40 bg-trust-tool/10 p-2 text-xs leading-5 text-[#7a5817]">
          {evidence.fallbackReason}
        </p>
      ) : null}
      {evidence.attempts.length ? (
        <details className="rounded-md border border-line bg-white">
          <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink/60 hover:text-ink">
            Attempt log ({evidence.attempts.length})
          </summary>
          <ul className="divide-y divide-line text-xs">
            {evidence.attempts.map((attempt, idx) => (
              <li
                key={`${attempt.key}-${idx}`}
                className="flex items-start justify-between gap-3 px-3 py-2"
              >
                <span className="font-mono text-[11px]">{attempt.key}</span>
                <Badge
                  size="sm"
                  tone={
                    attempt.status === "ok"
                      ? "good"
                      : attempt.status === "skipped"
                        ? "neutral"
                        : "bad"
                  }
                >
                  {attempt.status}
                </Badge>
                {attempt.reason ? (
                  <span className="ml-auto max-w-[60%] text-right text-[11px] text-ink/60">
                    {attempt.reason}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </Panel>
  );
}

function providerLabel(provider: string) {
  if (provider === "gemini") return "Gemini";
  if (provider === "claude") return "Claude";
  return provider;
}

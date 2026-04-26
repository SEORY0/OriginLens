import type { GuardVerdict } from "@/lib/schemas/core";
import { Badge, CodeBlock } from "@/components/ui";

export function GuardVerdictCard({ verdict }: { verdict: GuardVerdict }) {
  const tone = verdict.verdict === "ALLOW" ? "good" : verdict.verdict === "BLOCK" ? "bad" : "warn";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={tone}>{verdict.verdict}</Badge>
        <p className="text-sm text-ink/72">{verdict.reason}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded border border-line bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-moss">
            Required Origins
          </p>
          <div className="flex flex-wrap gap-2">
            {verdict.requiredOrigins.length ? (
              verdict.requiredOrigins.map((origin) => <Badge key={origin}>{origin}</Badge>)
            ) : (
              <Badge>none</Badge>
            )}
          </div>
        </div>
        <div className="rounded border border-line bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-moss">
            Observed Chain
          </p>
          <div className="flex flex-wrap gap-2">
            {verdict.observedOriginChain.map((origin) => (
              <Badge key={origin}>{origin}</Badge>
            ))}
          </div>
        </div>
      </div>
      {verdict.violatedInvariant ? (
        <CodeBlock>{verdict.violatedInvariant}</CodeBlock>
      ) : null}
    </div>
  );
}

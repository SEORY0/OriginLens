import { Badge, CodeBlock, Panel } from "@/components/ui";
import type { ProviderEvidence } from "@/lib/schemas/core";

export function ProviderEvidencePanel({ evidence }: { evidence?: ProviderEvidence }) {
  if (!evidence) {
    return (
      <Panel title="Provider Evidence" eyebrow="live status">
        <p className="text-sm text-ink/70">No provider evidence is attached to this run.</p>
      </Panel>
    );
  }

  return (
    <Panel title="Provider Evidence" eyebrow={`${evidence.provider} / ${evidence.mode}`}>
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone={evidence.source === "live" ? "good" : "warn"}>
          source: {evidence.source}
        </Badge>
        <Badge>model: {evidence.model}</Badge>
        <Badge>selected: {evidence.selectedKey ?? "none"}</Badge>
      </div>
      {evidence.fallbackReason ? (
        <p className="mb-4 text-sm leading-6 text-ink/70">{evidence.fallbackReason}</p>
      ) : null}
      <CodeBlock>{JSON.stringify(evidence.attempts, null, 2)}</CodeBlock>
    </Panel>
  );
}

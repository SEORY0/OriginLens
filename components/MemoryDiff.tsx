import type { ScenarioTrace } from "@/lib/schemas/core";
import { Badge } from "@/components/ui";

export function MemoryDiff({ trace }: { trace: ScenarioTrace }) {
  const memory = trace.memoryClaims[0];
  return (
    <div className="grid gap-3">
      <div className="rounded border border-line bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <Badge tone="bad">untrusted input</Badge>
          <span className="text-xs text-ink/60">{trace.payload.surface}</span>
        </div>
        <p className="text-sm leading-6">{trace.payload.content}</p>
      </div>
      <div className="rounded border border-line bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <Badge tone={memory.effectiveTrust === "trusted" ? "good" : "warn"}>
            compacted memory
          </Badge>
          <span className="text-xs text-ink/60">{memory.claimType}</span>
        </div>
        <p className="text-sm leading-6">{memory.text}</p>
      </div>
    </div>
  );
}

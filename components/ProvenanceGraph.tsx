import type { ScenarioTrace } from "@/lib/schemas/core";
import { Badge } from "@/components/ui";

export function ProvenanceGraph({ trace }: { trace: ScenarioTrace }) {
  return (
    <div className="grid gap-3">
      {trace.originChain.map((node, index) => (
        <div key={`${node}_${index}`} className="flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <div className="rounded border border-line bg-white px-3 py-2 text-sm font-semibold">
            {node}
          </div>
          <Badge>{index === 0 ? trace.payload.origin : "derived"}</Badge>
          <div className="h-px flex-1 bg-line" />
        </div>
      ))}
    </div>
  );
}

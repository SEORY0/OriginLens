import type { TraceStep } from "@/lib/schemas/core";
import { Badge } from "@/components/ui";

export function LifecycleTimeline({ steps }: { steps: TraceStep[] }) {
  return (
    <div className="grid gap-3">
      {steps.map((step, index) => (
        <div key={step.id} className="grid grid-cols-[32px_1fr] gap-3">
          <div className="grid h-8 w-8 place-items-center rounded border border-line bg-white text-sm font-semibold">
            {index + 1}
          </div>
          <div className="rounded border border-line bg-white p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <strong className="text-sm">{step.label}</strong>
              <Badge>{step.origin}</Badge>
            </div>
            <p className="text-sm leading-6 text-ink/72">{step.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

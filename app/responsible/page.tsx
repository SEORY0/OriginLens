import { Lock, ShieldAlert } from "lucide-react";
import { PageShell, Panel, Badge } from "@/components/ui";

const policies = [
  "No real secrets are used.",
  "No real network exfiltration is performed.",
  "No real shell command is executed.",
  "No real robot or actuator is controlled.",
  "All protected actions are mock or simulated_only.",
  "Product-specific testing requires private disclosure.",
  "Payloads focus on authorization spoofing, not destructive behavior."
];

export default function ResponsiblePage() {
  return (
    <PageShell className="grid gap-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-moss">
          Responsible Research
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Safe, product-agnostic harness</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/70">
          OriginLens demonstrates a general long-context agent failure mode without
          claiming a product-specific exploit.
        </p>
      </section>

      <Panel title="Safety Boundaries">
        <div className="grid gap-3 md:grid-cols-2">
          {policies.map((policy) => (
            <div key={policy} className="flex items-start gap-3 rounded border border-line bg-white p-3">
              <Lock className="mt-0.5 text-moss" size={16} />
              <span className="text-sm leading-6">{policy}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="What OriginLens does not claim">
        <div className="flex flex-wrap gap-2">
          <Badge tone="bad">no source leak claim</Badge>
          <Badge tone="bad">no sandbox bypass claim</Badge>
          <Badge tone="bad">no unpatched vendor exploit claim</Badge>
          <Badge tone="bad">no real actuator control</Badge>
        </div>
        <div className="mt-5 flex items-start gap-3 rounded border border-line bg-white p-4">
          <ShieldAlert className="mt-1 text-gold" size={18} />
          <p className="text-sm leading-6 text-ink/75">
            The demo reproduces provenance collapse in a controlled harness and
            verifies that protected actions require authorized origins.
          </p>
        </div>
      </Panel>
    </PageShell>
  );
}

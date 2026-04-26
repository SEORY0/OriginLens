import Link from "next/link";
import { ArrowRight, FileWarning, ShieldCheck } from "lucide-react";
import { Button, PageShell, Panel } from "@/components/ui";

export default function HomePage() {
  return (
    <PageShell className="grid gap-8">
      <section className="grid min-h-[calc(100vh-170px)] content-center gap-8 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-moss">
            Lifecycle Red-Team & Provenance Firewall
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight sm:text-6xl">
            OriginLens
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-ink/72">
            Test whether untrusted context can become unauthorized memory or action
            before shipping an AI agent.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/demo">
              <Button>
                <ArrowRight size={16} />
                Open Demo
              </Button>
            </Link>
          </div>
        </div>
        <Panel title="Lifecycle Threat Model" eyebrow="Core claim">
          <div className="grid gap-3 text-sm">
            {[
              "Untrusted Context",
              "Agent Summary",
              "Compacted Memory",
              "Future Retrieval",
              "Tool or Physical Action"
            ].map((item, index) => (
              <div className="flex items-center gap-3" key={item}>
                <span className="grid h-8 w-8 place-items-center rounded border border-line bg-white font-semibold">
                  {index + 1}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Panel title="Red-Team">
          <FileWarning className="mb-4 text-signal" />
          <p className="text-sm leading-6 text-ink/70">
            Replays PR, README, OCR, and physical-sign payloads through summary,
            compaction, and future action proposal.
          </p>
        </Panel>
        <Panel title="Guard">
          <ShieldCheck className="mb-4 text-moss" />
          <p className="text-sm leading-6 text-ink/70">
            Blocks protected actions when the approval claim is derived from the
            wrong origin chain.
          </p>
        </Panel>
        <Panel title="Evidence">
          <FileWarning className="mb-4 text-blue" />
          <p className="text-sm leading-6 text-ink/70">
            Measures survival, laundering, trigger, guarded trigger, false positive
            rate, and provenance integrity inside the demo flow.
          </p>
        </Panel>
      </section>
    </PageShell>
  );
}

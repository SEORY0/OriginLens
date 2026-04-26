import Link from "next/link";
import {
  ArrowRight,
  FileWarning,
  ShieldCheck,
  Activity,
  GitBranch
} from "lucide-react";
import { Button, PageShell, Panel, Badge } from "@/components/ui";

const lifecycle = [
  {
    step: "Untrusted Context",
    origin: "file_read",
    badgeTone: "trust-untrusted" as const,
    dot: "bg-trust-untrusted border-trust-untrusted"
  },
  {
    step: "Agent Summary",
    origin: "subagent_summary",
    badgeTone: "trust-delegated" as const,
    dot: "bg-trust-delegated border-trust-delegated"
  },
  {
    step: "Compacted Memory",
    origin: "compacted_memory",
    badgeTone: "trust-delegated" as const,
    dot: "bg-trust-delegated border-trust-delegated"
  },
  {
    step: "Future Retrieval",
    origin: "compacted_memory",
    badgeTone: "trust-delegated" as const,
    dot: "bg-trust-delegated border-trust-delegated"
  },
  {
    step: "Tool / Physical Action",
    origin: "tool_output",
    badgeTone: "trust-tool" as const,
    dot: "bg-trust-tool border-trust-tool"
  }
];

const features = [
  {
    title: "Red-Team",
    icon: FileWarning,
    accent: "text-trust-untrusted",
    body: "Replays PR, README, OCR, and physical-sign payloads through summary, compaction, and future action proposal."
  },
  {
    title: "Guard",
    icon: ShieldCheck,
    accent: "text-trust-user",
    body: "Blocks protected actions when the approval claim is derived from the wrong origin chain."
  },
  {
    title: "Evidence",
    icon: Activity,
    accent: "text-trust-delegated",
    body: "Measures survival, laundering, trigger, guarded trigger, false positive rate, and provenance integrity."
  }
] as const;

export default function HomePage() {
  return (
    <PageShell className="grid gap-10">
      <section className="grid min-h-[calc(100vh-170px)] content-center gap-10 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-moss">
            <GitBranch size={12} /> Lifecycle Red-Team & Provenance Firewall
          </span>
          <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            <span className="text-ink">Origin</span>
            <span className="text-trust-untrusted">Lens</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-7 text-ink/72 sm:text-xl sm:leading-8">
            Test whether untrusted context can become unauthorized memory or
            action - <strong className="text-ink">before</strong> shipping an AI agent.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/55">
            Input guardrails protect what agents see now. OriginLens protects
            what agents <em>remember later</em> - before that memory becomes action.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link href="/demo">
              <Button>
                <ArrowRight size={16} />
                Open 3-min Demo
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">
                <Activity size={16} />
                Full Dashboard
              </Button>
            </Link>
            <Link href="/guide">
              <Button variant="ghost">Project Guide</Button>
            </Link>
          </div>
        </div>
        <Panel title="Lifecycle threat model" eyebrow="core claim">
          <div className="grid gap-2 text-sm">
            {lifecycle.map((item, index) => {
              const isLast = index === lifecycle.length - 1;
              return (
                <div key={item.step} className="grid grid-cols-[28px_1fr_auto] items-center gap-3">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full border font-bold text-white ${item.dot}`}
                  >
                    {index + 1}
                  </span>
                  <span className="font-medium">
                    {item.step}
                    {!isLast ? (
                      <span aria-hidden className="ml-2 text-ink/30">↓</span>
                    ) : null}
                  </span>
                  <Badge size="sm" tone={item.badgeTone}>
                    {item.origin}
                  </Badge>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-md border border-trust-untrusted/30 bg-trust-untrusted/5 p-3 text-xs leading-5 text-ink/75">
            <strong className="text-trust-untrusted">Memory laundering:</strong>{" "}
            content survives summary; provenance does not.
          </div>
        </Panel>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {features.map(({ title, icon: Icon, accent, body }) => (
          <Panel key={title} title={title}>
            <Icon className={`mb-3 ${accent}`} size={22} />
            <p className="text-sm leading-6 text-ink/72">{body}</p>
          </Panel>
        ))}
      </section>
    </PageShell>
  );
}

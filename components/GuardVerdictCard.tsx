import type { GuardVerdict, Origin } from "@/lib/schemas/core";
import { Badge } from "@/components/ui";
import { ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  originBadgeClasses,
  originDotClasses,
  originTier,
  trustTierLabel
} from "@/components/origin-style";

const VERDICT_META = {
  ALLOW: {
    label: "ALLOW",
    Icon: ShieldCheck,
    accent: "text-trust-user",
    surface: "verdict-allow",
    badgeTone: "good" as const,
    headline: "Action authorized."
  },
  BLOCK: {
    label: "BLOCK",
    Icon: ShieldX,
    accent: "text-trust-untrusted",
    surface: "verdict-block",
    badgeTone: "bad" as const,
    headline: "Protected action denied."
  },
  ASK_CONFIRMATION: {
    label: "ASK",
    Icon: ShieldAlert,
    accent: "text-trust-tool",
    surface: "verdict-warn",
    badgeTone: "warn" as const,
    headline: "Operator confirmation required."
  }
} as const;

export function GuardVerdictCard({
  verdict,
  blockIsSuccess = false
}: {
  verdict: GuardVerdict;
  blockIsSuccess?: boolean;
}) {
  const defaultMeta = VERDICT_META[verdict.verdict];
  const meta =
    verdict.verdict === "BLOCK" && blockIsSuccess
      ? {
          ...defaultMeta,
          Icon: ShieldCheck,
          accent: "text-trust-user",
          surface: "verdict-allow",
          badgeTone: "good" as const,
          headline: "OriginLens blocked the protected action."
        }
      : defaultMeta;
  const Icon = meta.Icon;
  const required = verdict.requiredOrigins;
  const observed = verdict.observedOriginChain;
  const observedTip = observed[observed.length - 1];
  const allowed = required.length === 0 || (observedTip && required.includes(observedTip));

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-line shadow-verdict",
        meta.surface
      )}
    >
      <div className="grid gap-5 p-5 lg:grid-cols-[auto_1fr] lg:items-start">
        <div className="flex items-center gap-4 lg:flex-col lg:items-start">
          <div
            className={cn(
              "grid h-16 w-16 place-items-center rounded-xl border bg-white shadow-sm",
              meta.accent
            )}
          >
            <Icon size={32} strokeWidth={2.4} />
          </div>
          <div>
            <p
              className={cn(
                "text-3xl font-bold leading-none tracking-tight sm:text-4xl",
                meta.accent
              )}
            >
              {meta.label}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-moss">
              Guard Verdict
            </p>
          </div>
        </div>
        <div>
          <p className="text-base font-semibold leading-snug">{meta.headline}</p>
          <p className="mt-1.5 text-sm leading-6 text-ink/75">{verdict.reason}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <OriginGroup
              title="Required origin"
              origins={required as Origin[]}
              emptyLabel="none required"
            />
            <Mismatch
              allowed={Boolean(allowed)}
              blockIsSuccess={blockIsSuccess && verdict.verdict === "BLOCK"}
            />
            <OriginGroup
              title="Observed origin chain"
              origins={observed as Origin[]}
              showFlow
            />
          </div>

          {verdict.violatedInvariant ? (
            <div className="mt-4 rounded-md border border-line bg-white/80 p-3 text-xs leading-5 text-ink/75">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-moss">
                Violated invariant
              </p>
              {verdict.violatedInvariant}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function OriginGroup({
  title,
  origins,
  emptyLabel = "—",
  showFlow = false
}: {
  title: string;
  origins: Origin[];
  emptyLabel?: string;
  showFlow?: boolean;
}) {
  return (
    <div className="rounded-md border border-line bg-white p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-moss">
        {title}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {origins.length ? (
          origins.map((origin, idx) => (
            <span key={`${origin}-${idx}`} className="inline-flex items-center gap-1">
              {showFlow && idx > 0 ? (
                <span aria-hidden className="text-trust-untrusted">→</span>
              ) : null}
              <OriginChip origin={origin} />
            </span>
          ))
        ) : (
          <Badge>{emptyLabel}</Badge>
        )}
      </div>
    </div>
  );
}

function Mismatch({
  allowed,
  blockIsSuccess = false
}: {
  allowed: boolean;
  blockIsSuccess?: boolean;
}) {
  const good = allowed || blockIsSuccess;
  return (
    <div className="hidden flex-col items-center gap-1 sm:flex">
      <div
        className={cn(
          "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
          good
            ? "border-trust-user bg-trust-user/10 text-trust-user"
            : "border-trust-untrusted bg-trust-untrusted/10 text-trust-untrusted"
        )}
      >
        {allowed ? "match" : blockIsSuccess ? "blocked" : "mismatch"}
      </div>
      <svg
        width="60"
        height="14"
        viewBox="0 0 60 14"
        aria-hidden
        className={good ? "text-trust-user" : "text-trust-untrusted"}
      >
        <line
          x1="2"
          y1="7"
          x2="58"
          y2="7"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={allowed ? "0" : "5 4"}
        />
        <polygon points="52,2 58,7 52,12" fill="currentColor" />
      </svg>
    </div>
  );
}

export function OriginChip({
  origin,
  size = "md"
}: {
  origin: Origin;
  size?: "sm" | "md";
}) {
  const tier = originTier(origin);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border font-semibold",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
        originBadgeClasses(origin)
      )}
      title={trustTierLabel(tier)}
    >
      <span
        aria-hidden
        className={cn("h-1.5 w-1.5 rounded-full", originDotClasses(origin))}
      />
      {origin}
    </span>
  );
}

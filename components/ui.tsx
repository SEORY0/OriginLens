import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("mx-auto w-full max-w-7xl px-4 py-8 sm:px-6", className)}>
      {children}
    </main>
  );
}

export function Button({
  children,
  variant = "primary",
  loading = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex min-h-10 items-center justify-center gap-2 overflow-hidden rounded-md border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "border-ink bg-ink text-white shadow-sm hover:bg-ink/90 active:translate-y-[1px]",
        variant === "secondary" &&
          "border-line bg-white text-ink hover:border-ink hover:bg-field/60",
        variant === "danger" &&
          "border-signal bg-signal text-white hover:bg-signal/90",
        variant === "ghost" &&
          "border-transparent bg-transparent text-ink/70 hover:bg-white",
        props.className
      )}
    >
      {loading ? (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[2px] progress-shimmer"
        />
      ) : null}
      {children}
    </button>
  );
}

export function Panel({
  title,
  eyebrow,
  action,
  children,
  className,
  variant = "default"
}: {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "danger" | "good";
}) {
  return (
    <section
      className={cn(
        "panel rounded-lg p-5",
        variant === "subtle" && "bg-white/60",
        variant === "danger" && "border-signal/40 bg-signal/5",
        variant === "good" && "border-trust-user/40 bg-trust-user/5",
        className
      )}
    >
      {(eyebrow || title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-moss">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-1 text-lg font-semibold leading-tight">{title}</h2>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}

export type BadgeTone =
  | "neutral"
  | "good"
  | "bad"
  | "warn"
  | "info"
  | "trust-system"
  | "trust-user"
  | "trust-delegated"
  | "trust-tool"
  | "trust-untrusted";

export function Badge({
  children,
  tone = "neutral",
  size = "md"
}: {
  children: ReactNode;
  tone?: BadgeTone;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border font-semibold",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
        tone === "neutral" && "border-line bg-white text-ink/70",
        tone === "good" && "border-moss bg-moss/10 text-moss",
        tone === "bad" && "border-signal bg-signal/10 text-signal",
        tone === "warn" && "border-gold bg-gold/15 text-[#7a5817]",
        tone === "info" && "border-blue bg-blue/10 text-blue",
        tone === "trust-system" &&
          "border-trust-system bg-trust-system/10 text-trust-system",
        tone === "trust-user" &&
          "border-trust-user bg-trust-user/12 text-trust-user",
        tone === "trust-delegated" &&
          "border-trust-delegated bg-trust-delegated/12 text-trust-delegated",
        tone === "trust-tool" &&
          "border-trust-tool bg-trust-tool/15 text-[#7a5817]",
        tone === "trust-untrusted" &&
          "border-trust-untrusted bg-trust-untrusted/12 text-trust-untrusted"
      )}
    >
      {children}
    </span>
  );
}

export function CodeBlock({
  children,
  size = "md"
}: {
  children: ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <pre
      className={cn(
        "mono overflow-auto rounded-md border border-line bg-ink leading-relaxed text-white shadow-inner",
        size === "sm" ? "p-3 text-[11px]" : "p-4 text-xs"
      )}
    >
      {children}
    </pre>
  );
}

export function StatPill({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: ReactNode;
  tone?: "neutral" | "good" | "bad" | "warn";
}) {
  return (
    <div
      className={cn(
        "rounded-md border bg-white px-3 py-2",
        tone === "neutral" && "border-line",
        tone === "good" && "border-trust-user/50",
        tone === "bad" && "border-trust-untrusted/50",
        tone === "warn" && "border-trust-tool/50"
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-moss">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold leading-tight">{value}</p>
    </div>
  );
}

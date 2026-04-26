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
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "border-ink bg-ink text-white hover:bg-ink/90",
        variant === "secondary" && "border-line bg-white text-ink hover:border-ink",
        variant === "danger" && "border-signal bg-signal text-white hover:bg-signal/90",
        props.className
      )}
    >
      {children}
    </button>
  );
}

export function Panel({
  title,
  eyebrow,
  children,
  className
}: {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel rounded-lg p-5", className)}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-moss">
          {eyebrow}
        </p>
      ) : null}
      {title ? <h2 className="mb-4 text-lg font-semibold">{title}</h2> : null}
      {children}
    </section>
  );
}

export function Badge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "bad" | "warn";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-1 text-xs font-semibold",
        tone === "neutral" && "border-line bg-white text-ink/70",
        tone === "good" && "border-moss bg-moss/10 text-moss",
        tone === "bad" && "border-signal bg-signal/10 text-signal",
        tone === "warn" && "border-gold bg-gold/10 text-ink"
      )}
    >
      {children}
    </span>
  );
}

export function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="mono overflow-auto rounded border border-line bg-ink p-4 text-xs leading-relaxed text-white">
      {children}
    </pre>
  );
}

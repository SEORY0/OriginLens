import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "OriginLens",
  description:
    "Lifecycle red-team and provenance firewall for memory-laundering attacks."
};

const navItems = [
  { href: "/guide", label: "Guide" },
  { href: "/demo", label: "Demo" },
  { href: "/dashboard", label: "Dashboard" }
];

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-30 border-b border-line bg-field/85 backdrop-blur supports-[backdrop-filter]:bg-field/70">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="group flex items-center gap-2 text-sm font-semibold tracking-tight"
            >
              <span className="grid h-9 w-9 place-items-center rounded-md border border-ink bg-ink text-white shadow-sm transition group-hover:scale-[1.04]">
                <ShieldCheck size={18} />
              </span>
              <span className="text-base">
                <span className="text-ink">Origin</span>
                <span className="text-trust-untrusted">Lens</span>
              </span>
            </Link>
            <div className="flex items-center gap-0.5 text-sm text-ink/70">
              {navItems.map((item) => (
                <Link
                  href={item.href}
                  key={item.href}
                  className="rounded-md px-3 py-1.5 font-medium transition hover:bg-white hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}

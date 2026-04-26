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
  { href: "/demo", label: "Demo" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/responsible", label: "Responsible" }
];

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-30 border-b border-line bg-field/90 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="grid h-9 w-9 place-items-center rounded border border-ink bg-ink text-white">
                <ShieldCheck size={18} />
              </span>
              <span>OriginLens</span>
            </Link>
            <div className="flex items-center gap-1 text-sm text-ink/70">
              {navItems.map((item) => (
                <Link
                  href={item.href}
                  key={item.href}
                  className="rounded px-3 py-2 transition hover:bg-white hover:text-ink"
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

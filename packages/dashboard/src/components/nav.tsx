"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/auditor", label: "Ink Auditor" },
  { href: "/tests", label: "Test Generator" },
  { href: "/manifest", label: "Agent Manifest" },
  { href: "/intent", label: "Intent Hook" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-card p-4 flex flex-col gap-1">
      <h1 className="text-lg font-bold mb-4 px-2">Stylus Architect</h1>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
            pathname === link.href
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </aside>
  );
}

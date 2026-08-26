"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import type { Role } from "@prisma/client";

export function Navbar({ name, role }: { name: string; role: Role }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md p-2 hover:bg-muted md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
        <span className="font-semibold">EmpForge</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {name} · {role}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Logout
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute left-0 top-14 z-40 w-64 border-r border-b border-border bg-background shadow-lg md:hidden">
          <Sidebar role={role} />
        </div>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

const NAV: Record<Role, { label: string; href: string }[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Users", href: "/users" },
    { label: "Jobs", href: "/jobs" },
    { label: "Candidates", href: "/candidates" },
    { label: "Employees", href: "/employees" },
    { label: "Courses", href: "/courses" },
    { label: "Assignments", href: "/assignments" },
    { label: "Exams", href: "/exams" },
    { label: "Badges", href: "/badges" },
    { label: "Community", href: "/community" },
  ],
  RECRUITER: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Jobs", href: "/jobs" },
    { label: "Applications", href: "/applications" },
    { label: "Interviews", href: "/interviews" },
    { label: "Onboarding", href: "/employees" },
  ],
  EMPLOYEE: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Courses", href: "/courses" },
    { label: "My Training", href: "/assignments" },
    { label: "Exams", href: "/exams" },
    { label: "Badges", href: "/badges" },
    { label: "Community", href: "/community" },
  ],
  INTERN: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Training", href: "/assignments" },
    { label: "Exams", href: "/exams" },
    { label: "Badges", href: "/badges" },
    { label: "Community", href: "/community" },
  ],
};

export function Sidebar({ role, className }: { role: Role; className?: string }) {
  const pathname = usePathname();
  const items = NAV[role];

  return (
    <nav className={cn("flex flex-col gap-1 p-3", className)}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

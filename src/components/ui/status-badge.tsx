import { cn } from "@/lib/utils";

const COLORS: Record<string, string> = {
  OPEN: "bg-green-100 text-green-800",
  ACTIVE: "bg-green-100 text-green-800",
  PUBLISHED: "bg-green-100 text-green-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  CLOSED: "bg-gray-100 text-gray-700",
  DRAFT: "bg-gray-100 text-gray-700",
  EXTENDED: "bg-amber-100 text-amber-800",
  ASSIGNED: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  APPLIED: "bg-gray-100 text-gray-700",
  SCREENING: "bg-amber-100 text-amber-800",
  INTERVIEW: "bg-purple-100 text-purple-800",
  OFFER: "bg-cyan-100 text-cyan-800",
  HIRED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  PASSED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        COLORS[status] || "bg-gray-100 text-gray-700"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

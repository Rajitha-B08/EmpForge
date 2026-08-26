import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

export class ForbiddenError extends Error {
  constructor(message = "You don't have permission to do this") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "You must be logged in") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Gets the current session and throws if there isn't one.
 * Use in API routes / server actions that require a logged-in user.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  return session.user;
}

/**
 * Gets the current session and throws unless the user's role is in `roles`.
 */
export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new ForbiddenError();
  return user;
}

export const isAdmin = (role: Role) => role === "ADMIN";
export const isRecruiter = (role: Role) => role === "RECRUITER";
export const isStaff = (role: Role) => role === "ADMIN" || role === "RECRUITER";
export const isLearner = (role: Role) => role === "EMPLOYEE" || role === "INTERN";

/** Converts a thrown permission error into an HTTP response body/status pair. */
export function permissionErrorResponse(err: unknown) {
  if (err instanceof UnauthorizedError) {
    return { status: 401, body: { error: err.message } };
  }
  if (err instanceof ForbiddenError) {
    return { status: 403, body: { error: err.message } };
  }
  return null;
}

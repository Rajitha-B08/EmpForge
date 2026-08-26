import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    // routes that are ADMIN/RECRUITER only
    const staffOnly = ["/candidates", "/interviews", "/employees"];
    // recruitment job management (create/edit) still lives under /jobs but
    // viewing published jobs is public, so we only guard the dashboard-side pages
    if (staffOnly.some((p) => path.startsWith(p))) {
      if (role !== "ADMIN" && role !== "RECRUITER") {
        return NextResponse.redirect(new URL("/forbidden", req.url));
      }
    }

    if (path.startsWith("/users") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }

    if (path.startsWith("/courses/manage") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }

    if (path.startsWith("/exams/manage") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }

    if (path.startsWith("/badges/manage") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/jobs/:path*",
    "/candidates/:path*",
    "/applications/:path*",
    "/interviews/:path*",
    "/employees/:path*",
    "/courses/:path*",
    "/assignments/:path*",
    "/exams/:path*",
    "/badges/:path*",
    "/community/:path*",
  ],
};

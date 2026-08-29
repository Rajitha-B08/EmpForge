import { NextRequest, NextResponse } from "next/server";
import { requireRole, permissionErrorResponse } from "@/lib/permissions";
import { convertToEmployeeSchema } from "@/validations/employee";
import { convertCandidateToEmployee } from "@/services/onboarding";

// Note: [id] here is the applicationId being converted, kept under /employees
// for a clean REST surface matching "convert an application into an employee".
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN", "RECRUITER"]);
  } catch (err) {
    const permErr = permissionErrorResponse(err);
    if (permErr) return NextResponse.json(permErr.body, { status: permErr.status });
    throw err;
  }

  const body = await req.json();
  const parsed = convertToEmployeeSchema.safeParse({ ...body, applicationId: params.id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await convertCandidateToEmployee({
      applicationId: parsed.data.applicationId,
      type: parsed.data.type,
      mentorId: parsed.data.mentorId || undefined,
      joinDate: new Date(parsed.data.joinDate),
      internStartDate: parsed.data.internStartDate ? new Date(parsed.data.internStartDate) : undefined,
      internEndDate: parsed.data.internEndDate ? new Date(parsed.data.internEndDate) : undefined,
      password: parsed.data.password,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

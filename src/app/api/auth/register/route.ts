import { NextResponse } from "next/server";

// Public self-registration is disabled.
//
// Account creation now happens exclusively through the admin dashboard
// (`POST /api/admin/users`), which is guarded by `getAdminUser()`. The shared
// account-creation logic lives in `src/lib/user-creation.ts` and is reused by
// that endpoint, so disabling this route removes the public entry point without
// losing any functionality.
//
// This route is kept (rather than deleted) so the closed door is explicit and
// any stale client receives a clear answer instead of a 404.

export async function POST() {
  return NextResponse.json(
    {
      error: "Public registration is disabled. Accounts are created by an administrator.",
    },
    { status: 403 },
  );
}

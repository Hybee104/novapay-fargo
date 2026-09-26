import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Public registration is closed: accounts are created by an administrator from
// the admin dashboard. Visiting /register can never reach a sign-up form — the
// request is redirected to the login page before anything renders.
export const metadata: Metadata = {
  title: "Registration closed — NovaPAY Bank",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  redirect("/login");
}

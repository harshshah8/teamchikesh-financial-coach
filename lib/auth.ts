import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const AUTH_COOKIE = "finance_auth";

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === "ok";
}

export async function requireAuth() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}

export function hasValidPasscode(passcode: string) {
  const expected = process.env.APP_PASSCODE;
  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      return false;
    }

    return passcode === "dev-passcode";
  }

  return passcode === expected;
}

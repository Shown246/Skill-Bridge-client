import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "./env";
import type { Success, User, UserRole } from "./types";

export async function getServerUser(): Promise<User | null> {
  const cookie = (await cookies()).toString();
  if (!cookie) return null;
  try {
    const tokenResponse = await fetch(`${env.authBaseUrl}/api/auth/token`, { headers: { cookie }, cache: "no-store" });
    if (!tokenResponse.ok) return null;
    const { token } = await tokenResponse.json() as { token: string };
    const response = await fetch(`${env.apiBaseUrl}/api/v1/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!response.ok) return null;
    return ((await response.json()) as Success<User>).data;
  } catch { return null; }
}

export async function requireRole(role: UserRole): Promise<User> {
  const user = await getServerUser();
  if (!user) {
    const headerList = await headers();
    const pathname = headerList.get("x-pathname") || `/${role.toLowerCase()}`;
    redirect(`/login?returnTo=${encodeURIComponent(pathname)}`);
  }
  if (user.status === "BANNED") redirect("/suspended");
  if (user.role !== role) redirect("/forbidden");
  return user;
}

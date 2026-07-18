import { env } from "./env";

type ErrorBody = { success?: false; error?: { code?: string; message?: string; fieldErrors?: Record<string, string[] | undefined> }; message?: string };

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public requestId?: string, public fieldErrors?: Record<string, string[] | undefined>, public retryAfter?: string | null) { super(message); this.name = "ApiError"; }
}

let jwt: string | null = null;
let tokenPromise: Promise<string> | null = null;
export const clearAccessToken = () => { jwt = null; };

async function getToken(force = false): Promise<string> {
  if (jwt && !force) return jwt;
  if (!tokenPromise || force) tokenPromise = fetch(`${env.authBaseUrl}/api/auth/token`, { credentials: "include", cache: "no-store" }).then(async (response) => {
    if (!response.ok) throw new ApiError(response.status, "UNAUTHORIZED", "Your session has expired. Please sign in again.", response.headers.get("x-request-id") || undefined);
    const body = await response.json() as { token: string };
    jwt = body.token;
    return jwt;
  }).finally(() => { tokenPromise = null; });
  return tokenPromise;
}

export async function apiFetch<T>(path: string, init: RequestInit & { auth?: boolean; retried?: boolean } = {}): Promise<T> {
  const { auth, retried, ...requestInit } = init;
  const headers = new Headers(requestInit.headers);
  if (requestInit.body) headers.set("Content-Type", "application/json");
  if (auth) headers.set("Authorization", `Bearer ${await getToken()}`);
  let response: Response;
  try { response = await fetch(`${env.apiBaseUrl}${path}`, { ...requestInit, headers, credentials: "include" }); }
  catch { throw new ApiError(0, "NETWORK_ERROR", "Could not reach SkillBridge. Check your connection and try again."); }
  const body = await response.json().catch(() => ({})) as ErrorBody;
  if (!response.ok) {
    const code = body.error?.code || "REQUEST_FAILED";
    if (auth && code === "TOKEN_EXPIRED" && !retried) { await getToken(true); return apiFetch<T>(path, { ...init, retried: true }); }
    if (code === "TOKEN_INVALID") clearAccessToken();
    throw new ApiError(response.status, code, body.error?.message || body.message || "The request could not be completed.", response.headers.get("x-request-id") || undefined, body.error?.fieldErrors, response.headers.get("retry-after"));
  }
  return body as T;
}

export const errorMessage = (error: unknown) => error instanceof ApiError ? `${error.message}${error.requestId ? ` (Request ID: ${error.requestId})` : ""}` : error instanceof Error ? error.message : "Something went wrong. Please try again.";

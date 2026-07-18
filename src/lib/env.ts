const stripTrailingSlash = (value: string) => value.replace(/\/$/, "");

export const env = {
  apiBaseUrl: stripTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"),
  authBaseUrl: stripTrailingSlash(process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:5000"),
  appName: process.env.NEXT_PUBLIC_APP_NAME || "SkillBridge",
  defaultCurrency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD",
} as const;

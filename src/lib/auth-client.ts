import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";
import { env } from "./env";

export const authClient = createAuthClient({ baseURL: env.authBaseUrl, plugins: [jwtClient()] });

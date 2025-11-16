import { betterAuth } from "better-auth";
import { toNextJsHandler } from "better-auth/next-js";
import { authConfig } from "./config";

export const auth = betterAuth(authConfig);

export const { GET, POST } = toNextJsHandler(auth.handler);

export const { signIn, signOut } = auth.api;


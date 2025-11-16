import { betterAuth } from "better-auth";
import { toNextJsHandler } from "better-auth/next-js";
import { authConfig } from "./config";
import type { NextRequest } from "next/server";

export const auth = betterAuth(authConfig);

const handler = toNextJsHandler(auth.handler);

// Type-safe exports for Next.js route handlers
export const GET = handler.GET as (req: NextRequest) => Promise<Response>;
export const POST = handler.POST as (req: NextRequest) => Promise<Response>;


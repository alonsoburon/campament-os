/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

// Tipos derivados de la sesión de Better Auth, extendidos con campos extra usados en la app
type SessionResult = Awaited<ReturnType<typeof auth.api.getSession>>;
type SessionUser = (SessionResult & {
  user: {
    person_id?: number | null;
    organization_id?: number | null;
    organization_name?: string | null;
    role_name?: string | null;
  };
})["user"];


export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers: opts.headers });
  
  return {
    db,
    user: session?.user as SessionUser | undefined,
    resHeaders: new Headers(),
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: { ...ctx, user: ctx.user },
  });
});

export const orgProtectedProcedure = protectedProcedure.use(
  async ({ ctx, next, input }) => {
    const inputAsOrgContext = input as Record<string, unknown> & { organization_id?: number };
    const inputOrganizationId = inputAsOrgContext.organization_id;

    if (inputOrganizationId) {
      if (!ctx.user.organization_id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes permiso para acceder a esta organización.",
        });
      }

      const sessionOrgId = ctx.user.organization_id;
      if (inputOrganizationId !== sessionOrgId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes permiso para acceder a esta organización.",
        });
      }
    }

    return next({ ctx });
  },
);

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await ctx.db.user.findUnique({
    where: { id: ctx.user.id },
    include: { system_role: true },
  });

  const roleName = user?.system_role?.name;
  if (roleName !== "Superadmin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({ ctx });
});

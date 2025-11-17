import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

const isDev = process.env.NODE_ENV === "development";

type ContextUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  person_id?: number | null;
  activeOrganizationId?: string | null;
};

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers: opts.headers });

  return {
    db,
    user: session?.user as ContextUser | undefined,
    isImpersonating: Boolean((session as any)?.session?.impersonatedBy),
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
  // En desarrollo, el usuario siempre existe (creado automáticamente en el contexto)
  if (isDev && ctx.user) {
    return next({ ctx: { ...ctx, user: ctx.user } });
  }

  if (!ctx.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const orgProtectedProcedure = protectedProcedure.use(
  async ({ ctx, next, input }) => {
    // En desarrollo, saltarse la verificación
    if (isDev) {
      return next({ ctx });
    }

    const sessionOrgId = ctx.user.activeOrganizationId;
    const inputAsOrgContext = input as { organizationId?: string | number };
    const inputOrganizationId = inputAsOrgContext.organizationId;

    if (inputOrganizationId) {
      if (!sessionOrgId || String(inputOrganizationId) !== sessionOrgId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes permiso para acceder a los recursos de esta organización.",
        });
      }
    } else if (!sessionOrgId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes una organización activa seleccionada.",
      });
    }

    return next({ ctx });
  }
);

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // En desarrollo, saltarse la verificación
  if (isDev) {
    return next({ ctx });
  }

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
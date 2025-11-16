import { prismaAdapter } from "better-auth/adapters/prisma";

import { db } from "~/server/db";

/**
 * Options for BetterAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://docs.better-auth.com/configuration/options
 */
const AUTHORIZED_EMAIL = "nuxapower@gmail.com";
const SUPERADMIN_FULL_NAME = "Alonso Burón";
const SUPERADMIN_ROLE_NAME = "Superadmin";

async function ensureSuperadminRole() {
  const existingRole = await db.role.findFirst({
    where: {
      name: SUPERADMIN_ROLE_NAME,
      scope: "SYSTEM",
      organization_id: { equals: null },
    },
  });

  if (existingRole) {
    return existingRole;
  }

  return db.role.create({
    data: {
      name: SUPERADMIN_ROLE_NAME,
      scope: "SYSTEM",
      description: "Acceso completo al sistema.",
    },
  });
}

export const authConfig = {
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  session: {
    // Database sessions - control total y revocación inmediata
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  callbacks: {
    async signIn({ account, profile }: { account: any; profile: any }) {
      // Permitir autenticación del proveedor de personificación en desarrollo
      if (
        account?.providerId === "impersonate" &&
        process.env.NODE_ENV === "development"
      ) {
        return true;
      }

      if (account?.providerId !== "google") {
        return false;
      }

      const email = typeof profile?.email === "string" ? profile.email : undefined;
      const emailVerified =
        typeof profile?.email_verified === "boolean"
          ? profile.email_verified
          : false;

      // Solo permitimos el acceso al correo autorizado y verificado.
      if (!emailVerified || email !== AUTHORIZED_EMAIL) {
        return false;
      }

      if (email === AUTHORIZED_EMAIL) {
        const superadminRole = await ensureSuperadminRole();
        const existingUser = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            person_id: true,
            system_role_id: true,
            name: true,
          },
        });

        if (existingUser) {
          if (
            existingUser.system_role_id !== superadminRole.id ||
            existingUser.name !== SUPERADMIN_FULL_NAME
          ) {
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                name: SUPERADMIN_FULL_NAME,
                system_role_id: superadminRole.id,
              },
            });
          }

          await db.person.update({
            where: { id: existingUser.person_id ?? undefined },
            data: { full_name: SUPERADMIN_FULL_NAME },
          });
        }
      }

      return true;
    },
    async session({ session, user }) {
      // Asegúrate de que person_id esté siempre actualizado en la sesión
      if (user.id) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { person_id: true, system_role: { select: { name: true } } },
        });

        if (dbUser) {
          session.user.person_id = dbUser.person_id;
          session.user.role_name = dbUser.system_role?.name || null;
        }
      }
      return session;
    },
  },
};
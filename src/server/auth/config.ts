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

async function isUserAllowedToSignIn(email: string, emailVerified: boolean) {
  try {

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
  } catch (error) {
    console.error("Database check failed during sign-in:", error);
    return false;
  }
}

interface BetterAuthAccount {
  providerId?: string;
}

interface GoogleProfile {
  email?: string;
  email_verified?: boolean;
}

interface SessionUser {
    id: string;
    person_id?: number | null;
    role_name?: string | null;
}

interface Session {
    user?: SessionUser;
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
    async signIn({ account, profile }: { account: BetterAuthAccount | null, profile: GoogleProfile | null }) {
      // Permitir autenticación del proveedor de personificación en desarrollo
      if (
        account?.providerId === "impersonate" &&
        process.env.NODE_ENV === "development"
      ) {
        return true;
      }

      // Para otros proveedores como Google, verificar el dominio y la existencia en la BD
      if (profile?.email && profile.email_verified) {
        return await isUserAllowedToSignIn(profile.email, profile.email_verified);
      }

      return true;
    },
    async session({ session, user }: { session: Session; user: SessionUser }) {
      // Asegúrate de que person_id esté siempre actualizado en la sesión
      if (session.user && user.id) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          include: {
            system_role: true,
          },
        });

        if (dbUser) {
          session.user.person_id = dbUser.person_id;
          session.user.role_name ??= dbUser.system_role?.name ?? null;
        }
      }
      return session;
    },
  },
};
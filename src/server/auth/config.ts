import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  type Adapter,
  type AdapterUser,
} from "next-auth/adapters";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      person_id: number; // Añadir person_id
      organization_id?: number; // Añadir organization_id opcional
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
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

type SignInCallback = NonNullable<
  NonNullable<NextAuthConfig["callbacks"]>["signIn"]
>;

type SignInCallbackParams = Parameters<SignInCallback>[0];

const baseAdapter = PrismaAdapter(db);

const adapter: Adapter = {
  ...baseAdapter,
  async createUser(data) {
    const isAuthorizedSuperadmin =
      typeof data.email === "string" &&
      data.email.toLowerCase() === AUTHORIZED_EMAIL;

    const fullName = isAuthorizedSuperadmin
      ? SUPERADMIN_FULL_NAME
      : data.name ?? data.email ?? "Usuario sin nombre";

    // 1. Crear la Persona primero para obtener su ID
    const person = await db.person.create({
      data: {
        full_name: fullName,
      },
    });

    // 2. Crear el Usuario, vinculándolo a la Persona recién creada
    let systemRoleId: number | undefined;

    if (isAuthorizedSuperadmin) {
      const superadminRole = await ensureSuperadminRole();
      systemRoleId = superadminRole.id;
    }

    const user = await db.user.create({
      data: {
        ...data,
        name: fullName,
        person_id: person.id, // Asignar el ID de la persona recién creada
        ...(systemRoleId ? { system_role_id: systemRoleId } : {}),
      },
    });

    return user as AdapterUser;
  },
};

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  adapter,
  callbacks: {
    async signIn({ account, profile }: SignInCallbackParams) {
      if (account?.provider !== "google") {
        return false;
      }

      const email = typeof profile?.email === "string" ? profile.email : undefined;
      const emailVerified =
        typeof profile?.email_verified === "boolean" ? profile.email_verified : false;

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
          if (existingUser.system_role_id !== superadminRole.id || existingUser.name !== SUPERADMIN_FULL_NAME) {
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                name: SUPERADMIN_FULL_NAME,
                system_role_id: superadminRole.id,
              },
            });
          }

          await db.person.update({
            where: { id: existingUser.person_id },
            data: { full_name: SUPERADMIN_FULL_NAME },
          });
        }
      }

      return true;
    },
    session: async ({ session, user }) => {
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: {
          person_id: true,
          person: { // Acceder a la relación Person del usuario
            select: {
              organizations: { // Acceder a las organizaciones a través de Person
                select: { organization_id: true },
                take: 1,
              },
            },
          },
        },
      });
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          person_id: dbUser?.person_id, // Añadir person_id a la sesión
          organization_id: dbUser?.person?.organizations[0]?.organization_id, // Acceder al organization_id correctamente
        },
      };
    },
  },
} satisfies NextAuthConfig;
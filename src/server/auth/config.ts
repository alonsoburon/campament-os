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

type SignInCallback = NonNullable<
  NonNullable<NextAuthConfig["callbacks"]>["signIn"]
>;

type SignInCallbackParams = Parameters<SignInCallback>[0];

const baseAdapter = PrismaAdapter(db);

const adapter: Adapter = {
  ...baseAdapter,
  async createUser(data) {
    const fullName =
      data.name ??
      data.email ??
      "Usuario sin nombre";

    const user = await db.user.create({
      data: {
        ...data,
        person: {
          create: {
            full_name: fullName,
          },
        },
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

      return true;
    },
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthConfig;
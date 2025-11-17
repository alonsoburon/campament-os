import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "~/server/db";
import { admin } from "better-auth/plugins";

const isDev = process.env.NODE_ENV === "development";

export const authConfig = {
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  session: {
    strategy: "database" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin", "superadmin"],
      // ID del usuario nuxapower@gmail.com (visible en los logs del console)
      adminUserIds: ["MYQFI7qpMxk5ruZ0SSTxXQmYUwI61jX2"],
    }),
  ],
} as const;
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "~/server/db";

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
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
};
import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/db";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Brak zmiennej środowiskowej ${name}`);
  return v;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    github: {
      clientId: requireEnv("GITHUB_CLIENT_ID"),
      clientSecret: requireEnv("GITHUB_CLIENT_SECRET"),
    },
  },
  session: {
    cookieCache: {
      enabled: false,
    },
  },
});

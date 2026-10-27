import "dotenv/config";
import { betterAuth } from "better-auth";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Brak zmiennej środowiskowej ${name}`);
  return v;
}

export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: requireEnv("GITHUB_CLIENT_ID"),
      clientSecret: requireEnv("GITHUB_CLIENT_SECRET"),
    },
  },
  session: { cookieCache: { enabled: false } },
});

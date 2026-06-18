import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { sendResetPasswordEmail } from "@/lib/notifications/service";

const dbUrl = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
const isProduction = process.env.APP_ENV === "production";
const authSecret =
  process.env.BETTER_AUTH_SECRET ??
  (isProduction ? undefined : "rbabikerentals-dev-secret-change-in-prod");

if (!authSecret) {
  throw new Error("BETTER_AUTH_SECRET is required when APP_ENV=production.");
}

export const auth = betterAuth({
  basePath: process.env.BETTER_AUTH_BASE_PATH ?? "/api/auth",
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.APP_BASE_URL,
  secret: authSecret,
  database: dbUrl
    ? new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes("supabase.co") ? { rejectUnauthorized: false } : undefined
      })
    : undefined,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendResetPasswordEmail(user.email, url);
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false
      }
    }
  }
});

import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins/email-otp";
import { Pool } from "pg";
import { sendSmtpMail } from "@/lib/integrations/smtp";
import { getServerAppBaseUrl } from "@/lib/utils/app-url";

const isProduction = process.env.APP_ENV === "production";
const dbUrl = resolveAuthDatabaseUrl();
const authSecret =
  process.env.BETTER_AUTH_SECRET ??
  (isProduction ? undefined : "rbabikerentals-dev-secret-change-in-prod");
const authBaseURL =
  getServerAppBaseUrl();
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export function resolveAuthDatabaseUrl(env: Record<string, string | undefined> = process.env) {
  const databaseUrl = env.SUPABASE_DB_URL || env.DATABASE_URL;
  if (env.APP_ENV === "production" && !databaseUrl) {
    throw new Error("SUPABASE_DB_URL or DATABASE_URL is required when APP_ENV=production.");
  }
  return databaseUrl;
}

if (!authSecret) {
  throw new Error("BETTER_AUTH_SECRET is required when APP_ENV=production.");
}

export const auth = betterAuth({
  basePath: process.env.BETTER_AUTH_BASE_PATH ?? "/api/auth",
  baseURL: authBaseURL,
  secret: authSecret,
  database: dbUrl
    ? new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes("supabase.co") ? { rejectUnauthorized: false } : undefined
      })
    : undefined,
  emailAndPassword: {
    enabled: true
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret
          }
        }
      : undefined,
  plugins: [
    emailOTP({
      expiresIn: 300,
      otpLength: 6,
      resendStrategy: "reuse",
      async sendVerificationOTP({ email, otp, type }) {
        await sendSmtpMail({
          to: email,
          subject: type === "sign-in" ? "Your RBA login code" : "Your RBA verification code",
          text: [
            `Your RBA verification code is ${otp}.`,
            "",
            "This code expires in 5 minutes.",
            "If you did not request it, you can ignore this email."
          ].join("\n")
        });
      }
    })
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false
      }
    }
  }
});

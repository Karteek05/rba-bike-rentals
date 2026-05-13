import { betterAuth } from "better-auth";
import { phoneNumber } from "better-auth/plugins";
import { Pool } from "pg";

const dbUrl = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
const isProduction = process.env.APP_ENV === "production";
const authSecret =
  process.env.BETTER_AUTH_SECRET ??
  (isProduction ? undefined : "rbabikerentals-dev-secret-change-in-prod");
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

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
    phoneNumber({
      sendOTP: ({ phoneNumber: mobile, code }) => {
        if (process.env.APP_ENV !== "production") {
          console.log(`[dev-phone-otp] ${mobile}: ${code}`);
        }
      },
      signUpOnVerification: {
        getTempEmail: (mobile) => `${mobile.replace(/\D/g, "") || "mobile"}@phone.rbabikerentals.local`,
        getTempName: (mobile) => mobile
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

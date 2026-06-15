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
  if (env.APP_ENV !== "production") {
    return undefined;
  }
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
    enabled: true,
    async sendResetPassword({ user, url }) {
      const html = `
        <div style="margin:0;padding:0;background:#f8f5ec;font-family:Arial,Helvetica,sans-serif;color:#101820;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f5ec;padding:28px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #dfd6c5;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="padding:24px 26px;border-bottom:1px solid #eee5d6;">
                      <div style="font-size:20px;font-weight:800;letter-spacing:.02em;">RBA<span style="color:#d99012;">.</span></div>
                      <div style="margin-top:4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;">Bengaluru Bike Rentals</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px 26px;">
                      <h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;color:#101820;">Reset your password</h1>
                      <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#334155;">Hi ${user.name || "there"}, use the secure link below to set a new password for your RBA account.</p>
                      <a href="${url}" style="display:inline-block;margin:4px 0 18px;padding:12px 18px;border-radius:999px;background:#101820;color:#ffffff;text-decoration:none;font-weight:800;font-size:14px;">Reset password</a>
                      <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">If you did not request this, you can ignore this email.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `;
      await sendSmtpMail({
        to: user.email,
        subject: "Reset your RBA password",
        text: [
          `Hi ${user.name || "there"},`,
          "",
          "Use this secure link to reset your RBA password:",
          url,
          "",
          "If you did not request this, you can ignore this email."
        ].join("\n"),
        html
      });
    }
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

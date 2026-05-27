import { NextResponse } from "next/server";
import {
  createDashboardAccessToken,
  DASHBOARD_ACCESS_COOKIE,
  dashboardRoleFromParam,
  getDashboardUserId,
  verifyDashboardPassword
} from "@/lib/auth/dashboard-access";

type LoginBody = {
  role?: string;
  password?: string;
};

const failedAttempts = new Map<string, { count: number; resetAt: number }>();
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function getClientKey(request: Request, role: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return `${role}:${forwardedFor || realIp || "local"}`;
}

function isRateLimited(key: string) {
  const item = failedAttempts.get(key);
  if (!item) return false;
  if (item.resetAt <= Date.now()) {
    failedAttempts.delete(key);
    return false;
  }
  return item.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const item = failedAttempts.get(key);
  if (!item || item.resetAt <= now) {
    failedAttempts.set(key, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return;
  }
  failedAttempts.set(key, { count: item.count + 1, resetAt: item.resetAt });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const role = dashboardRoleFromParam(body.role);

  if (!role || !body.password) {
    return NextResponse.json(
      { ok: false, error: { code: "invalid_request", message: "Role and password are required." } },
      { status: 400 }
    );
  }

  const clientKey = getClientKey(request, role);
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "too_many_attempts",
          message: "Too many failed attempts. Try again in a few minutes."
        }
      },
      { status: 429 }
    );
  }

  const passwordOk = await verifyDashboardPassword(role, body.password);
  if (!passwordOk) {
    recordFailedAttempt(clientKey);
    return NextResponse.json(
      { ok: false, error: { code: "invalid_password", message: "Invalid dashboard password." } },
      { status: 401 }
    );
  }

  const token = await createDashboardAccessToken({
    role,
    userId: getDashboardUserId(role)
  });

  if (!token) {
    return NextResponse.json(
      { ok: false, error: { code: "dashboard_secret_missing", message: "Dashboard access secret is not configured." } },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true });
  failedAttempts.delete(clientKey);
  response.cookies.set(DASHBOARD_ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DASHBOARD_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}

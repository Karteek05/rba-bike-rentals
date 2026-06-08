import { auth } from "@/lib/auth/better-auth";
import { DASHBOARD_ACCESS_COOKIE } from "@/lib/auth/dashboard-access";
import { getUserOrThrow, upsertUser } from "@/lib/data/repository";
import { ok, fromError } from "@/lib/utils/http";

type AuthSession = {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: "customer" | "partner_investor" | "admin";
  };
};

async function getDevCustomerFallback() {
  if (process.env.APP_ENV === "production") {
    return null;
  }

  try {
    return await getUserOrThrow("cust_001");
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    if (cookieHeader.includes(`${DASHBOARD_ACCESS_COOKIE}=`)) {
      return ok({ authenticated: false, user: null });
    }

    let session: AuthSession | null = null;
    try {
      session = (await auth.api.getSession({
        headers: request.headers
      })) as AuthSession | null;
    } catch {
      const fallbackUser = await getDevCustomerFallback();
      return ok({
        authenticated: Boolean(fallbackUser),
        user: fallbackUser
      });
    }

    const sessionUser = session?.user;
    const userId = sessionUser?.id;
    if (!userId) {
      const fallbackUser = await getDevCustomerFallback();
      return ok({
        authenticated: Boolean(fallbackUser),
        user: fallbackUser
      });
    }

    const user = await upsertUser({
      id: userId,
      role: sessionUser.role ?? "customer",
      name: sessionUser.name?.trim() || sessionUser.email?.trim() || "RBA Customer",
      city: "bengaluru",
      kyc_status: "not_started",
      email: sessionUser.email ?? null
    });

    return ok({ authenticated: true, user });
  } catch (error) {
    return fromError(error);
  }
}

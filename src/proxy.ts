import { NextResponse, type NextRequest } from "next/server";
import {
  DASHBOARD_ACCESS_COOKIE,
  verifyDashboardAccessToken,
  type DashboardAccessRole
} from "@/lib/auth/dashboard-access";

function requiredRoleForPath(pathname: string): DashboardAccessRole | null {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  if (pathname === "/partner" || pathname.startsWith("/partner/")) return "partner_investor";
  return null;
}

export async function proxy(request: NextRequest) {
  const requiredRole = requiredRoleForPath(request.nextUrl.pathname);
  if (!requiredRole) return NextResponse.next();

  const token = request.cookies.get(DASHBOARD_ACCESS_COOKIE)?.value;
  const actor = await verifyDashboardAccessToken(token, requiredRole);
  if (actor) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/dashboard-access";
  loginUrl.searchParams.set("role", requiredRole === "admin" ? "admin" : "partner");
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/partner/:path*"]
};

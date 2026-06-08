"use client";

import type { FormEvent } from "react";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "../components/Icon";

function DashboardAccessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role") === "partner" ? "partner" : "admin";
  const nextPath = searchParams.get("next") || (requestedRole === "partner" ? "/partner" : "/admin");
  const [role, setRole] = useState<"admin" | "partner">(requestedRole);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [useOtp, setUseOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (role === "admin" ? "Admin access" : "Partner access"),
    [role]
  );

  async function finishLogin() {
    await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => undefined);
    router.replace(nextPath.startsWith("/") ? nextPath : role === "partner" ? "/partner" : "/admin");
    router.refresh();
  }

  async function passwordLogin() {
    const res = await fetch("/api/dashboard-access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role, password, action: "password" })
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setError(json?.error?.message ?? "Access failed.");
      return;
    }
    await finishLogin();
  }

  async function sendCode() {
    const res = await fetch("/api/dashboard-access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role, password, action: "send_code" })
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setError(json?.error?.message ?? "Could not send email code.");
      return;
    }
    setCodeSent(true);
    setNotice("Email OTP sent. It expires in 10 minutes.");
  }

  async function verifyCode() {
    const res = await fetch("/api/dashboard-access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role, code, action: "verify_code" })
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setError(json?.error?.message ?? "Code verification failed.");
      return;
    }
    await finishLogin();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (codeSent) {
        await verifyCode();
      } else {
        await passwordLogin();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-paper)]">
      <section className="section-shell flex min-h-[calc(100vh-72px)] items-center justify-center py-12">
        <div className="w-full max-w-md rounded-lg border border-[color:var(--color-line)] bg-white p-6 shadow-[0_20px_60px_color-mix(in_oklch,var(--color-ink)_10%,transparent)]">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-ink)] text-white">
            <Icon name="shield" className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-3xl font-black text-[color:var(--color-ink)]">{title}</h1>
          <p className="mb-6 text-sm leading-relaxed text-[color:var(--color-copy)]">
            Enter the dashboard password to continue. Use email OTP only when you want an extra staff verification step.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[color:var(--color-muted)]">Dashboard</label>
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-[color:var(--color-paper-2)] p-1">
                {[
                  { key: "admin", label: "Admin" },
                  { key: "partner", label: "Partner" }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setRole(item.key as "admin" | "partner")}
                    className={`rounded-md py-2 text-sm font-bold transition-colors ${
                      role === item.key
                        ? "bg-[color:var(--color-ink)] text-white"
                        : "text-[color:var(--color-copy)] hover:bg-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="dashboard-password" className="mb-1.5 block text-xs font-bold text-[color:var(--color-muted)]">
                Password
              </label>
              <input
                id="dashboard-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field-control"
                autoComplete="current-password"
                required
              />
            </div>

            {useOtp ? (
              <div className="rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-paper-2)] p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[color:var(--color-muted)]">Email OTP</div>
                    <div className="text-xs text-[color:var(--color-copy)]">Requires the correct password before sending.</div>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-bold text-[color:var(--color-ink)] underline underline-offset-4"
                    onClick={() => {
                      setUseOtp(false);
                      setCodeSent(false);
                      setCode("");
                      setNotice(null);
                    }}
                  >
                    Hide
                  </button>
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    id="dashboard-code"
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="field-control"
                    autoComplete="one-time-code"
                    placeholder="6-digit OTP"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      setError(null);
                      setNotice(null);
                      setLoading(true);
                      try {
                        await sendCode();
                      } catch {
                        setError("Network error. Please try again.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="btn-secondary whitespace-nowrap"
                    disabled={loading || !password}
                  >
                    Send OTP
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="w-full rounded-lg border border-[color:var(--color-line)] bg-white px-3 py-2.5 text-sm font-bold text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-2)]"
                onClick={() => setUseOtp(true)}
              >
                Use email OTP verification
              </button>
            )}

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                {notice}
              </p>
            )}

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? "Checking..." : codeSent ? "Verify OTP and Continue" : "Continue with Password"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default function DashboardAccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[color:var(--color-paper)]" />}>
      <DashboardAccessForm />
    </Suspense>
  );
}

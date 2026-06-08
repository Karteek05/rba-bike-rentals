"use client";

import { useEffect, useState } from "react";
import Icon from "../components/Icon";

type AuthMode = "email" | "signup";

async function postAuth(path: string, body: Record<string, unknown>) {
  const response = await fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json?.message ?? json?.error?.message ?? "Authentication failed");
  }
  return json as { url?: string; redirect?: boolean };
}

async function clearStaffAccess() {
  await fetch("/api/dashboard-access", { method: "DELETE" }).catch(() => undefined);
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") {
      setMode("signup");
    }
  }, []);

  async function run(action: () => Promise<void>) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";
  const heading = isSignup ? "Create account" : "Sign in";
  const supporting =
    isSignup
      ? "Register once, then manage bookings from one place."
      : "Book scooters, view rentals, and keep your account handy.";

  return (
    <div className="min-h-screen bg-[color:var(--color-paper)] px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-ink)] text-white">
            <Icon name="shield" className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black text-[color:var(--color-ink)]">{heading}</h1>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-copy)]">{supporting}</p>
        </div>

        <div className="rounded-lg border border-[color:var(--color-line)] bg-white p-5 shadow-[0_20px_60px_color-mix(in_oklch,var(--color-ink)_8%,transparent)]">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-[color:var(--color-paper-2)] p-1">
            {[
              { key: "email", label: "Sign in" },
              { key: "signup", label: "Register" }
            ].map((item) => (
              <button
                key={item.key}
                className={`rounded-md py-2 text-sm font-bold transition-colors ${
                  mode === item.key
                    ? "bg-[color:var(--color-ink)] text-white"
                    : "text-[color:var(--color-copy)] hover:bg-white hover:text-[color:var(--color-ink)]"
                }`}
                onClick={() => setMode(item.key as AuthMode)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          {isSignup && (
            <label className="mb-3 block">
              <span className="mb-1.5 block text-xs font-bold text-[color:var(--color-muted)]">Name</span>
              <input className="field-control" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          )}

          <label className="mb-3 block">
            <span className="mb-1.5 block text-xs font-bold text-[color:var(--color-muted)]">Email</span>
            <input
              className="field-control"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete={isSignup ? "email" : "username"}
            />
          </label>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-bold text-[color:var(--color-muted)]">Password</span>
            <input
              className="field-control"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </label>

          {isSignup && signupOtpSent ? (
            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-bold text-[color:var(--color-muted)]">Email verification code</span>
              <input
                className="field-control"
                placeholder="6-digit code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                inputMode="numeric"
              />
            </label>
          ) : null}

          <button
            className="btn-primary w-full py-3"
            disabled={loading}
            onClick={() =>
              run(async () => {
                if (!isSignup) {
                  await clearStaffAccess();
                  await postAuth("sign-in/email", { email, password, callbackURL: "/browse" });
                  window.location.href = "/browse";
                  return;
                }

                if (!signupOtpSent) {
                  await clearStaffAccess();
                  await postAuth("sign-up/email", {
                    email,
                    password,
                    name: name || email,
                    callbackURL: "/browse"
                  });
                  await postAuth("email-otp/send-verification-otp", {
                    email,
                    type: "email-verification"
                  });
                  setSignupOtpSent(true);
                  setMessage("We sent a verification code to your email.");
                  return;
                }

                await postAuth("email-otp/verify-email", { email, otp });
                window.location.href = "/browse";
              })
            }
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? signupOtpSent
                  ? "Verify and continue"
                  : "Create account"
                : "Sign in"}
          </button>

          {mode === "email" && (
            <p className="mt-5 text-center text-sm text-[color:var(--color-copy)]">
              New customer?{" "}
              <button
                type="button"
                className="font-bold text-[color:var(--color-ink)] underline underline-offset-4"
                onClick={() => {
                  setMode("signup");
                  setSignupOtpSent(false);
                  setOtp("");
                }}
              >
                Register here
              </button>
            </p>
          )}
          {isSignup && (
            <p className="mt-5 text-center text-sm text-[color:var(--color-copy)]">
              Already registered?{" "}
              <button
                type="button"
                className="font-bold text-[color:var(--color-ink)] underline underline-offset-4"
                onClick={() => {
                  setMode("email");
                  setSignupOtpSent(false);
                  setOtp("");
                }}
              >
                Sign in
              </button>
            </p>
          )}

          {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        <div className="mt-4 rounded-lg border border-[color:var(--color-line)] bg-white/70 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[color:var(--color-ink)]">
            <Icon name="settings" className="h-4 w-4" />
            Staff dashboard access
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a href="/dashboard-access?role=admin" className="btn-secondary text-center">
              Admin Login
            </a>
            <a href="/dashboard-access?role=partner" className="btn-secondary text-center">
              Partner Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

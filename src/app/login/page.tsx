"use client";

import { useEffect, useState } from "react";
import Icon from "../components/Icon";

type AuthMode = "email" | "signup" | "mobile";

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

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
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
  const heading = isSignup ? "Create account" : mode === "mobile" ? "Mobile sign in" : "Sign in";
  const supporting =
    isSignup
      ? "Register once, then complete KYC and manage rides from one place."
      : "Book, verify, and track your rides securely.";

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
          <div className="mb-5 grid grid-cols-3 gap-2 rounded-lg bg-[color:var(--color-paper-2)] p-1">
            {[
              { key: "email", label: "Sign in" },
              { key: "signup", label: "Register" },
              { key: "mobile", label: "Mobile" }
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

          {mode !== "mobile" ? (
            <>
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
              <button
                className="btn-primary w-full py-3"
                disabled={loading}
                onClick={() =>
                  run(async () => {
                    await postAuth(isSignup ? "sign-up/email" : "sign-in/email", {
                      email,
                      password,
                      name: name || email,
                      callbackURL: "/browse"
                    });
                    window.location.href = "/browse";
                  })
                }
              >
                {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
              </button>
            </>
          ) : (
            <>
              <label className="mb-3 block">
                <span className="mb-1.5 block text-xs font-bold text-[color:var(--color-muted)]">Mobile number</span>
                <input className="field-control" value={mobile} onChange={(event) => setMobile(event.target.value)} />
              </label>
              <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
                <input
                  className="field-control"
                  placeholder="OTP"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                />
                <button
                  className="btn-secondary px-4"
                  disabled={loading}
                  onClick={() =>
                    run(async () => {
                      await postAuth("phone-number/send-otp", { phoneNumber: mobile });
                      setMessage("OTP sent. In local dev it is printed in the server console.");
                    })
                  }
                >
                  Send OTP
                </button>
              </div>
              <button
                className="btn-primary w-full py-3"
                disabled={loading}
                onClick={() =>
                  run(async () => {
                    await postAuth("phone-number/verify", { phoneNumber: mobile, code: otp });
                    window.location.href = "/browse";
                  })
                }
              >
                Verify and continue
              </button>
            </>
          )}

          {mode === "email" && (
            <p className="mt-5 text-center text-sm text-[color:var(--color-copy)]">
              New customer?{" "}
              <button
                type="button"
                className="font-bold text-[color:var(--color-ink)] underline underline-offset-4"
                onClick={() => setMode("signup")}
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
                onClick={() => setMode("email")}
              >
                Sign in
              </button>
            </p>
          )}

          {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

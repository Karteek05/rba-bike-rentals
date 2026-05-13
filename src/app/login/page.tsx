"use client";

import { useState } from "react";
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-black text-white mx-auto flex items-center justify-center mb-4">
            <Icon name="shield" className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold">Sign in</h1>
          <p className="text-uber-body-gray text-sm mt-2">Book, verify, and track your rides securely.</p>
        </div>

        <div className="card border border-black/10 p-5">
          <button
            className="btn-secondary w-full py-3 mb-4"
            onClick={() =>
              run(async () => {
                const data = await postAuth("sign-in/social", {
                  provider: "google",
                  callbackURL: "/browse"
                });
                if (data.url) window.location.href = data.url;
              })
            }
            disabled={loading}
          >
            Continue with Google
          </button>

          <div className="flex gap-2 mb-5">
            {[
              { key: "email", label: "Email" },
              { key: "signup", label: "Sign up" },
              { key: "mobile", label: "Mobile" }
            ].map((item) => (
              <button
                key={item.key}
                className={`chip flex-1 ${mode === item.key ? "chip-active" : ""}`}
                onClick={() => setMode(item.key as AuthMode)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <label className="block mb-3">
              <span className="text-xs font-semibold uppercase text-uber-body-gray">Name</span>
              <input className="form-input mt-1" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          )}

          {mode !== "mobile" ? (
            <>
              <label className="block mb-3">
                <span className="text-xs font-semibold uppercase text-uber-body-gray">Email</span>
                <input
                  className="form-input mt-1"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="block mb-4">
                <span className="text-xs font-semibold uppercase text-uber-body-gray">Password</span>
                <input
                  className="form-input mt-1"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <button
                className="btn-primary w-full py-3"
                disabled={loading}
                onClick={() =>
                  run(async () => {
                    await postAuth(mode === "signup" ? "sign-up/email" : "sign-in/email", {
                      email,
                      password,
                      name: name || email,
                      callbackURL: "/browse"
                    });
                    window.location.href = "/browse";
                  })
                }
              >
                {mode === "signup" ? "Create account" : "Sign in"}
              </button>
            </>
          ) : (
            <>
              <label className="block mb-3">
                <span className="text-xs font-semibold uppercase text-uber-body-gray">Mobile number</span>
                <input className="form-input mt-1" value={mobile} onChange={(event) => setMobile(event.target.value)} />
              </label>
              <div className="grid grid-cols-[1fr_auto] gap-2 mb-3">
                <input
                  className="form-input"
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

          {message && <p className="text-green-700 text-sm mt-4">{message}</p>}
          {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
}

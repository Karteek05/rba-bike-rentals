"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/app/components/Icon";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") ?? "");
  }, []);

  async function handleReset(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is missing a token. Please request a new link.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password
        })
      });

      if (!response.ok) {
        throw new Error("This reset link is invalid or expired.");
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 1200);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-dark text-white shadow-[0_8px_16px_rgba(0,0,0,0.1)]">
            <Icon name="shield" className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black text-brand-dark">Reset password</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#526074]">
            Set a new password for your RBA account.
          </p>
        </div>

        <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-[rgba(0,0,0,0.08)_0px_8px_24px]">
          {error ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-600">
              {error}
            </div>
          ) : null}
          {done ? (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm font-medium text-green-700">
              Password updated. Redirecting to sign in...
            </div>
          ) : null}

          <form onSubmit={handleReset} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#526074]">
                New password
              </span>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#526074]">
                Confirm password
              </span>
              <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
              />
            </label>

            <button type="submit" disabled={loading || done} className="btn-primary mt-2 w-full py-3 text-sm font-bold">
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>

          <Link href="/login" className="btn-secondary mt-4 w-full justify-center">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

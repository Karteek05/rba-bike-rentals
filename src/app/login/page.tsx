"use client";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import Icon from "@/app/components/Icon";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showResetAction, setShowResetAction] = useState(false);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "register") {
      setMode("register");
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) {
      const role = (session.user as any).role as string;
      if (role === "admin") router.push("/admin");
      else if (role === "partner_investor") router.push("/partner");
      else if (role === "customer") router.push("/customer");
      else router.push("/");
    }
  }, [session, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    setShowResetAction(false);

    const { error } =
      mode === "register"
        ? await authClient.signUp.email({
            email,
            password,
            name: name.trim() || email.split("@")[0] || "RBA Customer",
            callbackURL: "/profile"
          })
        : await authClient.signIn.email({
            email,
            password
          });

    if (error) {
      const message = error.message || "";
      const code = "code" in error ? String(error.code ?? "") : "";
      const isDuplicateEmail =
        mode === "register" &&
        (code.includes("USER_ALREADY_EXISTS") ||
          message.toLowerCase().includes("already") ||
          message.toLowerCase().includes("exists"));

      setError(
        isDuplicateEmail
          ? "An account already exists with this email. Reset your password or sign in instead."
          : message ||
              (mode === "register"
                ? "Failed to create your account."
                : "Failed to sign in. Please check your credentials.")
      );
      setShowResetAction(isDuplicateEmail || mode === "signin");
      setLoading(false);
    } else {
      // The useEffect will handle redirect once session updates
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    setNotice("");
    setShowResetAction(false);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: mode === "register" ? "/profile" : "/",
    });

    if (error) {
      setError(error.message || "Failed to continue with Google.");
      setLoading(false);
    }
  };

  const isRegister = mode === "register";

  function switchMode(nextMode: "signin" | "register") {
    setError("");
    setNotice("");
    setShowResetAction(false);
    setMode(nextMode);
    router.replace(nextMode === "register" ? "/login?mode=register" : "/login", {
      scroll: false
    });
  }

  const handleRequestPasswordReset = async () => {
    if (!email) {
      setError("Enter your email first so we can send the reset link.");
      return;
    }

    setResetLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          redirectTo: "/reset-password"
        })
      });

      if (!response.ok) {
        throw new Error("Could not send the reset link right now.");
      }

      setNotice("If this email exists, a password reset link has been sent.");
      setShowResetAction(false);
      setMode("signin");
      router.replace("/login", { scroll: false });
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Could not send the reset link right now.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-md flex-col justify-center"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-dark text-white shadow-[0_8px_16px_rgba(0,0,0,0.1)]">
            <Icon name="shield" className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black text-brand-dark">
            {isRegister ? "Register" : "Sign in"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#526074]">
            {isRegister
              ? "Create your account to book scooters and track rentals."
              : "Book scooters, view rentals, and keep your account handy."}
          </p>
        </div>

        <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-[rgba(0,0,0,0.08)_0px_8px_24px]">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-600">
              <p>{error}</p>
              {showResetAction ? (
                <button
                  type="button"
                  onClick={handleRequestPasswordReset}
                  disabled={resetLoading}
                  className="mt-3 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-black text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resetLoading ? "Sending reset link..." : "Send password reset link"}
                </button>
              ) : null}
            </div>
          )}

          {notice && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm font-medium text-green-700">
              {notice}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegister ? (
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-[#526074] uppercase tracking-wider">Name</span>
                <input
                  className="form-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>
            ) : null}
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[#526074] uppercase tracking-wider">Email</span>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[#526074] uppercase tracking-wider">Password</span>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 text-sm font-bold"
            >
              {loading ? (isRegister ? "Creating account..." : "Signing in...") : isRegister ? "Register with email" : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-brand-dark/10"></div>
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#afafaf]">Or</span>
            <div className="flex-1 border-t border-brand-dark/10"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-full border border-brand-dark/20 bg-white text-brand-dark px-5 py-3 text-sm font-bold transition-colors hover:bg-[#f7f7f7] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {isRegister ? "Register with Google" : "Sign in with Google"}
          </button>

          {!isRegister ? (
            <button
              type="button"
              onClick={handleRequestPasswordReset}
              disabled={resetLoading}
              className="nav-focus mt-4 w-full text-center text-xs font-bold text-[#526074] transition-colors hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resetLoading ? "Sending reset link..." : "Forgot password?"}
            </button>
          ) : null}
        </div>

        <div className="mt-4 rounded-xl border border-brand-dark/10 bg-white/70 p-4 text-center backdrop-blur-md">
          <p className="text-sm font-bold text-brand-dark">
            {isRegister ? "Already have an account?" : "New to RBA Bike Rentals?"}
          </p>
          <button
            type="button"
            className="btn-secondary mt-3 w-full justify-center text-sm"
            onClick={() => switchMode(isRegister ? "signin" : "register")}
          >
            {isRegister ? "Sign in instead" : "Create an account"}
          </button>
        </div>
        
        <p className="text-center text-[10px] text-[#afafaf] mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>

    </div>
  );
}

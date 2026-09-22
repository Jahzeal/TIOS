"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Eye,
  EyeOff,
  X,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import { authApi } from "@/lib/api";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);

  // Forgot password flow states
  const [viewMode, setViewMode] = useState<"LOGIN" | "FORGOT_SEND" | "FORGOT_VERIFY">("LOGIN");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const googleBtnRef = React.useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services
  useEffect(() => {
    let isMounted = true;
    async function initGoogleAuth() {
      try {
        const res = await authApi.getGoogleClientId();
        if (res?.clientId && isMounted) {
          setGoogleClientId(res.clientId);
          loadGoogleGsiScript(res.clientId);
        }
      } catch (err) {
        console.log("[GoogleAuth] Google client ID check:", err);
      }
    }
    initGoogleAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadGoogleGsiScript = (clientId: string) => {
    if (typeof window === "undefined") return;
    if (document.getElementById("google-gsi-client")) {
      renderGoogleButton(clientId);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => renderGoogleButton(clientId);
    document.body.appendChild(script);
  };

  const renderGoogleButton = (clientId: string) => {
    if (typeof window === "undefined" || !window.google?.accounts?.id) return;
    if (!googleBtnRef.current) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
      });

      googleBtnRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: "360",
        text: "signin_with",
        shape: "rectangular",
      });
    } catch (err) {
      console.warn("[GoogleAuth] renderButton error:", err);
    }
  };

  useEffect(() => {
    if (viewMode === "LOGIN" && googleClientId) {
      renderGoogleButton(googleClientId);
    }
  }, [viewMode, googleClientId]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (viewMode === "FORGOT_VERIFY" && resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [viewMode, resendCountdown]);

  const routeUserAfterLogin = (accountType?: string, token?: string, userEmail?: string) => {
    const type = accountType || authApi.getAccountType();
    if (type === "SALES") {
      window.location.href = "/sales";
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authApi.googleLogin(response.credential);
      authApi.setSession({
        token: res.token,
        email: res.email,
        accountType: (res.accountType as any) || "VOICE",
      });
      routeUserAfterLogin(res.accountType, res.token, res.email);
    } catch (err: any) {
      setErrorMessage(err.message || "Google Sign-In failed.");
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await authApi.login({ email: email.trim(), password });
      authApi.setSession({
        token: res.token,
        email: res.email,
        accountType: (res.accountType as any) || "VOICE",
      });
      routeUserAfterLogin(res.accountType, res.token, res.email);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid account email address.");
      return;
    }
    setLoading(true);

    try {
      await authApi.forgotPassword(email.trim());
      setViewMode("FORGOT_VERIFY");
      setResendCountdown(60);
      setSuccessMessage(`We sent a 6-digit code to ${email.trim()}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send reset code. Please verify your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!resetCode.trim() || resetCode.trim().length < 6) {
      setErrorMessage("Please enter the 6-digit reset code.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters.");
      return;
    }
    setLoading(true);

    try {
      const res = await authApi.resetPassword(email.trim(), resetCode.trim(), newPassword);
      authApi.setSession({
        token: res.token,
        email: res.email,
        accountType: "VOICE",
      });
      routeUserAfterLogin("VOICE");
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid or expired reset code.");
      setLoading(false);
    }
  };

  const handleResendResetCode = async () => {
    if (resendCountdown > 0 || !email) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      await authApi.forgotPassword(email.trim());
      setResendCountdown(60);
      setSuccessMessage("A fresh 6-digit code has been dispatched to your email.");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col lg:flex-row w-full selection:bg-primary selection:text-on-primary">
      {/* 1. Left Panel: Branded Showcase Section */}
      <div className="hidden lg:flex w-1/2 bg-surface-container-low flex-col justify-between p-12 border-r border-outline-variant relative overflow-hidden text-left">
        <div className="absolute -top-[20%] -left-[10%] w-[120%] h-[120%] bg-gradient-to-br from-surface-container to-surface-container-highest opacity-50 rotate-12 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Brand Logo */}
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-display text-2xl font-bold text-primary tracking-tight">Flucture</span>
            </Link>
          </div>

          {/* Value Proposition */}
          <div className="mb-8 max-w-md">
            <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-surface mb-3 leading-tight">
              Welcome back to your autonomous revenue operations.
            </h2>
            <p className="font-body-lg text-base text-on-surface-variant leading-relaxed">
              Log in to manage your AI sales pipeline, review live voice calls, monitor email replies, and oversee booked demos.
            </p>
          </div>

          {/* Live System Status Widget */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md p-5 max-w-lg space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Autonomous Services</span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>Systems Active</span>
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs text-on-surface-variant">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <span className="flex items-center gap-2 font-medium text-on-surface">
                  <Search className="w-3.5 h-3.5 text-primary" /> AIOS Sales Prospecting & Email
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">Running</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <span className="flex items-center gap-2 font-medium text-on-surface">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> TIOS 24/7 Voice Receptionist
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">Online</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-on-surface-variant text-xs font-label-sm">
            © 2026 Flucture AI Inc. Single Sign-On Access Portal.
          </div>
        </div>
      </div>

      {/* 2. Right Panel: Login / Forgot Password Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-margin-mobile md:p-12 lg:p-16 bg-surface-container-lowest text-left min-h-screen lg:min-h-0">
        <main className="w-full max-w-[420px] mx-auto flex flex-col gap-6 my-auto">
          {/* Messages */}
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 text-xs font-medium flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-700 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {viewMode === "LOGIN" && (
            <>
              {/* Form Header */}
              <div className="flex flex-col gap-1.5">
                <h1 className="font-headline-lg-mobile text-2xl md:text-3xl font-bold text-primary">
                  Log in to Flucture
                </h1>
                <p className="font-body-sm text-sm text-on-surface-variant">
                  Enter your credentials or sign in with Google to continue.
                </p>
              </div>

              {/* Google Sign-In Container */}
              <div className="w-full flex justify-center">
                <div
                  id="google-login-btn-container"
                  ref={googleBtnRef}
                  className="w-full flex justify-center min-h-[44px]"
                ></div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-outline-variant"></div>
                <span className="flex-shrink-0 mx-3 font-label-sm text-xs text-outline font-bold uppercase tracking-wider">
                  OR EMAIL LOGIN
                </span>
                <div className="flex-grow border-t border-outline-variant"></div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase" htmlFor="email">
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase" htmlFor="password">
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setSuccessMessage(null);
                        setViewMode("FORGOT_SEND");
                      }}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-3 pr-10 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-outline hover:text-on-surface transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-2 bg-primary text-on-primary rounded-lg font-label-md text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 font-bold shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Register Link */}
              <div className="text-center pt-1">
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Don&apos;t have an account?{" "}
                  <Link href="/onboarding" className="text-primary font-bold hover:underline">
                    Sign up free
                  </Link>
                </p>
              </div>
            </>
          )}

          {viewMode === "FORGOT_SEND" && (
            <div className="space-y-5">
              <div>
                <h1 className="font-headline-lg text-2xl font-bold text-primary mb-1">
                  Reset your password
                </h1>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Enter your account email and we will send you a 6-digit verification code.
                </p>
              </div>

              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase">
                    Account Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-primary text-on-primary rounded-lg font-label-md text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Send Reset Code
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setViewMode("LOGIN");
                  }}
                  className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
                >
                  ← Back to Log In
                </button>
              </div>
            </div>
          )}

          {viewMode === "FORGOT_VERIFY" && (
            <div className="space-y-5">
              <div>
                <h1 className="font-headline-lg text-2xl font-bold text-primary mb-1">
                  Enter verification code
                </h1>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full h-11 text-center font-mono tracking-widest text-lg bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full h-11 pl-3.5 pr-10 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 px-3.5 flex items-center text-outline hover:text-on-surface transition-colors"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-primary text-on-primary rounded-lg font-label-md text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      Save New Password &amp; Log In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setViewMode("LOGIN");
                  }}
                  className="font-bold text-on-surface-variant hover:text-primary"
                >
                  ← Back to Log In
                </button>

                <button
                  type="button"
                  disabled={resendCountdown > 0 || loading}
                  onClick={handleResendResetCode}
                  className="font-semibold text-primary disabled:text-outline hover:underline"
                >
                  {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : "Resend Code"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

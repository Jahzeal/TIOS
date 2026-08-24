"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PhoneCall,
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
  X,
  Sparkles,
} from "lucide-react";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber) {
      alert("Please ensure your password meets all strength requirements.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!agreedToTerms) {
      alert("Please accept the Terms of Service and Privacy Policy.");
      return;
    }
    // Redirect to business onboarding setup
    window.location.href = "/onboarding";
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col lg:flex-row w-full selection:bg-primary selection:text-on-primary">
      {/* 1. Left Panel: Branded Showcase Section (Visible on Desktop / Large screens) */}
      <div className="hidden lg:flex w-1/2 bg-surface-container-low flex-col justify-between p-12 border-r border-outline-variant relative overflow-hidden text-left">
        {/* Background Gradient Element */}
        <div className="absolute -top-[20%] -left-[10%] w-[120%] h-[120%] bg-gradient-to-br from-surface-container to-surface-container-highest opacity-50 rotate-12 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Brand Logo */}
          <div className="mb-16">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-display text-2xl font-bold text-primary tracking-tight">TIOS</span>
            </Link>
          </div>

          {/* Value Proposition */}
          <div className="mb-auto max-w-md">
            <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-surface mb-4 leading-tight">
              Your intelligent operating system for customer conversations.
            </h2>
            <p className="font-body-lg text-base md:text-lg text-on-surface-variant leading-relaxed">
              Create your account and start setting up an AI voice receptionist for your business in under 5 minutes.
            </p>
          </div>

          {/* Product Preview UI Mockup */}
          <div className="mt-12 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md p-6 max-w-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-label-md text-label-md font-bold text-on-surface">Incoming Call</div>
                  <div className="font-label-sm text-xs text-on-surface-variant">+1 (555) 0198-432</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low border border-outline-variant rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="font-label-sm text-xs text-on-surface-variant font-medium">AI Handling</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="bg-surface-container-low p-3.5 rounded-lg rounded-tl-none border border-outline-variant text-body-sm text-on-surface text-sm">
                  &quot;Hello, thank you for calling TIOS. I&apos;m your AI assistant. How can I direct your call or help you schedule an appointment today?&quot;
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-outline-variant text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Call Outcome: Appointment Scheduled</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-on-surface-variant text-xs font-label-sm">
            © 2026 TIOS B2B SaaS. All rights reserved. Precision in every call.
          </div>
        </div>
      </div>

      {/* 2. Right Panel: Authentication Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-margin-mobile md:p-12 lg:p-20 bg-surface-container-lowest text-left min-h-screen lg:min-h-0">
        <main className="w-full max-w-[420px] mx-auto flex flex-col gap-6 my-auto">
          {/* Mobile Branding Header */}
          <header className="flex flex-col items-center justify-center text-center gap-2 mb-2 lg:hidden">
            <Link href="/" className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="font-headline-md text-2xl text-on-primary font-bold">T</span>
            </Link>
            <p className="font-body-sm text-xs text-on-surface-variant max-w-[200px]">
              Your intelligent operating system
            </p>
          </header>

          {/* Form Header */}
          <div className="flex flex-col gap-1">
            <h1 className="font-headline-lg-mobile text-2xl md:text-3xl font-bold text-primary">
              Create your TIOS account
            </h1>
            <p className="font-body-sm text-sm text-on-surface-variant">
              Get started with TIOS and set up your business in a few simple steps.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name Field */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase" htmlFor="fullName">
                FULL NAME
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>

            {/* Work Email Field */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase" htmlFor="workEmail">
                WORK EMAIL
              </label>
              <input
                id="workEmail"
                type="email"
                required
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                placeholder="jane@company.com"
                className="w-full h-11 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase" htmlFor="password">
                PASSWORD
              </label>
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
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Progress Bar */}
              <div className="flex gap-1 mt-1.5">
                <div className={`h-1 flex-1 rounded-full transition-colors ${hasMinLength ? "bg-emerald-500" : "bg-surface-variant"}`}></div>
                <div className={`h-1 flex-1 rounded-full transition-colors ${hasUpper ? "bg-emerald-500" : "bg-surface-variant"}`}></div>
                <div className={`h-1 flex-1 rounded-full transition-colors ${hasLower ? "bg-emerald-500" : "bg-surface-variant"}`}></div>
                <div className={`h-1 flex-1 rounded-full transition-colors ${hasNumber ? "bg-emerald-500" : "bg-surface-variant"}`}></div>
              </div>

              {/* Requirements checklist */}
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-on-surface-variant">
                <span className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-700 font-medium" : ""}`}>
                  {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  8 chars
                </span>
                <span className={`flex items-center gap-1 ${hasUpper ? "text-emerald-700 font-medium" : ""}`}>
                  {hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  1 upper
                </span>
                <span className={`flex items-center gap-1 ${hasLower ? "text-emerald-700 font-medium" : ""}`}>
                  {hasLower ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  1 lower
                </span>
                <span className={`flex items-center gap-1 ${hasNumber ? "text-emerald-700 font-medium" : ""}`}>
                  {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  1 number
                </span>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase" htmlFor="confirmPassword">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-3 pr-10 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-outline hover:text-on-surface transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 mt-1">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest transition-colors cursor-pointer mt-0.5"
                />
              </div>
              <label className="font-body-sm text-xs text-on-surface-variant leading-tight cursor-pointer" htmlFor="terms">
                I agree to the{" "}
                <a className="text-primary font-bold hover:underline" href="#">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a className="text-primary font-bold hover:underline" href="#">
                  Privacy Policy
                </a>.
              </label>
            </div>

            {/* Primary CTA */}
            <button
              type="submit"
              className="w-full h-11 mt-2 bg-primary text-on-primary rounded-lg font-label-md text-sm hover:bg-on-surface-variant transition-colors flex items-center justify-center font-bold"
            >
              Create Account
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="flex-shrink-0 mx-4 font-label-sm text-xs text-outline font-bold uppercase tracking-wider">
              OR
            </span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>

          {/* Social Login CTA */}
          <button
            type="button"
            onClick={() => alert("Google SSO Integration initialized.")}
            className="w-full h-11 bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg font-label-md text-sm hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              ></path>
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              ></path>
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              ></path>
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              ></path>
            </svg>
            Continue with Google
          </button>

          {/* Footer Login Link */}
          <div className="text-center pt-2">
            <p className="font-body-sm text-xs text-on-surface-variant">
              Already have an account?{" "}
              <Link href="/dashboard" className="text-primary font-bold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

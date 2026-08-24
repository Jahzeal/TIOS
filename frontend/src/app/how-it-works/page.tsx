"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  PhoneCall,
  Bot,
  Network,
  CheckCircle2,
  Phone,
  Plus,
  Check,
  Stethoscope,
  Building,
  Sliders,
  User,
  ChevronRight,
  ArrowRight,
  Star,
  Headset,
  Settings,
  Briefcase,
  CreditCard,
  Rocket,
  BarChart3,
  Calendar,
  ToggleRight,
  Menu,
  X,
  Shield,
  Building2,
  BookOpen,
  ArrowDown,
  Activity,
  Layers,
} from "lucide-react";

export default function HowItWorksPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [afterHoursVoicemail, setAfterHoursVoicemail] = useState(true);

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col selection:bg-primary selection:text-on-primary">
      {/* 1. Top Navigation Bar */}
      <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-50 w-full border-b border-outline-variant">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-16 md:h-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden text-on-surface-variant p-2 hover:bg-surface-container-low rounded-lg transition-all focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
              <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">TIOS</span>
            </Link>
          </div>

          <nav className="hidden md:flex gap-6 items-center">
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="/features">
              Features
            </Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="/receptionists">
              AI Receptionists
            </Link>
            <Link className="font-label-md text-label-md text-primary font-bold border-b-2 border-primary pb-1" href="/how-it-works">
              How It Works
            </Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="/solutions">
              Solutions
            </Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="/pricing">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="font-label-md text-label-md text-primary hover:opacity-80 transition-opacity hidden md:block">
              Login
            </Link>
            <Link href="/dashboard" className="font-label-md text-label-md bg-primary text-on-primary px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden bg-surface-container-lowest border-b border-outline-variant p-4 flex flex-col gap-2 shadow-xl text-left">
            <div className="px-3 py-2 font-headline-md font-bold text-primary flex items-center justify-between">
              <span>TIOS Navigation</span>
              <button onClick={() => setMobileNavOpen(false)} className="text-on-surface-variant p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl font-label-md text-label-md" href="/features">
              <Star className="w-5 h-5" /> Features
            </Link>
            <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl font-label-md text-label-md" href="/receptionists">
              <Headset className="w-5 h-5" /> AI Receptionists
            </Link>
            <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-label-md text-label-md font-bold" href="/how-it-works">
              <Settings className="w-5 h-5" /> How It Works
            </Link>
            <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl font-label-md text-label-md" href="/#solutions">
              <Briefcase className="w-5 h-5" /> Solutions
            </Link>
            <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl font-label-md text-label-md" href="/#pricing">
              <CreditCard className="w-5 h-5" /> Pricing
            </Link>
            <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3 text-primary font-bold hover:bg-surface-container rounded-xl font-label-md text-label-md" href="/dashboard">
              <User className="w-5 h-5" /> Account Log In
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full flex-grow">
        {/* 2. Hero Section */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-on-surface mb-6 max-w-3xl mx-auto tracking-tight">
            From setup to your first conversation.
          </h1>
          <p className="font-body-lg text-base md:text-xl text-on-surface-variant mb-8 max-w-2xl mx-auto">
            A seamless journey to deploy an intelligent voice agent. Connect your number, configure its personality, feed it knowledge, test the waters, and go live.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-14 max-w-md mx-auto sm:max-w-none">
            <Link href="/dashboard" className="w-full sm:w-auto font-label-md text-label-md bg-primary text-on-primary px-6 py-3.5 rounded-lg hover:opacity-90 transition-opacity font-semibold">
              Get Started
            </Link>
            <a href="#journey" className="w-full sm:w-auto font-label-md text-label-md bg-surface-container-lowest border border-outline-variant text-on-surface px-6 py-3.5 rounded-lg hover:bg-surface-container-low transition-colors font-semibold">
              Book a Demo
            </a>
          </div>

          {/* Workflow Concept Card */}
          <div className="w-full max-w-4xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm text-left">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-6">
              <div className="flex items-center gap-3">
                <Network className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-headline-md text-base font-bold">Autonomous Integration Pipeline</h3>
                  <p className="text-xs text-on-surface-variant">Real-time setup status overview</p>
                </div>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Ready to Sync
              </span>
            </div>

            {/* Step Progress Line */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="p-3 bg-surface border border-outline-variant/40 rounded-lg">
                <span className="text-[10px] text-on-surface-variant font-mono uppercase">Step 01</span>
                <p className="font-bold text-xs mt-0.5">Connect Number</p>
              </div>
              <div className="p-3 bg-surface border border-outline-variant/40 rounded-lg">
                <span className="text-[10px] text-on-surface-variant font-mono uppercase">Step 02</span>
                <p className="font-bold text-xs mt-0.5">Select Template</p>
              </div>
              <div className="p-3 bg-surface border border-outline-variant/40 rounded-lg">
                <span className="text-[10px] text-on-surface-variant font-mono uppercase">Step 03</span>
                <p className="font-bold text-xs mt-0.5">Define Rules</p>
              </div>
              <div className="p-3 bg-surface border border-outline-variant/40 rounded-lg">
                <span className="text-[10px] text-on-surface-variant font-mono uppercase">Step 04</span>
                <p className="font-bold text-xs mt-0.5">Sync Knowledge</p>
              </div>
              <div className="p-3 bg-surface border border-outline-variant/40 rounded-lg">
                <span className="text-[10px] text-on-surface-variant font-mono uppercase">Step 05</span>
                <p className="font-bold text-xs mt-0.5">Simulate Call</p>
              </div>
              <div className="p-3 bg-primary text-on-primary rounded-lg">
                <span className="text-[10px] text-tertiary-fixed-dim font-mono uppercase">Step 06</span>
                <p className="font-bold text-xs mt-0.5">Go Live 🚀</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Setup Journey (Desktop Deep Dive + Mobile Vertical Timeline) */}
        <section id="journey" className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-t border-outline-variant">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-surface mb-3">The Setup Journey</h2>
            <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">Six simple steps to autonomous business operations.</p>
          </div>

          <div className="space-y-16 md:space-y-28">
            {/* Step 1: Connect */}
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 text-left">
              <div className="w-full md:w-1/3">
                <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-2 font-bold">Step 01</div>
                <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface mb-4">Connect</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Claim a new dedicated business line or port your existing number. This establishes your business&apos;s new intelligent voice gateway.
                </p>
              </div>
              <div className="w-full md:w-2/3 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-outline-variant pb-4 mb-2">
                  <span className="font-headline-md text-lg md:text-headline-md font-bold text-on-surface">Phone Numbers</span>
                  <button className="bg-primary text-on-primary font-label-sm text-label-sm px-3.5 py-2 rounded-lg flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add Number
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant rounded-lg">
                  <div className="flex items-center gap-4">
                    <Phone className="w-5 h-5 text-outline shrink-0" />
                    <div>
                      <div className="font-label-md text-label-md font-bold text-on-surface">+1 (555) 012-3456</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">Main Business Line</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded text-xs font-semibold flex items-center gap-1 border border-emerald-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Active
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Create */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 text-left">
              <div className="w-full md:w-1/3">
                <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-2 font-bold">Step 02</div>
                <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface mb-4">Create</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Start from scratch or select a specialized template. We have pre-configured models tailored specifically for your industry.
                </p>
              </div>
              <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:border-primary transition-colors cursor-pointer flex flex-col gap-2 items-start">
                  <Stethoscope className="w-8 h-8 text-outline mb-1" />
                  <div className="font-label-md text-label-md font-bold text-on-surface mt-2">Medical Clinic</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">Optimized for patient scheduling and common inquiries.</div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:border-primary transition-colors cursor-pointer flex flex-col gap-2 items-start">
                  <Building className="w-8 h-8 text-outline mb-1" />
                  <div className="font-label-md text-label-md font-bold text-on-surface mt-2">Real Estate</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">Handles property inquiries and agent routing.</div>
                </div>
              </div>
            </div>

            {/* Step 3: Configure */}
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 text-left">
              <div className="w-full md:w-1/3">
                <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-2 font-bold">Step 03</div>
                <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface mb-4">Configure</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Define the personality, voice, and core instructions that dictate how your receptionist behaves on every call.
                </p>
              </div>
              <div className="w-full md:w-2/3 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
                <div>
                  <label className="font-label-sm text-label-sm font-bold text-on-surface-variant mb-1 block">Agent Name</label>
                  <input
                    className="w-full border-outline-variant border rounded-lg bg-surface text-on-surface font-body-sm h-10 px-3 outline-none focus:ring-1 focus:ring-primary"
                    type="text"
                    defaultValue="Sarah - Main Receptionist"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm font-bold text-on-surface-variant mb-1 block">System Instructions</label>
                  <textarea
                    className="w-full border-outline-variant border rounded-lg bg-surface text-on-surface font-body-sm h-24 p-3 resize-none outline-none focus:ring-1 focus:ring-primary"
                    defaultValue="You are Sarah, the friendly receptionist for Acme Corp. Your primary goal is to qualify leads, answer FAQs, and schedule appointments."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. After Go Live Analytics Section */}
        <section className="py-16 md:py-20 bg-surface-container-low px-margin-mobile md:px-margin-desktop border-y border-outline-variant">
          <div className="max-w-container-max mx-auto text-left">
            <div className="text-center mb-12">
              <h2 className="font-headline-md md:font-headline-lg text-2xl md:text-4xl font-bold text-on-surface mb-2">
                After Go Live Analytics
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Monitor live execution metrics seamlessly.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Calls Handled (30d)</span>
                  <div className="font-headline-lg text-3xl font-bold text-on-surface mt-2">1,248</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Meetings Booked</span>
                  <div className="font-headline-lg text-3xl font-bold text-on-surface mt-2">84</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Total Business Control Settings */}
        <section className="py-16 md:py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-left">
          <div className="text-center mb-12">
            <h2 className="font-headline-md md:font-headline-lg text-2xl md:text-4xl font-bold text-on-surface mb-2">Total Control</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Adjust parameters in real-time right from your dashboard.</p>
          </div>
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 flex justify-between items-center shadow-sm">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-bold text-on-surface">After-hours Routing</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Send after-hours callers to AI receptionist voicemail</span>
              </div>
              <button
                onClick={() => setAfterHoursVoicemail(!afterHoursVoicemail)}
                className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 ${
                  afterHoursVoicemail ? "bg-primary" : "bg-outline-variant"
                }`}
              >
                <span className={`w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm transition-transform ${
                  afterHoursVoicemail ? "translate-x-5" : "translate-x-0"
                }`}></span>
              </button>
            </div>
            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 flex justify-between items-center shadow-sm">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-bold text-on-surface">Escalation Threshold</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">High-priority leads transferred directly to staff</span>
              </div>
              <ChevronRight className="w-5 h-5 text-outline-variant" />
            </div>
          </div>
        </section>

        {/* 6. Final CTA */}
        <section className="py-20 md:py-24 px-margin-mobile md:px-margin-desktop text-center bg-surface-container border-y border-outline-variant">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-on-surface mb-6">Ready to put TIOS to work?</h2>
            <p className="font-body-md text-on-surface-variant mb-8 max-w-xl mx-auto">
              Join thousands of businesses automating their phone communications with precision.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/dashboard" className="font-label-md text-label-md bg-primary text-on-primary px-8 py-4 rounded-lg hover:opacity-90 transition-opacity font-bold">
                Get Started
              </Link>
              <Link href="/#pricing" className="font-label-md text-label-md bg-surface-container-lowest border border-outline-variant text-on-surface px-8 py-4 rounded-lg hover:bg-surface-container-low transition-colors font-bold">
                Book a Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant w-full py-12 px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto gap-8 text-left">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Network className="w-4 h-4 text-on-primary" />
              </div>
              <span className="font-headline-md text-headline-md font-bold text-on-surface">TIOS</span>
            </Link>
            <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 TIOS AI Inc. All rights reserved. Precision in every call.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="/features">
              Features
            </Link>
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="/receptionists">
              AI Receptionists
            </Link>
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="/how-it-works">
              How It Works
            </Link>
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="/#pricing">
              Pricing
            </Link>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

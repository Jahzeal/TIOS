"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  PhoneCall,
  Bot,
  CheckCircle2,
  ArrowRight,
  Play,
  Pause,
  Calendar,
  Users,
  Building2,
  Headphones,
  BarChart3,
  Menu,
  X,
  RefreshCw,
  Clock,
  Activity,
  PhoneMissed,
  UserX,
  RotateCcw,
  MessageSquare,
  GitFork,
  BookOpen,
  HeartPulse,
  Building,
  ShoppingBag,
  Scale,
  Code,
  Check,
  PhoneOff,
  Grid,
  Zap,
  User,
  ExternalLink,
} from "lucide-react";

export default function PublicLandingPage() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="bg-background text-on-background min-h-screen antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      {/* 1. Navigation Header */}
      <header className="bg-surface/90 backdrop-blur-md fixed top-0 w-full z-50 border-b border-outline-variant/40">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-16 md:h-20 flex justify-between items-center">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link className="text-headline-md font-headline-md font-black text-primary flex items-center gap-2" href="#">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-geist tracking-tight text-xl font-bold">TIOS</span>
            </Link>
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link className="text-on-secondary-container font-medium text-label-md font-label-md hover:text-primary transition-colors duration-200" href="/features">
                Features
              </Link>
              <Link className="text-on-secondary-container font-medium text-label-md font-label-md hover:text-primary transition-colors duration-200" href="/receptionists">
                Receptionists
              </Link>
              <Link className="text-on-secondary-container font-medium text-label-md font-label-md hover:text-primary transition-colors duration-200" href="/how-it-works">
                How It Works
              </Link>
              <Link className="text-on-secondary-container font-medium text-label-md font-label-md hover:text-primary transition-colors duration-200" href="/solutions">
                Solutions
              </Link>
              <Link className="text-on-secondary-container font-medium text-label-md font-label-md hover:text-primary transition-colors duration-200" href="/pricing">
                Pricing
              </Link>
            </nav>
          </div>

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center gap-3">
            <Link
              className="hidden md:block text-on-secondary-container font-medium text-label-md font-label-md hover:text-primary transition-colors duration-200 px-3 py-2"
              href="/dashboard"
            >
              Log in
            </Link>
            <Link
              className="bg-primary text-on-primary text-label-md font-label-md px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all active:scale-[0.98] duration-150"
              href="/signup"
            >
              Get Started
            </Link>
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden text-primary p-2 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileNavOpen && (
          <div className="md:hidden bg-surface-container-lowest border-b border-outline-variant p-4 flex flex-col gap-3 shadow-lg">
            <a onClick={() => setMobileNavOpen(false)} className="text-on-surface font-medium py-2 border-b border-outline-variant/30" href="#features">
              Features
            </a>
            <a onClick={() => setMobileNavOpen(false)} className="text-on-surface font-medium py-2 border-b border-outline-variant/30" href="#receptionists">
              Receptionists
            </a>
            <a onClick={() => setMobileNavOpen(false)} className="text-on-surface font-medium py-2 border-b border-outline-variant/30" href="#how-it-works">
              How It Works
            </a>
            <a onClick={() => setMobileNavOpen(false)} className="text-on-surface font-medium py-2 border-b border-outline-variant/30" href="#solutions">
              Solutions
            </a>
            <a onClick={() => setMobileNavOpen(false)} className="text-on-surface font-medium py-2 border-b border-outline-variant/30" href="#pricing">
              Pricing
            </a>
            <Link onClick={() => setMobileNavOpen(false)} className="text-primary font-bold py-2" href="/dashboard">
              Log in
            </Link>
          </div>
        )}
      </header>

      <main className="w-full pt-20 md:pt-24">
        {/* 2. Hero Section */}
        <section className="relative pt-8 md:pt-16 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">
          {/* Ambient Lighting Glow */}
          <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-bl from-secondary-container/30 to-transparent rounded-full blur-3xl -z-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="flex flex-col gap-6 z-10 max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
              <h1 className="text-headline-lg-mobile md:text-display font-display text-on-background">
                Your business never misses a <span className="shimmer-text">conversation.</span>
              </h1>
              <p className="text-body-md md:text-body-lg font-body-lg text-on-surface-variant max-w-xl mx-auto lg:mx-0">
                Deploy an intelligent voice receptionist that answers calls, captures leads, and schedules follow-ups 24/7. Precision voice automation engineered for modern enterprises.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  className="bg-primary text-on-primary px-6 py-3.5 rounded-lg text-label-md font-label-md font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                  href="/dashboard"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  className="bg-surface-container-lowest text-primary border border-outline-variant px-6 py-3.5 rounded-lg text-label-md font-label-md font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                  href="#how-it-works"
                >
                  Book a Demo
                </a>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-6 mt-2 text-label-sm font-label-sm text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-tertiary-fixed-dim" />
                  <span>No coding required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-tertiary-fixed-dim" />
                  <span>Setup in 5 minutes</span>
                </div>
              </div>
            </div>

            {/* Hero Visual: Product Interface Preview */}
            <div className="relative z-10 w-full h-[460px] md:h-[540px] lg:h-[580px] premium-shadow rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden flex flex-col">
              {/* Window Header */}
              <div className="h-10 bg-surface-container-low border-b border-outline-variant flex items-center px-4 gap-2 w-full shrink-0">
                <div className="w-3 h-3 rounded-full bg-error/70"></div>
                <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
                <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim/70"></div>
                <div className="mx-auto text-label-sm font-label-sm text-on-surface-variant bg-surface-container px-3 py-0.5 rounded-sm">
                  app.tios.ai/receptionist
                </div>
              </div>

              {/* Interface Body */}
              <div className="flex-1 flex w-full h-full bg-background relative overflow-hidden">
                {/* Mini Sidebar */}
                <div className="hidden sm:flex w-16 bg-surface-container-lowest border-r border-outline-variant flex-col items-center py-4 gap-6 shrink-0 z-10">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <div className="flex flex-col gap-4 mt-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary-container text-primary flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="w-10 h-10 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div className="w-10 h-10 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="w-10 h-10 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 md:gap-6 h-full overflow-hidden">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center w-full shrink-0">
                    <div>
                      <h3 className="text-headline-md font-headline-md text-on-surface text-[18px] md:text-[24px]">Active Receptionist</h3>
                      <p className="text-body-sm font-body-sm text-on-surface-variant">Monitoring incoming calls</p>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-3 py-1.5 rounded-lg shadow-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
                      <span className="text-label-sm font-label-sm font-medium">System Online</span>
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden min-h-0">
                    {/* Live Call Feed (Span 2) */}
                    <div className="md:col-span-2 bento-card flex flex-col h-full bg-surface-container-lowest border-outline-variant">
                      <div className="p-3 md:p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-tertiary-container" />
                          <span className="text-label-md font-label-md font-medium">+1 (555) 019-8432</span>
                        </div>
                        <span className="text-label-sm font-label-sm text-on-surface-variant">02:14</span>
                      </div>
                      <div className="p-3 md:p-4 flex-1 flex flex-col gap-3 overflow-y-auto bg-surface-container-lowest text-left">
                        {/* Call Transcript Blocks */}
                        <div className="flex gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="bg-surface-container rounded-lg rounded-tl-none p-2.5 max-w-[85%]">
                            <p className="text-body-sm font-body-sm">Hi, I&apos;m calling to ask about enterprise pricing plans for a team of 50.</p>
                          </div>
                        </div>
                        <div className="flex gap-2.5 flex-row-reverse">
                          <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="bg-secondary-container text-on-secondary-fixed rounded-lg rounded-tr-none p-2.5 max-w-[85%]">
                            <p className="text-body-sm font-body-sm">
                              Hello! For a team of 50, our Enterprise plan includes dedicated support and CRM sync. Would you like me to book a demo?
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="bg-surface-container rounded-lg rounded-tl-none p-2.5 max-w-[85%]">
                            <p className="text-body-sm font-body-sm">Yes, that sounds perfect. Tomorrow morning works!</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Captured Data Panel */}
                    <div className="hidden md:flex md:col-span-1 bento-card flex-col h-full bg-surface-container-lowest border-outline-variant border-l-4 border-l-tertiary-fixed-dim text-left">
                      <div className="p-3 border-b border-outline-variant bg-surface-container-low shrink-0">
                        <span className="text-label-md font-label-md font-medium">Captured Data</span>
                      </div>
                      <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto">
                        <div className="flex flex-col gap-1">
                          <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Intent</span>
                          <div className="bg-surface-container px-2 py-1 rounded-md w-fit">
                            <span className="text-body-sm font-body-sm font-medium">Sales Inquiry</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Team Size</span>
                          <div className="bg-surface-container px-2 py-1 rounded-md w-fit border border-tertiary-fixed-dim/40">
                            <span className="text-body-sm font-body-sm font-medium">50 employees</span>
                          </div>
                        </div>
                        <div className="mt-auto pt-2 border-t border-outline-variant">
                          <button className="w-full bg-surface-container hover:bg-surface-variant text-on-surface py-2 rounded-md text-label-sm font-label-sm transition-colors flex items-center justify-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Sync to CRM
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Social Proof Section */}
        <section className="py-10 border-y border-outline-variant bg-surface-container-lowest">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
            <p className="text-label-sm md:text-label-md font-label-md text-on-surface-variant mb-6 uppercase tracking-widest">
              Built for businesses that depend on every conversation
            </p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-14 items-center opacity-65 hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-2 text-on-surface font-bold text-headline-md font-headline-md text-[18px] md:text-[22px]">
                <Building2 className="w-6 h-6" /> Acme Corp
              </div>
              <div className="flex items-center gap-2 text-on-surface font-bold text-headline-md font-headline-md text-[18px] md:text-[22px]">
                <Zap className="w-6 h-6" /> Globex
              </div>
              <div className="flex items-center gap-2 text-on-surface font-bold text-headline-md font-headline-md text-[18px] md:text-[22px]">
                <Grid className="w-6 h-6" /> Initech
              </div>
              <div className="flex items-center gap-2 text-on-surface font-bold text-headline-md font-headline-md text-[18px] md:text-[22px] hidden sm:flex">
                <Sparkles className="w-6 h-6" /> Massive
              </div>
              <div className="flex items-center gap-2 text-on-surface font-bold text-headline-md font-headline-md text-[18px] md:text-[22px] hidden md:flex">
                <Activity className="w-6 h-6" /> Soylent
              </div>
            </div>
          </div>
        </section>

        {/* 4. Problem Section */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface mb-4">
              Every missed call is a missed opportunity.
            </h2>
            <p className="text-body-md md:text-body-lg font-body-lg text-on-surface-variant">
              Traditional phone systems and basic voicemails cost you leads and revenue while frustrating your customers.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bento-card p-6 bg-surface-container-lowest border-outline-variant flex flex-col gap-4 group text-left">
              <div className="w-12 h-12 rounded-lg bg-error-container text-on-error-container flex items-center justify-center group-hover:scale-105 transition-transform">
                <PhoneMissed className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-headline-md font-headline-md text-on-surface text-[20px] mb-2">Missed Calls</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Over 60% of callers won&apos;t leave a voicemail and simply call a competitor instead.
                </p>
              </div>
            </div>
            <div className="bento-card p-6 bg-surface-container-lowest border-outline-variant flex flex-col gap-4 group text-left">
              <div className="w-12 h-12 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-headline-md font-headline-md text-on-surface text-[20px] mb-2">Lost Leads</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Valuable contact information slips through the cracks when staff are too busy.
                </p>
              </div>
            </div>
            <div className="bento-card p-6 bg-surface-container-lowest border-outline-variant flex flex-col gap-4 group text-left">
              <div className="w-12 h-12 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center group-hover:scale-105 transition-transform">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-headline-md font-headline-md text-on-surface text-[20px] mb-2">Repetitive Work</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Your team wastes hours answering the same basic questions about hours or pricing.
                </p>
              </div>
            </div>
            <div className="bento-card p-6 bg-surface-container-lowest border-outline-variant flex flex-col gap-4 group text-left">
              <div className="w-12 h-12 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-headline-md font-headline-md text-on-surface text-[20px] mb-2">Slow Follow-up</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Delayed responses reduce conversion rates significantly. Every minute counts in sales.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Solution & Capabilities Section */}
        <section id="features" className="py-16 md:py-24 bg-surface-container-low border-y border-outline-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface mb-4">
                Meet your intelligent voice receptionist
              </h2>
              <p className="text-body-md md:text-body-lg font-body-lg text-on-surface-variant">
                TIOS handles your frontlines, ensuring every caller speaks to a knowledgeable representative instantly. It understands intent and drives action.
              </p>
            </div>

            {/* Feature Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bento-card p-6 bg-surface-container-lowest text-left">
                <Headphones className="w-7 h-7 text-primary mb-4" />
                <h3 className="text-headline-md font-headline-md text-[20px] mb-2">Answers instantly 24/7</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Never put a caller on hold or send them to voicemail again.</p>
              </div>
              <div className="bento-card p-6 bg-surface-container-lowest text-left">
                <MessageSquare className="w-7 h-7 text-primary mb-4" />
                <h3 className="text-headline-md font-headline-md text-[20px] mb-2">Natural conversation</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Speaks fluently, understands context, and handles multi-turn dialogue.</p>
              </div>
              <div className="bento-card p-6 bg-surface-container-lowest text-left">
                <Users className="w-7 h-7 text-primary mb-4" />
                <h3 className="text-headline-md font-headline-md text-[20px] mb-2">Captures information</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Extracts names, phone numbers, email addresses, and caller intent.</p>
              </div>
              <div className="bento-card p-6 bg-surface-container-lowest text-left">
                <Calendar className="w-7 h-7 text-primary mb-4" />
                <h3 className="text-headline-md font-headline-md text-[20px] mb-2">Schedules appointments</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Integrates directly with your calendar to book meetings live.</p>
              </div>
              <div className="bento-card p-6 bg-surface-container-lowest text-left">
                <BookOpen className="w-7 h-7 text-primary mb-4" />
                <h3 className="text-headline-md font-headline-md text-[20px] mb-2">Uses your knowledge</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Answers FAQs based on your specific business documents and website.</p>
              </div>
              <div className="bento-card p-6 bg-surface-container-lowest text-left">
                <GitFork className="w-7 h-7 text-primary mb-4" />
                <h3 className="text-headline-md font-headline-md text-[20px] mb-2">Smart escalation</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Transfers urgent or complex calls to the right human team member.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. How it Works */}
        <section id="how-it-works" className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface mb-4">Up and running in minutes</h2>
            <p className="text-body-md md:text-body-lg font-body-lg text-on-surface-variant">No complex engineering required.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-outline-variant z-0"></div>

            <div className="flex-1 text-center relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-surface-container-lowest border-4 border-background flex items-center justify-center mb-6 premium-shadow">
                <span className="text-headline-md md:text-headline-lg font-headline-lg text-primary font-bold">1</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-[20px] md:text-[22px] mb-2">Connect</h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant max-w-xs">
                Claim your TIOS phone number or forward your existing business lines.
              </p>
            </div>
            <div className="flex-1 text-center relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-surface-container-lowest border-4 border-background flex items-center justify-center mb-6 premium-shadow">
                <span className="text-headline-md md:text-headline-lg font-headline-lg text-primary font-bold">2</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-[20px] md:text-[22px] mb-2">Configure</h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant max-w-xs">
                Upload your FAQs, set availability, and define custom routing rules.
              </p>
            </div>
            <div className="flex-1 text-center relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary border-4 border-background flex items-center justify-center mb-6 premium-shadow">
                <span className="text-headline-md md:text-headline-lg font-headline-lg text-on-primary font-bold">3</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-[20px] md:text-[22px] mb-2">Go Live</h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant max-w-xs">
                Turn on your receptionist and watch it handle calls perfectly from day one.
              </p>
            </div>
          </div>
        </section>

        {/* 7. AI Receptionist Showcase */}
        <section id="receptionists" className="py-16 md:py-24 bg-surface-container-lowest border-y border-outline-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-left">
              <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface mb-6">
                A receptionist that truly understands your business.
              </h2>
              <p className="text-body-md md:text-body-lg font-body-lg text-on-surface-variant mb-6">
                TIOS isn&apos;t a frustrating phone tree. It uses advanced LLMs to engage in free-flowing conversations, gracefully handling interruptions, context switching, and complex inquiries just like a human.
              </p>
              <ul className="flex flex-col gap-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-tertiary-fixed-dim mt-0.5 shrink-0" />
                  <span className="text-body-md font-body-md">Understands strong accents and poor connection quality</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-tertiary-fixed-dim mt-0.5 shrink-0" />
                  <span className="text-body-md font-body-md">Knows when to pause, listen, and respond</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-tertiary-fixed-dim mt-0.5 shrink-0" />
                  <span className="text-body-md font-body-md font-medium">Maintains context even if the caller goes off-topic</span>
                </li>
              </ul>
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="bg-primary text-on-primary px-6 py-3.5 rounded-lg text-label-md font-label-md font-medium hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {isPlayingAudio ? "Pause Demo Audio" : "Hear Sample Call"}
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            {/* Mobile Phone Mockup Visual */}
            <div className="relative w-full max-w-sm mx-auto h-[520px] bg-black rounded-[3rem] p-4 premium-shadow border-4 border-surface-variant">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-xl z-20"></div>
              <div className="w-full h-full bg-surface-container-lowest rounded-[2.5rem] overflow-hidden flex flex-col relative z-10">
                <div className="bg-surface-container-low p-4 text-center border-b border-outline-variant shrink-0 pt-8">
                  <p className="text-label-sm font-label-sm text-on-surface-variant">Ongoing Call</p>
                  <p className="text-headline-md font-headline-md font-semibold text-primary">TIOS Receptionist</p>
                  <p className="text-label-sm font-label-sm text-tertiary-fixed-dim flex items-center justify-center gap-1 mt-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
                    03:42
                  </p>
                </div>
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-background text-left">
                  <div className="flex flex-col gap-1 items-end">
                    <div className="bg-surface-container text-on-surface rounded-2xl rounded-tr-sm p-3 max-w-[85%] text-body-sm font-body-sm">
                      I need to reschedule my plumbing inspection for tomorrow.
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-start">
                    <div className="bg-primary text-on-primary rounded-2xl rounded-tl-sm p-3 max-w-[85%] text-body-sm font-body-sm">
                      I can help with that. Could you provide your address or account phone number?
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <div className="bg-surface-container text-on-surface rounded-2xl rounded-tr-sm p-3 max-w-[85%] text-body-sm font-body-sm">
                      It&apos;s 123 Main St. Actually, can we move it to Thursday?
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-start">
                    <div className="bg-primary text-on-primary rounded-2xl rounded-tl-sm p-3 max-w-[85%] text-body-sm font-body-sm">
                      No problem! I have openings at 9:00 AM or 2:30 PM on Thursday. Which works best?
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-surface-container-low shrink-0 flex justify-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <PhoneOff className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-error flex items-center justify-center text-on-error">
                    <PhoneOff className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <Grid className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Solutions / Industries */}
        <section id="solutions" className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface mb-4">Built for your industry</h2>
            <p className="text-body-md md:text-body-lg font-body-lg text-on-surface-variant">Customizable workflows for specific business needs.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bento-card p-6 flex flex-col gap-3 text-left">
              <HeartPulse className="w-7 h-7 text-primary" />
              <h4 className="text-label-md font-label-md font-bold">Healthcare</h4>
              <p className="text-body-sm font-body-sm text-on-surface-variant">Appointment scheduling, basic triage, and routing.</p>
            </div>
            <div className="bento-card p-6 flex flex-col gap-3 text-left">
              <Building className="w-7 h-7 text-primary" />
              <h4 className="text-label-md font-label-md font-bold">Real Estate</h4>
              <p className="text-body-sm font-body-sm text-on-surface-variant">Property inquiries, showing scheduling, lead qualification.</p>
            </div>
            <div className="bento-card p-6 flex flex-col gap-3 text-left">
              <ShoppingBag className="w-7 h-7 text-primary" />
              <h4 className="text-label-md font-label-md font-bold">Retail &amp; Local</h4>
              <p className="text-body-sm font-body-sm text-on-surface-variant">Hours, inventory checks, directions, and FAQs.</p>
            </div>
            <div className="bento-card p-6 flex flex-col gap-3 text-left">
              <Scale className="w-7 h-7 text-primary" />
              <h4 className="text-label-md font-label-md font-bold">Legal &amp; Services</h4>
              <p className="text-body-sm font-body-sm text-on-surface-variant">Client intake, consultation booking, message taking.</p>
            </div>
          </div>
        </section>

        {/* 9. Integrations Preview */}
        <section className="py-16 md:py-24 bg-surface-container-low border-y border-outline-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
            <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface mb-4">Connects with your tools</h2>
            <p className="text-body-md md:text-body-lg font-body-lg text-on-surface-variant mb-10">TIOS seamlessly integrates into your existing CRMs and calendars.</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <div className="bg-surface-container-lowest px-5 py-3.5 rounded-xl border border-outline-variant flex items-center gap-3 premium-shadow">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium text-body-md">Google Calendar</span>
              </div>
              <div className="bg-surface-container-lowest px-5 py-3.5 rounded-xl border border-outline-variant flex items-center gap-3 premium-shadow">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium text-body-md">Salesforce</span>
              </div>
              <div className="bg-surface-container-lowest px-5 py-3.5 rounded-xl border border-outline-variant flex items-center gap-3 premium-shadow">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-medium text-body-md">HubSpot</span>
              </div>
              <div className="bg-surface-container-lowest px-5 py-3.5 rounded-xl border border-outline-variant flex items-center gap-3 premium-shadow">
                <Code className="w-5 h-5 text-primary" />
                <span className="font-medium text-body-md">Webhooks</span>
              </div>
              <div className="bg-surface-container-lowest px-5 py-3.5 rounded-xl border border-outline-variant flex items-center gap-3 premium-shadow">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="font-medium text-body-md">Slack</span>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Analytics Dashboard Preview */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface mb-4">
              See every conversation. Understand every opportunity.
            </h2>
            <p className="text-body-md md:text-body-lg font-body-lg text-on-surface-variant">
              Review transcripts, listen to recordings, track intent trends, and manage follow-ups from a central dashboard.
            </p>
          </div>
          <div className="bento-card border-outline-variant bg-surface-container-lowest overflow-hidden premium-shadow max-w-4xl mx-auto text-left">
            <div className="h-10 bg-surface-container-low border-b border-outline-variant flex items-center px-4 gap-2 w-full shrink-0">
              <div className="w-3 h-3 rounded-full bg-error/70"></div>
              <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
              <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim/70"></div>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-surface-container p-3.5 rounded-lg">
                  <p className="text-label-sm font-label-sm text-on-surface-variant mb-1">Total Calls</p>
                  <p className="text-headline-md font-headline-md font-bold">1,248</p>
                </div>
                <div className="bg-surface-container p-3.5 rounded-lg">
                  <p className="text-label-sm font-label-sm text-on-surface-variant mb-1">Leads Captured</p>
                  <p className="text-headline-md font-headline-md font-bold text-tertiary-fixed-dim">342</p>
                </div>
                <div className="bg-surface-container p-3.5 rounded-lg">
                  <p className="text-label-sm font-label-sm text-on-surface-variant mb-1">Appointments</p>
                  <p className="text-headline-md font-headline-md font-bold">87</p>
                </div>
                <div className="bg-surface-container p-3.5 rounded-lg">
                  <p className="text-label-sm font-label-sm text-on-surface-variant mb-1">Escalated</p>
                  <p className="text-headline-md font-headline-md font-bold text-error">12</p>
                </div>
              </div>
              <h4 className="text-label-md font-label-md font-bold mb-3">Recent Activity</h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-md border border-outline-variant">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-tertiary-fixed-dim" />
                    <div>
                      <p className="text-body-sm font-body-sm font-medium">+1 (555) 019-2834</p>
                      <p className="text-label-sm font-label-sm text-on-surface-variant">Sales Inquiry • 2 mins ago</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-secondary-container text-on-secondary-fixed rounded text-label-sm font-label-sm font-medium">
                    Lead Captured
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-md border border-outline-variant">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-tertiary-fixed-dim" />
                    <div>
                      <p className="text-body-sm font-body-sm font-medium">Unknown Caller</p>
                      <p className="text-label-sm font-label-sm text-on-surface-variant">General FAQ • 15 mins ago</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-surface-variant text-on-surface-variant rounded text-label-sm font-label-sm">
                    Resolved
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 bg-surface-container-lowest border-y border-outline-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface mb-4">Simple, transparent pricing</h2>
              <p className="text-body-md md:text-body-lg font-body-lg text-on-surface-variant">Pay for usage, not seats. Scale as you grow.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
              {/* Starter Plan */}
              <div className="bento-card p-6 md:p-8 flex flex-col">
                <h3 className="text-headline-md font-headline-md mb-2">Starter</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant mb-6">Perfect for small teams getting started with AI.</p>
                <div className="mb-6">
                  <span className="text-headline-lg md:text-display font-display font-bold">$99</span>
                  <span className="text-body-sm font-body-sm text-on-surface-variant">/mo</span>
                </div>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-body-sm font-body-sm">
                    <Check className="w-4 h-4 text-primary" /> 500 minutes included
                  </li>
                  <li className="flex items-center gap-2 text-body-sm font-body-sm">
                    <Check className="w-4 h-4 text-primary" /> 1 AI Receptionist
                  </li>
                  <li className="flex items-center gap-2 text-body-sm font-body-sm">
                    <Check className="w-4 h-4 text-primary" /> Standard voices &amp; FAQs
                  </li>
                </ul>
                <Link
                  href="/dashboard"
                  className="w-full py-3 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors text-label-md font-label-md font-medium text-center"
                >
                  Get Started
                </Link>
              </div>

              {/* Business Plan (Popular) */}
              <div className="bento-card p-6 md:p-8 flex flex-col border-2 border-primary relative shadow-lg">
                <div className="absolute top-0 right-0 bg-tertiary-fixed-dim text-on-tertiary-fixed px-3 py-1 rounded-bl-lg text-label-sm font-label-sm font-bold tracking-wide">
                  POPULAR
                </div>
                <h3 className="text-headline-md font-headline-md mb-2 mt-1">Business</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant mb-6">For growing businesses with higher call volumes.</p>
                <div className="mb-6">
                  <span className="text-headline-lg md:text-display font-display font-bold">$299</span>
                  <span className="text-body-sm font-body-sm text-on-surface-variant">/mo</span>
                </div>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-body-sm font-body-sm font-medium">
                    <Check className="w-4 h-4 text-primary" /> 2,000 minutes included
                  </li>
                  <li className="flex items-center gap-2 text-body-sm font-body-sm">
                    <Check className="w-4 h-4 text-primary" /> Up to 5 AI Receptionists
                  </li>
                  <li className="flex items-center gap-2 text-body-sm font-body-sm">
                    <Check className="w-4 h-4 text-primary" /> Full CRM Integrations
                  </li>
                  <li className="flex items-center gap-2 text-body-sm font-body-sm">
                    <Check className="w-4 h-4 text-primary" /> Custom knowledge base
                  </li>
                </ul>
                <Link
                  href="/dashboard"
                  className="w-full py-3 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity text-label-md font-label-md font-medium text-center"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div className="bento-card p-6 md:p-8 flex flex-col">
                <h3 className="text-headline-md font-headline-md mb-2">Enterprise</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant mb-6">Custom solutions for large organizations.</p>
                <div className="mb-6">
                  <span className="text-headline-md md:text-headline-lg font-headline-lg font-bold">Custom</span>
                </div>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-body-sm font-body-sm">
                    <Check className="w-4 h-4 text-primary" /> Unlimited volume pricing
                  </li>
                  <li className="flex items-center gap-2 text-body-sm font-body-sm">
                    <Check className="w-4 h-4 text-primary" /> Dedicated success manager
                  </li>
                  <li className="flex items-center gap-2 text-body-sm font-body-sm">
                    <Check className="w-4 h-4 text-primary" /> Custom voice cloning
                  </li>
                  <li className="flex items-center gap-2 text-body-sm font-body-sm">
                    <Check className="w-4 h-4 text-primary" /> Enterprise SLA guarantees
                  </li>
                </ul>
                <a
                  href="mailto:sales@tios.ai"
                  className="w-full py-3 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors text-label-md font-label-md font-medium text-center"
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 12. Final CTA Banner */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
          <h2 className="text-headline-lg-mobile md:text-display font-display text-on-surface mb-6">
            Never miss the next important conversation.
          </h2>
          <p className="text-body-md md:text-body-lg font-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
            Join hundreds of businesses that use TIOS to automate their frontlines, capture more leads, and provide instant 24/7 support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              className="bg-primary text-on-primary px-8 py-4 rounded-lg text-label-md font-label-md font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
              href="/dashboard"
            >
              Create your Receptionist
            </Link>
            <a
              className="bg-surface-container-lowest text-primary border border-outline-variant px-8 py-4 rounded-lg text-label-md font-label-md font-medium hover:bg-surface-container transition-colors w-full sm:w-auto"
              href="#pricing"
            >
              Talk to Sales
            </a>
          </div>
        </section>
      </main>

      {/* 13. Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant py-12 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-left">
          <div className="col-span-2">
            <Link className="text-headline-md font-headline-md font-black text-primary flex items-center gap-2 mb-3" href="#">
              <div className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-geist font-bold text-lg">TIOS</span>
            </Link>
            <p className="text-body-sm font-body-sm text-on-surface-variant max-w-sm">
              © 2026 TIOS AI Inc. All rights reserved. Precision voice automation for the modern enterprise.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <h4 className="text-label-md font-label-md font-bold mb-1">Product</h4>
            <a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#features">
              Features
            </a>
            <a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#receptionists">
              AI Receptionists
            </a>
            <a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#how-it-works">
              How It Works
            </a>
            <a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#pricing">
              Pricing
            </a>
          </div>
          <div className="flex flex-col gap-2.5">
            <h4 className="text-label-md font-label-md font-bold mb-1">Solutions</h4>
            <a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#solutions">
              Healthcare
            </a>
            <a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#solutions">
              Real Estate
            </a>
            <a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#solutions">
              Retail &amp; Legal
            </a>
          </div>
          <div className="flex flex-col gap-2.5">
            <h4 className="text-label-md font-label-md font-bold mb-1">Company</h4>
            <a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Terms of Service
            </a>
            <a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

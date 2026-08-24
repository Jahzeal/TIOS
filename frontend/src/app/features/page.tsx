"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  PhoneCall,
  Bot,
  CheckCircle2,
  Play,
  Pause,
  Users,
  FileText,
  Globe,
  RefreshCw,
  Send,
  TrendingUp,
  Plus,
  Scale,
  GitFork,
  Check,
  Building2,
  Layers,
  ArrowDown,
  Clock,
  User,
  MessageSquare,
  Sparkle,
  PhoneMissed,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  Headset,
  Briefcase,
  CreditCard,
  BookOpen,
  Building,
  ShoppingBag,
  HeartPulse,
} from "lucide-react";

export default function FeaturesPage() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeUserTab, setActiveUserTab] = useState<"users" | "roles" | "branches">("users");

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      {/* TopAppBar Navigation */}
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="text-primary p-1 focus:outline-none hover:opacity-80 transition-opacity"
              aria-label="Toggle navigation drawer"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-headline-md font-headline-md font-bold text-primary tracking-tight">TIOS</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex gap-6 items-center">
            <Link className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md" href="/features">
              Features
            </Link>
            <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-md text-label-md" href="/receptionists">
              Receptionists
            </Link>
            <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-md text-label-md" href="/how-it-works">
              How It Works
            </Link>
            <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-md text-label-md" href="/#solutions">
              Solutions
            </Link>
            <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-md text-label-md" href="/#pricing">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden sm:block font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors px-3 py-2">
              Log In
            </Link>
            <Link href="/dashboard" className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer / Dropdown */}
        {mobileNavOpen && (
          <div className="bg-surface-container-lowest border-b border-outline-variant p-4 flex flex-col gap-2 shadow-xl">
            <div className="font-headline-md text-headline-md font-bold text-primary px-3 py-2">TIOS Platform</div>
            <ul className="flex flex-col gap-1">
              <li>
                <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 bg-secondary-container text-on-secondary-container rounded-lg px-4 py-3 font-label-md text-label-md" href="/features">
                  <Bot className="w-5 h-5" /> Product Features
                </Link>
              </li>
              <li>
                <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 text-on-surface-variant px-4 py-3 font-label-md text-label-md hover:bg-surface-container-high rounded-lg" href="/#solutions">
                  <Briefcase className="w-5 h-5" /> Solutions
                </Link>
              </li>
              <li>
                <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 text-on-surface-variant px-4 py-3 font-label-md text-label-md hover:bg-surface-container-high rounded-lg" href="/#pricing">
                  <CreditCard className="w-5 h-5" /> Pricing
                </Link>
              </li>
              <li>
                <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 text-on-surface-variant px-4 py-3 font-label-md text-label-md hover:bg-surface-container-high rounded-lg" href="/#how-it-works">
                  <BookOpen className="w-5 h-5" /> Resources
                </Link>
              </li>
              <li>
                <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 text-on-surface-variant px-4 py-3 font-label-md text-label-md hover:bg-surface-container-high rounded-lg" href="/dashboard">
                  <User className="w-5 h-5" /> Account Log In
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Main Content Canvas */}
      <main className="w-full pt-16">
        {/* Hero Section */}
        <section className="px-margin-mobile md:px-margin-desktop py-12 md:py-20 flex flex-col items-center text-center gap-4 md:gap-6 bg-surface-container-lowest border-b border-outline-variant">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full border border-outline-variant w-fit mb-2">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
            <span className="text-label-sm font-label-sm text-on-surface-variant font-medium tracking-wide">
              COMPLETE PLATFORM CAPABILITIES
            </span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-display md:text-display font-semibold tracking-tight max-w-4xl mx-auto">
            Everything your business needs to manage every conversation.
          </h1>
          <p className="font-body-md md:font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            TIOS combines enterprise-grade AI reception with powerful business management tools in one elegant platform.
          </p>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 mt-4">
            <Link href="/dashboard" className="w-full sm:w-auto bg-primary text-on-primary font-label-md text-label-md px-6 py-3.5 rounded-lg hover:bg-secondary transition-colors text-center">
              Get Started
            </Link>
            <a href="#demo" className="w-full sm:w-auto bg-surface-container-lowest text-on-surface border border-outline-variant font-label-md text-label-md px-6 py-3.5 rounded-lg hover:bg-surface-container transition-colors text-center">
              Book a Demo
            </a>
          </div>

          {/* Mobile Hero Visual Card */}
          <div className="mt-8 w-full max-w-lg mx-auto relative rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl overflow-hidden text-left">
            <div className="h-8 bg-surface-container-high border-b border-outline-variant flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-error/70"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-outline-variant"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim/70"></div>
              <span className="mx-auto text-xs text-on-surface-variant font-mono">dashboard.tios.ai</span>
            </div>
            <div className="p-4 md:p-6 bg-surface-container-lowest relative space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-fixed flex items-center justify-center">
                    <Bot className="w-4 h-4 text-tertiary-fixed-dim" />
                  </div>
                  <div>
                    <p className="font-label-md text-label-md font-bold">AI Receptionist Active</p>
                    <p className="text-xs text-on-surface-variant">24/7 Live Monitoring</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface p-3 rounded-lg border border-outline-variant">
                  <p className="text-xs text-on-surface-variant">Calls Today</p>
                  <p className="text-lg font-bold">142</p>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-outline-variant">
                  <p className="text-xs text-on-surface-variant">Leads Captured</p>
                  <p className="text-lg font-bold text-tertiary-fixed-dim">38</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Overview (Bento Grid Style) */}
        <section className="px-margin-mobile md:px-margin-desktop py-12 md:py-16 bg-surface flex flex-col gap-6 border-b border-outline-variant">
          <div className="text-left">
            <h2 className="font-headline-lg-mobile md:text-headline-lg font-semibold">Core Platform Capabilities</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">A unified ecosystem for communication and operations.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feature 1 */}
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col gap-2 text-left">
              <div className="w-1 bg-tertiary-container absolute left-0 top-0 bottom-0"></div>
              <Bot className="w-6 h-6 text-tertiary-fixed-dim" />
              <h3 className="font-label-md text-label-md font-semibold mt-1">AI Voice Receptionist</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Intelligent call handling 24/7.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 text-left">
              <PhoneCall className="w-6 h-6 text-primary" />
              <h3 className="font-label-md text-label-md font-semibold mt-1">Call Management</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Complete history and transcripts.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 text-left">
              <Users className="w-6 h-6 text-primary" />
              <h3 className="font-label-md text-label-md font-semibold mt-1">Lead Management</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Automated pipeline progression.</p>
            </div>
            {/* Feature 4 */}
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 text-left">
              <PhoneMissed className="w-6 h-6 text-primary" />
              <h3 className="font-label-md text-label-md font-semibold mt-1">Callback Queue</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Never miss a follow-up request.</p>
            </div>
          </div>
        </section>

        {/* 1. AI Voice Receptionist Deep Dive */}
        <section className="px-margin-mobile md:px-margin-desktop py-16 md:py-24 max-w-container-max mx-auto border-b border-outline-variant">
          <div className="grid md:grid-cols-2 gap-12 items-center text-left">
            <div>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg mb-6">
                Your first line of communication, handled intelligently.
              </h2>
              <p className="font-body-md md:font-body-lg text-body-lg text-on-surface-variant mb-6">
                Never miss a call again. Our AI voice receptionists greet callers naturally, answer questions using your knowledge base, and smartly route or capture leads when you&apos;re unavailable.
              </p>
              <ul className="flex flex-col gap-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="font-body-md text-body-md text-on-surface">Human-like conversational AI that adapts to context.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="font-body-md text-body-md text-on-surface">Available 24/7, with no sick days or breaks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="font-body-md text-body-md text-on-surface">Customizable greetings and fallback behaviors.</span>
                </li>
              </ul>
            </div>

            {/* Simulated Receptionist Interface Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center border-b border-outline-variant pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-fixed flex items-center justify-center">
                    <Headset className="w-5 h-5 text-tertiary-fixed-dim" />
                  </div>
                  <div>
                    <div className="font-label-md text-label-md font-bold">Main Receptionist</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active (Handling 1 Call)
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant relative">
                  <div className="absolute top-4 right-4 animate-pulse w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">Incoming Call • 0:45</div>
                  <div className="font-label-md text-label-md font-bold mb-2">+1 (555) 019-2834</div>
                  <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant text-sm space-y-2">
                    <p><span className="font-bold text-primary">AI:</span> &quot;Hi there, thanks for calling Acme Corp. How can I help you today?&quot;</p>
                    <p><span className="font-bold text-on-surface-variant">Caller:</span> &quot;I&apos;m looking to get a quote for some landscaping work.&quot;</p>
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-label-sm text-label-sm font-medium">Intent Recognized: Lead Capture Pipeline Activated</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Call Management */}
        <section className="bg-surface-container-low py-16 md:py-24 border-b border-outline-variant">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-left">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg mb-4 text-center">
              A complete record of every conversation.
            </h2>
            <p className="font-body-md md:font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto mb-12 text-center">
              Every interaction is logged, transcribed, and analyzed. Easily review past calls, listen to recordings, and understand exactly what was discussed.
            </p>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-0 md:min-h-[460px]">
              {/* Call List */}
              <div className="w-full md:w-2/3 border-r border-outline-variant overflow-y-auto overflow-x-auto">
                <table className="w-full min-w-[500px] text-left border-collapse">
                  <thead className="bg-surface sticky top-0">
                    <tr>
                      <th className="p-4 font-label-sm text-label-sm text-on-surface-variant font-medium border-b border-outline-variant">Caller</th>
                      <th className="p-4 font-label-sm text-label-sm text-on-surface-variant font-medium border-b border-outline-variant">Date</th>
                      <th className="p-4 font-label-sm text-label-sm text-on-surface-variant font-medium border-b border-outline-variant">Duration</th>
                      <th className="p-4 font-label-sm text-label-sm text-on-surface-variant font-medium border-b border-outline-variant">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    <tr className="hover:bg-surface-container-low cursor-pointer transition-colors bg-surface-container">
                      <td className="p-4">
                        <div className="font-label-md text-label-md font-bold">Sarah Jenkins</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">+1 (555) 837-1928</div>
                      </td>
                      <td className="p-4 font-body-sm text-body-sm">Today, 2:15 PM</td>
                      <td className="p-4 font-body-sm text-body-sm">4m 12s</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Lead Captured
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low cursor-pointer transition-colors">
                      <td className="p-4">
                        <div className="font-label-md text-label-md font-bold">Unknown Caller</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">+1 (555) 293-8475</div>
                      </td>
                      <td className="p-4 font-body-sm text-body-sm">Today, 11:30 AM</td>
                      <td className="p-4 font-body-sm text-body-sm">1m 05s</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Question Answered
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low cursor-pointer transition-colors">
                      <td className="p-4">
                        <div className="font-label-md text-label-md font-bold">Mark Thompson</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">+1 (555) 918-2736</div>
                      </td>
                      <td className="p-4 font-body-sm text-body-sm">Yesterday, 4:45 PM</td>
                      <td className="p-4 font-body-sm text-body-sm">2m 30s</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Callback Requested
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Call Details Panel */}
              <div className="w-full md:w-1/3 bg-surface p-6 overflow-y-auto hidden md:block">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-headline-md text-headline-md font-bold">Sarah Jenkins</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">+1 (555) 837-1928</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Lead Captured
                  </span>
                </div>
                <div className="mb-6 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant flex items-center gap-3">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90"
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <div className="flex-grow h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/3"></div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">0:45 / 4:12</span>
                </div>
                <div className="space-y-4">
                  <h4 className="font-label-md text-label-md font-bold uppercase text-on-surface-variant">Transcript</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-surface-container-lowest p-3 rounded-lg rounded-tl-none border border-outline-variant font-body-sm text-body-sm">
                        Hello! Thanks for calling. Are you looking to schedule an appointment or do you have a question?
                      </div>
                    </div>
                    <div className="flex gap-3 flex-row-reverse">
                      <div className="w-6 h-6 rounded-full bg-surface-variant text-on-surface flex items-center justify-center shrink-0 mt-1">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-primary text-on-primary p-3 rounded-lg rounded-tr-none font-body-sm text-body-sm">
                        I need to schedule a consultation for next week.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Leads & Opportunities */}
        <section className="px-margin-mobile md:px-margin-desktop py-16 md:py-24 max-w-container-max mx-auto border-b border-outline-variant text-left">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg mb-4 text-center">
            Turn conversations into opportunities.
          </h2>
          <p className="font-body-md md:font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto mb-12 text-center">
            Visually track potential business generated from calls. Move leads through customizable stages to ensure no opportunity slips through the cracks.
          </p>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6 overflow-x-auto">
            <div className="flex gap-4 min-w-[800px]">
              {/* Column 1 */}
              <div className="flex-1 min-w-[240px] bg-surface p-4 rounded-lg border border-outline-variant">
                <h3 className="font-label-md text-label-md font-bold mb-4 flex justify-between items-center">
                  New <span className="bg-surface-variant px-2 py-0.5 rounded-full text-xs font-normal">2</span>
                </h3>
                <div className="space-y-3">
                  <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant shadow-sm">
                    <div className="font-label-md text-label-md font-bold">Sarah Jenkins</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant mb-2">Consultation requested</div>
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">
                      High Priority
                    </span>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant shadow-sm">
                    <div className="font-label-md text-label-md font-bold">Tom Bradley</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">Pricing inquiry</div>
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="flex-1 min-w-[240px] bg-surface p-4 rounded-lg border border-outline-variant">
                <h3 className="font-label-md text-label-md font-bold mb-4 flex justify-between items-center">
                  Contacted <span className="bg-surface-variant px-2 py-0.5 rounded-full text-xs font-normal">1</span>
                </h3>
                <div className="space-y-3">
                  <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant shadow-sm">
                    <div className="font-label-md text-label-md font-bold">Emily Chen</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant mb-2">Sent brochure</div>
                    <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                      <Clock className="w-3.5 h-3.5" /> Due today
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="flex-1 min-w-[240px] bg-surface p-4 rounded-lg border border-outline-variant">
                <h3 className="font-label-md text-label-md font-bold mb-4 flex justify-between items-center">
                  Qualified <span className="bg-surface-variant px-2 py-0.5 rounded-full text-xs font-normal">0</span>
                </h3>
                <div className="h-24 border-2 border-dashed border-outline-variant rounded flex items-center justify-center text-on-surface-variant text-sm">
                  Drop leads here
                </div>
              </div>

              {/* Column 4 */}
              <div className="flex-1 min-w-[240px] bg-surface p-4 rounded-lg border border-outline-variant opacity-60">
                <h3 className="font-label-md text-label-md font-bold mb-4 flex justify-between items-center">
                  Converted <span className="bg-surface-variant px-2 py-0.5 rounded-full text-xs font-normal">12</span>
                </h3>
                <div className="text-center font-body-sm text-body-sm text-on-surface-variant mt-8">View history</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 & 5. Callbacks & Knowledge Base (Grid) */}
        <section className="bg-surface-container-low py-16 md:py-24 border-b border-outline-variant">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid md:grid-cols-2 gap-12 text-left">
            {/* Callbacks Queue */}
            <div>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg mb-4">
                Never lose track of a requested callback.
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                When the AI can&apos;t resolve an issue, it smartly offers a callback. Manage these requests efficiently from a unified queue.
              </p>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-0 overflow-hidden">
                <div className="p-4 border-b border-outline-variant bg-surface flex justify-between items-center">
                  <span className="font-label-md text-label-md font-bold">Pending Callbacks</span>
                  <span className="bg-error text-on-error px-2.5 py-0.5 rounded-full text-xs font-bold">3 Due</span>
                </div>
                <div className="divide-y divide-outline-variant">
                  <div className="p-4 hover:bg-surface-container-low transition-colors flex justify-between items-center">
                    <div>
                      <div className="font-label-md text-label-md font-bold">Michael Davis</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Issue with recent invoice</div>
                    </div>
                    <button className="border border-outline-variant px-3 py-1.5 rounded text-sm font-medium hover:bg-surface flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5" /> Call Now
                    </button>
                  </div>
                  <div className="p-4 hover:bg-surface-container-low transition-colors flex justify-between items-center">
                    <div>
                      <div className="font-label-md text-label-md font-bold">Lisa Wong</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Needs technical support</div>
                    </div>
                    <button className="border border-outline-variant px-3 py-1.5 rounded text-sm font-medium hover:bg-surface flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5" /> Call Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Base */}
            <div>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg mb-4">
                Give TIOS the information your business already has.
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                Upload documents, link to your website, or add FAQs. The AI instantly learns your business to provide accurate answers to callers.
              </p>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-label-md text-label-md font-bold">Knowledge Sources</span>
                  <button className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Source
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-outline-variant rounded-lg bg-surface">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-on-surface-variant" />
                      <div>
                        <div className="font-label-md text-label-md">Company_Policies_2024.pdf</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">Uploaded 2 days ago</div>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Synced & Active"></span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-outline-variant rounded-lg bg-surface">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-on-surface-variant" />
                      <div>
                        <div className="font-label-md text-label-md">Website Pricing Page</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">acme.com/pricing</div>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Synced & Active"></span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-outline-variant rounded-lg bg-surface opacity-60">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-on-surface-variant animate-spin" />
                      <div>
                        <div className="font-label-md text-label-md">Product_Catalog.csv</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">Syncing...</div>
                      </div>
                    </div>
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6 & 7. SMS & Analytics (Grid) */}
        <section className="px-margin-mobile md:px-margin-desktop py-16 md:py-24 max-w-container-max mx-auto border-b border-outline-variant">
          <div className="grid md:grid-cols-2 gap-12 text-left">
            {/* SMS Simulator */}
            <div>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg mb-4">
                Keep customers informed after the call ends.
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                Automatically send confirmation texts, appointment reminders, or follow-up links right from the platform.
              </p>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col h-[350px]">
                <div className="p-4 border-b border-outline-variant bg-surface flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center font-bold text-sm">
                    JD
                  </div>
                  <div>
                    <div className="font-label-md text-label-md font-bold">John Doe</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">+1 (555) 123-4567</div>
                  </div>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-surface-bright">
                  <div className="flex justify-center">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Today 9:41 AM</span>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-lg rounded-tl-none border border-outline-variant w-3/4 font-body-sm text-body-sm">
                    Hi John, thanks for calling Acme Corp. Here is the link to our pricing guide as requested: acme.com/guide
                  </div>
                  <div className="bg-primary text-on-primary p-3 rounded-lg rounded-tr-none w-3/4 ml-auto font-body-sm text-body-sm">
                    Thanks, I&apos;ll take a look.
                  </div>
                </div>
                <div className="p-4 border-t border-outline-variant bg-surface flex gap-2">
                  <input
                    className="flex-grow rounded-lg border-outline-variant text-sm px-3 py-2 border focus:ring-primary focus:border-primary outline-none"
                    placeholder="Type a message..."
                    type="text"
                  />
                  <button className="bg-primary text-on-primary px-3 rounded-lg flex items-center justify-center hover:opacity-90">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Analytics Overview */}
            <div>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg mb-4">
                Understand what is happening across your calls.
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                Get actionable insights into call volumes, peak times, resolution rates, and generated leads to optimize operations.
              </p>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6 h-[350px] flex flex-col">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-surface rounded-lg border border-outline-variant">
                    <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">Total Calls (30d)</div>
                    <div className="font-headline-lg text-headline-lg font-bold">1,248</div>
                    <div className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" /> 12% vs last mo
                    </div>
                  </div>
                  <div className="p-4 bg-surface rounded-lg border border-outline-variant">
                    <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">Leads Captured</div>
                    <div className="font-headline-lg text-headline-lg font-bold">342</div>
                    <div className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" /> 8% vs last mo
                    </div>
                  </div>
                </div>
                <div className="flex-grow border border-outline-variant rounded-lg bg-surface p-4 flex flex-col justify-end relative overflow-hidden">
                  <span className="absolute top-2 left-3 font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Call Volume by Day
                  </span>
                  <div className="flex items-end justify-between h-3/4 gap-1.5 pt-4">
                    <div className="w-full bg-primary/20 rounded-t h-[40%]"></div>
                    <div className="w-full bg-primary/40 rounded-t h-[60%]"></div>
                    <div className="w-full bg-primary/30 rounded-t h-[50%]"></div>
                    <div className="w-full bg-primary/80 rounded-t h-[90%]"></div>
                    <div className="w-full bg-primary/60 rounded-t h-[70%]"></div>
                    <div className="w-full bg-primary rounded-t h-[100%]"></div>
                    <div className="w-full bg-primary/50 rounded-t h-[45%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Multi-User Business Management */}
        <section className="bg-surface-container-low py-16 md:py-24 border-b border-outline-variant">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg mb-6">
              Built for teams, not just one person.
            </h2>
            <p className="font-body-md md:font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto mb-12">
              Manage multiple users, assign granular permissions, and organize operations across different branches or locations from a single dashboard.
            </p>
            <div className="max-w-4xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden text-left">
              <div className="p-4 border-b border-outline-variant bg-surface flex justify-between items-center">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveUserTab("users")}
                    className={`font-label-md text-label-md pb-1 transition-colors ${
                      activeUserTab === "users" ? "font-bold text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    Users
                  </button>
                  <button
                    onClick={() => setActiveUserTab("roles")}
                    className={`font-label-md text-label-md pb-1 transition-colors ${
                      activeUserTab === "roles" ? "font-bold text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    Roles
                  </button>
                  <button
                    onClick={() => setActiveUserTab("branches")}
                    className={`font-label-md text-label-md pb-1 transition-colors ${
                      activeUserTab === "branches" ? "font-bold text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    Branches
                  </button>
                </div>
                <button className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90">
                  Invite User
                </button>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[550px] text-left border-collapse">
                <thead className="bg-surface-bright">
                  <tr>
                    <th className="p-4 font-label-sm text-label-sm text-on-surface-variant font-medium border-b border-outline-variant">Name</th>
                    <th className="p-4 font-label-sm text-label-sm text-on-surface-variant font-medium border-b border-outline-variant">Role</th>
                    <th className="p-4 font-label-sm text-label-sm text-on-surface-variant font-medium border-b border-outline-variant">Branch</th>
                    <th className="p-4 font-label-sm text-label-sm text-on-surface-variant font-medium border-b border-outline-variant">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  <tr>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-fixed flex items-center justify-center font-bold text-sm">
                        AS
                      </div>
                      <span className="font-label-md text-label-md font-bold">Alice Smith</span>
                    </td>
                    <td className="p-4 text-sm">Admin</td>
                    <td className="p-4 text-sm">Headquarters</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface flex items-center justify-center font-bold text-sm">
                        BJ
                      </div>
                      <span className="font-label-md text-label-md font-bold">Bob Johnson</span>
                    </td>
                    <td className="p-4 text-sm">Staff</td>
                    <td className="p-4 text-sm">Westside Clinic</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

        {/* 9. Everything Connected (Workflow Diagram) */}
        <section className="px-margin-mobile md:px-margin-desktop py-16 md:py-24 max-w-container-max mx-auto border-b border-outline-variant">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg mb-4">Everything Connected</h2>
            <p className="font-body-md md:font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto">
              See how a single incoming call seamlessly flows through the TIOS ecosystem.
            </p>
          </div>
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 relative">
            {/* Connecting Line Background (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-10 right-10 h-1 bg-outline-variant -z-10 -translate-y-1/2"></div>

            {/* Nodes */}
            <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm flex flex-col items-center text-center w-40 z-10">
              <PhoneCall className="w-8 h-8 text-primary mb-2" />
              <span className="font-label-md text-label-md font-bold">Incoming Call</span>
            </div>

            <ArrowDown className="w-6 h-6 text-outline-variant md:hidden" />

            <div className="bg-primary text-on-primary p-4 rounded-xl shadow-md flex flex-col items-center text-center w-48 z-10 transform scale-105">
              <Bot className="w-8 h-8 mb-2 text-tertiary-fixed-dim" />
              <span className="font-label-md text-label-md font-bold">AI Receptionist</span>
              <span className="text-[11px] mt-1 opacity-80">Handles Conversation</span>
            </div>

            <ArrowDown className="w-6 h-6 text-outline-variant md:hidden" />

            <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm flex flex-col items-center text-center w-40 z-10">
              <GitFork className="w-8 h-8 text-primary mb-2" />
              <span className="font-label-md text-label-md font-bold">Decision Engine</span>
            </div>

            <ArrowDown className="w-6 h-6 text-outline-variant md:hidden" />

            <div className="flex flex-col gap-3 z-10 w-full md:w-auto items-center">
              <div className="bg-surface-container-lowest border border-outline-variant p-3 rounded-lg shadow-sm flex items-center gap-2 text-sm w-full md:w-48">
                <Users className="w-4 h-4 text-primary shrink-0" /> Lead Captured
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-3 rounded-lg shadow-sm flex items-center gap-2 text-sm w-full md:w-48">
                <PhoneCall className="w-4 h-4 text-primary shrink-0" /> Callback Scheduled
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-3 rounded-lg shadow-sm flex items-center gap-2 text-sm w-full md:w-48">
                <TrendingUp className="w-4 h-4 text-primary shrink-0" /> Data Logged
              </div>
            </div>
          </div>
        </section>

        {/* 10. Feature Comparison Matrix */}
        <section className="bg-surface-container-low py-16 md:py-24 border-b border-outline-variant">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-left">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg mb-12 text-center">
              How TIOS compares
            </h2>
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[650px] max-w-4xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <thead className="bg-surface border-b border-outline-variant">
                  <tr>
                    <th className="p-6 font-headline-md text-headline-md w-1/4">Feature</th>
                    <th className="p-6 font-label-md text-label-md text-on-surface-variant w-1/4">Traditional Phone System</th>
                    <th className="p-6 font-label-md text-label-md text-on-surface-variant w-1/4">Manual Admin Team</th>
                    <th className="p-6 font-headline-md text-headline-md text-primary bg-primary/5 w-1/4">TIOS Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-sm">
                  <tr>
                    <td className="p-6 font-medium">Availability</td>
                    <td className="p-6 text-on-surface-variant">Business hours only</td>
                    <td className="p-6 text-on-surface-variant">Shifts dependent, sick days</td>
                    <td className="p-6 font-bold bg-primary/5">
                      <span className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> 24/7/365
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-6 font-medium">Call Capacity</td>
                    <td className="p-6 text-on-surface-variant">Limited by lines (busy signals)</td>
                    <td className="p-6 text-on-surface-variant">One call per person</td>
                    <td className="p-6 font-bold bg-primary/5">
                      <span className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> Infinite simultaneous calls
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-6 font-medium">Data Entry</td>
                    <td className="p-6 text-on-surface-variant">None</td>
                    <td className="p-6 text-on-surface-variant">Manual, prone to error</td>
                    <td className="p-6 font-bold bg-primary/5">
                      <span className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> Automatic transcription &amp; CRM entry
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-6 font-medium">Cost</td>
                    <td className="p-6 text-on-surface-variant">Fixed monthly lines</td>
                    <td className="p-6 text-on-surface-variant">High salary + benefits</td>
                    <td className="p-6 font-bold bg-primary/5">
                      <span className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> Predictable SaaS pricing
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-margin-mobile md:px-margin-desktop py-16 md:py-24 max-w-container-max mx-auto text-center">
          <h2 className="font-headline-lg-mobile md:font-display text-display mb-6">
            Ready to transform your operations?
          </h2>
          <p className="font-body-md text-on-surface-variant mb-8 max-w-xl mx-auto">
            Join thousands of businesses using TIOS to automate call intake, capture leads, and streamline team workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3.5 rounded-lg hover:bg-secondary transition-colors w-full sm:w-auto">
              Get Started with TIOS
            </Link>
            <Link href="/#pricing" className="bg-surface-container-lowest text-primary border border-outline-variant font-label-md text-label-md px-6 py-3.5 rounded-lg hover:bg-surface-container-low transition-colors w-full sm:w-auto">
              Book a Demo
            </Link>
          </div>
        </section>
      </main>

      {/* Footer Shared Component */}
      <footer className="bg-surface-container border-t border-outline-variant py-12 px-margin-mobile md:px-margin-desktop w-full">
        <div className="max-w-container-max mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-left">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-geist font-bold text-lg text-primary">TIOS AI</span>
            </Link>
            <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 TIOS AI Inc. All rights reserved.</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider mb-2">Product</span>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/features">
              Features
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/#pricing">
              Pricing
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider mb-2">Solutions</span>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/#solutions">
              Small Business
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/#solutions">
              Enterprise
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider mb-2">Resources</span>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Documentation
            </a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Help Center
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider mb-2">Company</span>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              About Us
            </a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

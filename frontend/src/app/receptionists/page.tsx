"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  PhoneCall,
  Bot,
  Brain,
  MessageSquare,
  Database,
  Zap,
  CheckCircle2,
  Headset,
  Lightbulb,
  Info,
  UserPlus,
  PhoneForwarded,
  Sliders,
  Clock,
  Building2,
  Hotel,
  ShoppingBag,
  Scale,
  Shield,
  Play,
  Pause,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
  FileText,
  PhoneOff,
  User,
  TrendingUp,
  Stethoscope,
  Building,
  Gavel,
  Store,
  Mic,
  ArrowDown,
  PhoneIncoming,
  CalendarCheck,
  Star,
  Settings,
  Briefcase,
  CreditCard,
  BookOpen,
} from "lucide-react";

export default function ReceptionistsPage() {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col selection:bg-secondary-container selection:text-on-secondary-container">
      {/* 1. TopAppBar & Navigation */}
      <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-50 w-full border-b border-outline-variant">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-16 md:h-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden text-on-surface-variant p-2 hover:bg-surface-container-low rounded-lg transition-all focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                <Bot className="w-5 h-5 text-tertiary-fixed-dim" />
              </div>
              <span className="font-headline-lg-mobile text-headline-lg-mobile md:text-headline-md font-bold tracking-tighter text-primary">
                TIOS
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex gap-6 items-center">
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="/features">
              Features
            </Link>
            <Link className="font-label-md text-label-md text-primary border-b-2 border-primary pb-1 cursor-pointer font-bold" href="/receptionists">
              AI Receptionists
            </Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="/how-it-works">
              How It Works
            </Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="/#solutions">
              Solutions
            </Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="/#pricing">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors hidden md:block px-3 py-2">
              Log in
            </Link>
            <Link href="/dashboard" className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
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
            <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-label-md text-label-md font-bold" href="/receptionists">
              <Headset className="w-5 h-5" /> AI Receptionists
            </Link>
            <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl font-label-md text-label-md" href="/#how-it-works">
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

      <main className="flex-grow">
        {/* 2. Hero Section */}
        <section className="py-12 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-surface-container-high text-on-surface-variant px-3.5 py-1 rounded-full font-label-sm text-label-sm mb-6 border border-outline-variant/40 mx-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">Now with GPT-4o Voice Engine</span>
          </div>

          <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:text-5xl md:text-6xl font-bold mb-6 text-on-surface tracking-tight max-w-4xl mx-auto">
            Your Front Desk, Fully Automated.
          </h1>
          <p className="font-body-md text-base md:text-xl text-on-surface-variant mb-8 max-w-3xl mx-auto">
            Deploy intelligent AI voice receptionists that answer calls, book appointments, and capture leads 24/7 with human-like conversation.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-12 max-w-md mx-auto sm:max-w-none">
            <Link href="/dashboard" className="w-full sm:w-auto bg-primary text-on-primary font-label-md text-label-md px-6 py-3.5 rounded-lg hover:opacity-90 transition-opacity font-semibold">
              Build Your Receptionist
            </Link>
            <a href="#templates" className="w-full sm:w-auto bg-surface-container-lowest text-primary border border-outline-variant font-label-md text-label-md px-6 py-3.5 rounded-lg hover:bg-surface-container-low transition-colors font-semibold">
              Book a Demo
            </a>
          </div>

          {/* Dual-State Hero Mockup: Mobile Phone Frame + Desktop Interface Card */}
          <div className="relative max-w-4xl mx-auto rounded-3xl md:rounded-2xl border border-outline-variant/40 shadow-xl overflow-hidden bg-surface-container-lowest text-left p-4 md:p-6">
            {/* Phone Notch (Mobile Visual Indicator) */}
            <div className="w-32 h-5 bg-surface-container rounded-b-xl mx-auto -mt-4 mb-4 hidden sm:block md:hidden"></div>

            <div className="bg-surface rounded-xl p-4 md:p-6 border border-outline-variant/30 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-fixed flex items-center justify-center">
                    <User className="w-5 h-5 text-tertiary-fixed-dim" />
                  </div>
                  <div>
                    <p className="font-label-md text-label-md font-bold">Incoming Call • Active</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">+1 (555) 019-2834</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Live Streaming
                </span>
              </div>

              {/* Chat Bubbles */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-surface-container-low p-3.5 rounded-2xl rounded-tl-sm text-sm border border-outline-variant/20">
                    <span className="font-bold text-primary">Caller:</span> &quot;Hi, I need to schedule a consultation for next Tuesday afternoon.&quot;
                  </div>
                  <div className="bg-primary text-on-primary p-3.5 rounded-2xl rounded-tr-sm text-sm">
                    <span className="font-bold text-tertiary-fixed-dim">AI Receptionist:</span> &quot;I can certainly help with that! We have openings at 2:00 PM and 4:30 PM on Tuesday. Which works best for you?&quot;
                  </div>
                </div>

                {/* Live Extraction Box */}
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 space-y-2">
                  <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">AUTOMATED WORKFLOW ACTION</div>
                  <div className="flex justify-between items-center text-xs p-2 bg-surface rounded border border-outline-variant/20">
                    <span className="text-on-surface-variant">Parsed Intent:</span>
                    <span className="font-bold text-primary">Appointment Booking</span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2 bg-surface rounded border border-outline-variant/20">
                    <span className="text-on-surface-variant">Target Date:</span>
                    <span className="font-bold text-primary">Next Tuesday (Afternoon)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                    <span className="font-medium">Action Triggered:</span>
                    <span className="font-bold">Google Calendar Sync + SMS Confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Workflow Section (Mobile 3-Step Arrow Stack + Desktop 5-Step Stream) */}
        <section className="py-16 md:py-20 bg-surface-container-low px-margin-mobile md:px-margin-desktop border-y border-outline-variant">
          <div className="max-w-container-max mx-auto text-center">
            <div className="mb-10">
              <h2 className="font-headline-md text-2xl md:text-4xl font-bold text-on-surface mb-2">
                More Than Answering Phones
              </h2>
              <p className="font-body-sm md:font-body-md text-body-sm text-on-surface-variant max-w-2xl mx-auto">
                A complete intelligent workflow from first ring to resolution.
              </p>
            </div>

            {/* Mobile Vertical Arrow Stack */}
            <div className="md:hidden flex flex-col gap-3 text-left">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex gap-4 items-start shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                  <PhoneIncoming className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-label-md text-label-md font-bold mb-1">1. Answer Instantly</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Picks up on the first ring, every time, 24/7/365.</p>
                </div>
              </div>

              <div className="flex justify-center text-outline-variant">
                <ArrowDown className="w-5 h-5" />
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex gap-4 items-start shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-label-md text-label-md font-bold mb-1">2. Understand Intent</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Uses advanced NLP to parse complex requests and accents.</p>
                </div>
              </div>

              <div className="flex justify-center text-outline-variant">
                <ArrowDown className="w-5 h-5" />
              </div>

              <div className="bg-surface-container-lowest border-l-4 border-l-primary border-y border-r border-outline-variant/30 rounded-xl p-4 flex gap-4 items-start shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-label-md text-label-md font-bold mb-1">3. Take Action</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Books calendar slots, routes calls, or logs support tickets automatically.</p>
                </div>
              </div>
            </div>

            {/* Desktop 5-Step Stream */}
            <div className="hidden md:grid grid-cols-5 gap-4 text-left">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant text-center flex flex-col items-center">
                <PhoneCall className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-label-md text-base font-bold mb-1">1. Incoming Call</h3>
                <p className="font-body-sm text-xs text-on-surface-variant">Instantly answers without ringing delay.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant text-center flex flex-col items-center">
                <Brain className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-label-md text-base font-bold mb-1">2. Understand</h3>
                <p className="font-body-sm text-xs text-on-surface-variant">Determines caller intent and context.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant text-center flex flex-col items-center">
                <MessageSquare className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-label-md text-base font-bold mb-1">3. Respond</h3>
                <p className="font-body-sm text-xs text-on-surface-variant">Converses naturally to assist the caller.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant text-center flex flex-col items-center">
                <Database className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-label-md text-base font-bold mb-1">4. Capture</h3>
                <p className="font-body-sm text-xs text-on-surface-variant">Extracts vital details structured.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant text-center flex flex-col items-center">
                <Zap className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-label-md text-base font-bold mb-1">5. Action</h3>
                <p className="font-body-sm text-xs text-on-surface-variant">Creates leads, SMS, or transfers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Live Conversation Showcase */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center text-left">
            <div>
              <h2 className="font-headline-lg text-2xl md:text-4xl font-bold mb-6 text-on-surface">
                Conversations that convert into data.
              </h2>
              <p className="font-body-lg text-on-surface-variant mb-8">
                Watch how natural conversation flows are instantly parsed into structured data your business can use immediately.
              </p>
              <ul className="space-y-4 font-body-md text-on-surface-variant">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Real-time transcription and analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Intent recognition and smart routing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Automatic CRM population</span>
                </li>
              </ul>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <div className="text-xs font-label-sm text-on-surface-variant font-bold uppercase tracking-wider mb-2">LIVE TRANSCRIPT</div>
                <div className="bg-surface-container-low p-3 rounded-lg text-sm">
                  <span className="font-semibold">Caller:</span> Hi, I need to book a viewing for 123 Main St.
                </div>
                <div className="bg-primary-container p-3 rounded-lg text-sm text-on-primary-fixed">
                  <span className="font-semibold">AI:</span> I can certainly help with that. What day works best for you?
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg text-sm">
                  <span className="font-semibold">Caller:</span> This Thursday afternoon if possible.
                </div>
              </div>

              <div className="flex-1 space-y-3 border-t sm:border-t-0 sm:border-l border-outline-variant pt-4 sm:pt-0 sm:pl-6">
                <div className="text-xs font-label-sm text-on-surface-variant font-bold uppercase tracking-wider mb-2">EXTRACTED DATA</div>
                <div className="bg-surface-container-lowest border border-outline-variant p-3 rounded-lg text-sm">
                  <div className="text-on-surface-variant text-xs">Intent</div>
                  <div className="font-semibold">Book Viewing</div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant p-3 rounded-lg text-sm">
                  <div className="text-on-surface-variant text-xs">Property</div>
                  <div className="font-semibold">123 Main St</div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant p-3 rounded-lg text-sm">
                  <div className="text-on-surface-variant text-xs">Preferred Time</div>
                  <div className="font-semibold">Thursday Afternoon</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Receptionist Capabilities Grid */}
        <section className="py-16 md:py-20 bg-surface-container-low px-margin-mobile md:px-margin-desktop border-y border-outline-variant">
          <div className="max-w-container-max mx-auto text-center">
            <div className="mb-12">
              <h2 className="font-headline-lg text-2xl md:text-4xl font-bold text-on-surface mb-3">
                Everything you&apos;d expect from a great receptionist.
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-left">
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col items-center text-center">
                <PhoneCall className="w-7 h-7 text-primary mb-3" />
                <h3 className="font-label-md font-bold text-sm">Answer Calls</h3>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col items-center text-center">
                <Lightbulb className="w-7 h-7 text-primary mb-3" />
                <h3 className="font-label-md font-bold text-sm">Understand Requests</h3>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col items-center text-center">
                <Info className="w-7 h-7 text-primary mb-3" />
                <h3 className="font-label-md font-bold text-sm">Provide Info</h3>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col items-center text-center">
                <FileText className="w-7 h-7 text-primary mb-3" />
                <h3 className="font-label-md font-bold text-sm">Capture Details</h3>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col items-center text-center">
                <UserPlus className="w-7 h-7 text-primary mb-3" />
                <h3 className="font-label-md font-bold text-sm">Capture Leads</h3>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col items-center text-center">
                <PhoneCall className="w-7 h-7 text-primary mb-3" />
                <h3 className="font-label-md font-bold text-sm">Handle Callbacks</h3>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col items-center text-center">
                <MessageSquare className="w-7 h-7 text-primary mb-3" />
                <h3 className="font-label-md font-bold text-sm">Send Messages</h3>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col items-center text-center">
                <PhoneForwarded className="w-7 h-7 text-primary mb-3" />
                <h3 className="font-label-md font-bold text-sm">Transfer Calls</h3>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col items-center text-center">
                <Sliders className="w-7 h-7 text-primary mb-3" />
                <h3 className="font-label-md font-bold text-sm">Follow Rules</h3>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col items-center text-center">
                <Clock className="w-7 h-7 text-primary mb-3" />
                <h3 className="font-label-md font-bold text-sm">Work After Hours</h3>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Receptionist Templates */}
        <section id="templates" className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-headline-lg text-2xl md:text-4xl font-bold text-on-surface mb-4">
              Start fast with templates.
            </h2>
            <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">
              Pre-configured setups tailored for your industry.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col items-start hover:shadow-md transition-shadow">
              <div className="bg-secondary-container p-3 rounded-lg mb-4 text-on-secondary-container">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-headline-md text-xl font-bold mb-2">Medical</h3>
              <p className="font-body-sm text-on-surface-variant mb-6 flex-grow">Handles appointment booking, FAQs, and emergency triage.</p>
              <Link href="/dashboard" className="text-primary font-label-md border border-primary px-4 py-2 rounded-lg w-full hover:bg-primary/5 transition-colors text-center">
                Use Template
              </Link>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col items-start hover:shadow-md transition-shadow">
              <div className="bg-secondary-container p-3 rounded-lg mb-4 text-on-secondary-container">
                <Hotel className="w-6 h-6" />
              </div>
              <h3 className="font-headline-md text-xl font-bold mb-2">Hotel</h3>
              <p className="font-body-sm text-on-surface-variant mb-6 flex-grow">Manages reservations, amenity inquiries, and guest services.</p>
              <Link href="/dashboard" className="text-primary font-label-md border border-primary px-4 py-2 rounded-lg w-full hover:bg-primary/5 transition-colors text-center">
                Use Template
              </Link>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col items-start hover:shadow-md transition-shadow">
              <div className="bg-secondary-container p-3 rounded-lg mb-4 text-on-secondary-container">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="font-headline-md text-xl font-bold mb-2">Real Estate</h3>
              <p className="font-body-sm text-on-surface-variant mb-6 flex-grow">Captures lead details, schedules viewings, and answers property questions.</p>
              <Link href="/dashboard" className="text-primary font-label-md border border-primary px-4 py-2 rounded-lg w-full hover:bg-primary/5 transition-colors text-center">
                Use Template
              </Link>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col items-start hover:shadow-md transition-shadow">
              <div className="bg-secondary-container p-3 rounded-lg mb-4 text-on-secondary-container">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="font-headline-md text-xl font-bold mb-2">Retail</h3>
              <p className="font-body-sm text-on-surface-variant mb-6 flex-grow">Handles inventory checks, store hours, and order status.</p>
              <Link href="/dashboard" className="text-primary font-label-md border border-primary px-4 py-2 rounded-lg w-full hover:bg-primary/5 transition-colors text-center">
                Use Template
              </Link>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col items-start hover:shadow-md transition-shadow">
              <div className="bg-secondary-container p-3 rounded-lg mb-4 text-on-secondary-container">
                <Gavel className="w-6 h-6" />
              </div>
              <h3 className="font-headline-md text-xl font-bold mb-2">Legal</h3>
              <p className="font-body-sm text-on-surface-variant mb-6 flex-grow">Intakes new client details, schedules consultations, and routes calls.</p>
              <Link href="/dashboard" className="text-primary font-label-md border border-primary px-4 py-2 rounded-lg w-full hover:bg-primary/5 transition-colors text-center">
                Use Template
              </Link>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col items-start hover:shadow-md transition-shadow">
              <div className="bg-secondary-container p-3 rounded-lg mb-4 text-on-secondary-container">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-headline-md text-xl font-bold mb-2">General Business</h3>
              <p className="font-body-sm text-on-surface-variant mb-6 flex-grow">Standard answering, message taking, and smart routing.</p>
              <Link href="/dashboard" className="text-primary font-label-md border border-primary px-4 py-2 rounded-lg w-full hover:bg-primary/5 transition-colors text-center">
                Use Template
              </Link>
            </div>
          </div>
        </section>

        {/* 7. Make the Receptionist Yours */}
        <section className="py-16 md:py-20 bg-surface-container-low px-margin-mobile md:px-margin-desktop border-y border-outline-variant">
          <div className="max-w-container-max mx-auto text-left">
            <div className="text-center mb-12">
              <h2 className="font-headline-lg text-2xl md:text-4xl font-bold text-on-surface mb-3">
                Make the receptionist yours.
              </h2>
              <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">
                Configure every aspect to match your brand and business needs.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md text-lg font-bold mb-2 border-b border-outline-variant pb-2">Personality</h3>
                <p className="font-body-sm text-on-surface-variant">Set the tone—professional, friendly, or casual.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md text-lg font-bold mb-2 border-b border-outline-variant pb-2">Instructions</h3>
                <p className="font-body-sm text-on-surface-variant">Give specific rules on how to handle different scenarios.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md text-lg font-bold mb-2 border-b border-outline-variant pb-2">Business Info</h3>
                <p className="font-body-sm text-on-surface-variant">Input your hours, location, and key details.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md text-lg font-bold mb-2 border-b border-outline-variant pb-2">Conversation Flow</h3>
                <p className="font-body-sm text-on-surface-variant">Design the ideal path for customer interactions.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md text-lg font-bold mb-2 border-b border-outline-variant pb-2">Knowledge</h3>
                <p className="font-body-sm text-on-surface-variant">Upload FAQs and docs for it to reference.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md text-lg font-bold mb-2 border-b border-outline-variant pb-2">Voice</h3>
                <p className="font-body-sm text-on-surface-variant">Choose the perfect synthetic voice for your brand.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Knowledge-Powered Conversations */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
          <h2 className="font-headline-lg text-2xl md:text-4xl font-bold text-on-surface mb-4">
            Knowledge-powered conversations.
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto mb-10">
            Feed your receptionist your business documents so it always has the right answer.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant">
            <div className="flex flex-col items-center">
              <FileText className="w-10 h-10 text-on-surface-variant mb-2" />
              <span className="font-label-sm">Document / FAQ</span>
            </div>
            <ChevronRight className="w-6 h-6 text-outline-variant hidden md:block" />
            <div className="flex flex-col items-center">
              <Database className="w-10 h-10 text-primary mb-2" />
              <span className="font-label-sm">Knowledge Base</span>
            </div>
            <ChevronRight className="w-6 h-6 text-outline-variant hidden md:block" />
            <div className="flex flex-col items-center">
              <Bot className="w-10 h-10 text-primary mb-2" />
              <span className="font-label-sm">Receptionist</span>
            </div>
            <ChevronRight className="w-6 h-6 text-outline-variant hidden md:block" />
            <div className="flex flex-col items-center">
              <Headset className="w-10 h-10 text-on-surface-variant mb-2" />
              <span className="font-label-sm">Conversation</span>
            </div>
          </div>
        </section>

        {/* 9. Multiple Receptionists */}
        <section className="py-16 md:py-20 bg-surface-container-low px-margin-mobile md:px-margin-desktop border-y border-outline-variant">
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-headline-lg text-2xl md:text-4xl font-bold text-on-surface mb-3">
                Manage multiple receptionists.
              </h2>
              <p className="font-body-md text-on-surface-variant">
                Deploy different AI profiles for different departments or times of day.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md font-bold mb-2">Sales</h3>
                <p className="font-body-sm text-on-surface-variant">Focuses on lead capture and qualification.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md font-bold mb-2">Support</h3>
                <p className="font-body-sm text-on-surface-variant">Handles troubleshooting and ticket creation.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md font-bold mb-2">Booking</h3>
                <p className="font-body-sm text-on-surface-variant">Specializes in scheduling and calendar management.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md font-bold mb-2">After-Hours</h3>
                <p className="font-body-sm text-on-surface-variant">Takes messages and handles emergency routing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Voice & Personality Configurator Form */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center text-left">
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant shadow-sm">
              <h3 className="font-label-md text-lg font-bold mb-6 border-b border-outline-variant pb-2">Voice Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-label-sm text-on-surface-variant mb-1">Voice Selection</label>
                  <select className="w-full border border-outline-variant rounded-md p-2 bg-surface text-sm outline-none focus:ring-1 focus:ring-primary">
                    <option>Sarah - Professional Female</option>
                    <option>James - Warm Male</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm text-on-surface-variant mb-1">Speaking Style</label>
                  <select className="w-full border border-outline-variant rounded-md p-2 bg-surface text-sm outline-none focus:ring-1 focus:ring-primary">
                    <option>Empathetic &amp; Calm</option>
                    <option>Upbeat &amp; Energetic</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm text-on-surface-variant mb-1">Custom Greeting</label>
                  <textarea
                    className="w-full border border-outline-variant rounded-md p-2 bg-surface text-sm outline-none focus:ring-1 focus:ring-primary"
                    rows={2}
                    defaultValue={`"Thank you for calling TIOS. How may I direct your call today?"`}
                  />
                </div>
                <button
                  onClick={() => setIsPlayingVoice(!isPlayingVoice)}
                  className="w-full bg-primary-container text-on-primary-fixed font-label-md py-2.5 rounded-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  {isPlayingVoice ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  {isPlayingVoice ? "Pause Voice Preview" : "Preview Voice"}
                </button>
              </div>
            </div>

            <div>
              <h2 className="font-headline-lg text-2xl md:text-4xl font-bold mb-6 text-on-surface">
                Find the perfect voice.
              </h2>
              <p className="font-body-lg text-on-surface-variant">
                Select from ultra-realistic AI voices and tune their personality to perfectly represent your company culture.
              </p>
            </div>
          </div>
        </section>

        {/* 11. Test Before Going Live */}
        <section className="py-16 md:py-20 bg-surface-container-low px-margin-mobile md:px-margin-desktop border-y border-outline-variant">
          <div className="max-w-container-max mx-auto text-center">
            <h2 className="font-headline-lg text-2xl md:text-4xl font-bold text-on-surface mb-4">
              Test before going live.
            </h2>
            <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto mb-10">
              Use our mock environment to simulate calls and refine instructions before a single real customer calls.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3 text-sm font-label-md">
              <div className="bg-surface-container-lowest px-4 py-2 rounded-full border border-outline-variant">Configure</div>
              <ChevronRight className="w-4 h-4 text-outline-variant" />
              <div className="bg-primary-container text-on-primary-fixed px-4 py-2 rounded-full border border-primary-container font-medium">
                Test Call
              </div>
              <ChevronRight className="w-4 h-4 text-outline-variant" />
              <div className="bg-surface-container-lowest px-4 py-2 rounded-full border border-outline-variant">Review</div>
              <ChevronRight className="w-4 h-4 text-outline-variant" />
              <div className="bg-surface-container-lowest px-4 py-2 rounded-full border border-outline-variant">Adjust</div>
              <ChevronRight className="w-4 h-4 text-outline-variant" />
              <div className="bg-primary text-on-primary px-4 py-2 rounded-full font-medium">Go Live</div>
            </div>
          </div>
        </section>

        {/* 12. From Call to Business Action */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
          <h2 className="font-headline-lg text-2xl md:text-4xl font-bold text-on-surface mb-10">
            From call to business action.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 items-center">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
              <span className="block font-bold mb-1">1. Call</span>
              <span className="text-xs text-on-surface-variant">Customer rings</span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
              <span className="block font-bold mb-1">2. Conversation</span>
              <span className="text-xs text-on-surface-variant">AI chats</span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
              <span className="block font-bold mb-1">3. Intent</span>
              <span className="text-xs text-on-surface-variant">Understands need</span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
              <span className="block font-bold mb-1">4. Info</span>
              <span className="text-xs text-on-surface-variant">Extracts data</span>
            </div>
            <div className="bg-primary-container text-on-primary-fixed p-4 rounded-xl text-center">
              <span className="block font-bold mb-1">5. Action</span>
              <span className="text-xs">Triggers workflow</span>
            </div>
          </div>
        </section>

        {/* 13. Industry Examples Grid */}
        <section className="py-16 md:py-20 bg-surface-container-low px-margin-mobile md:px-margin-desktop border-y border-outline-variant">
          <div className="max-w-container-max mx-auto text-left">
            <h2 className="font-headline-lg text-2xl md:text-4xl font-bold text-on-surface mb-10 text-center">
              Built for your industry.
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md text-lg font-bold mb-2">Healthcare</h3>
                <p className="font-body-sm text-on-surface-variant">Patient scheduling, prescription refill requests, and clinic FAQs.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md text-lg font-bold mb-2">Real Estate</h3>
                <p className="font-body-sm text-on-surface-variant">Lead qualification, showing scheduling, and property information.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md text-lg font-bold mb-2">Hotel</h3>
                <p className="font-body-sm text-on-surface-variant">Booking management, room service requests, and amenity details.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md text-lg font-bold mb-2">Retail</h3>
                <p className="font-body-sm text-on-surface-variant">Order status checks, return policies, and stock inquiries.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h3 className="font-label-md text-lg font-bold mb-2">Professional Services</h3>
                <p className="font-body-sm text-on-surface-variant">Consultation booking, basic triage, and routing to specialists.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 14. Security & Control */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <Shield className="w-12 h-12 text-primary mb-4" />
            <h2 className="font-headline-lg text-2xl md:text-4xl font-bold text-on-surface mb-4">Security and Control</h2>
            <p className="font-body-md text-on-surface-variant">
              Your AI receptionist operates strictly within the constraints you define. It only uses approved knowledge bases and follows explicit conversational guardrails to ensure brand safety and data privacy.
            </p>
          </div>
        </section>

        {/* 15. Final Mobile & Desktop Banner CTA */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop text-center bg-primary-container text-on-primary-fixed relative overflow-hidden">
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="font-headline-md sm:font-display text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
              Ready to hire your AI Receptionist?
            </h2>
            <p className="font-body-sm md:font-body-md text-body-sm opacity-90 mb-8 max-w-xl mx-auto">
              Setup takes less than 5 minutes. Try it risk-free today. No credit card required for setup.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/dashboard" className="w-full sm:w-auto bg-primary text-on-primary font-label-md text-label-md px-8 py-4 rounded-lg hover:opacity-90 transition-opacity font-bold">
                Start Free Trial
              </Link>
              <Link href="/#pricing" className="w-full sm:w-auto bg-transparent text-on-primary-fixed border border-on-primary-fixed font-label-md text-label-md px-8 py-4 rounded-lg hover:bg-white/10 transition-colors font-bold">
                Book a Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 16. Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant w-full py-12 px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-container-max mx-auto text-left">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-headline-md font-bold text-primary text-lg">TIOS</span>
            </Link>
            <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 TIOS AI Inc. All rights reserved.</p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-label-md font-bold text-on-surface mb-2">Product</h4>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/features">
              Features
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/receptionists">
              AI Receptionists
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/#pricing">
              Pricing
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-label-md font-bold text-on-surface mb-2">Solutions</h4>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/#solutions">
              Healthcare
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/#solutions">
              Real Estate
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-label-md font-bold text-on-surface mb-2">Resources</h4>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Help Center
            </a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Documentation
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-label-md font-bold text-on-surface mb-2">Company</h4>
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

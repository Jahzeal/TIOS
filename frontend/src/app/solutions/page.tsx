"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  PhoneCall,
  Bot,
  Brain,
  User,
  ClipboardCheck,
  PhoneMissed,
  Stethoscope,
  Hotel,
  Building,
  Store,
  Briefcase,
  Gavel,
  Building2,
  CheckCircle2,
  ChevronRight,
  Star,
  Headset,
  Settings,
  CreditCard,
  Menu,
  X,
  ArrowRight,
  Shield,
  HelpCircle,
  PhoneIncoming,
  CheckCheck,
  Lock,
  Mic,
  BarChart3,
  BookOpen,
  Utensils,
  Luggage,
  Globe,
  Home,
  Check,
  Layers,
} from "lucide-react";

export default function SolutionsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const tabs = [
    { id: "all", label: "All Industries", icon: Sparkles },
    { id: "healthcare", label: "Healthcare", icon: Stethoscope },
    { id: "hospitality", label: "Hospitality", icon: Hotel },
    { id: "realestate", label: "Real Estate", icon: Building },
    { id: "retail", label: "Retail", icon: Store },
    { id: "services", label: "Professional Services", icon: Briefcase },
    { id: "legal", label: "Legal", icon: Gavel },
    { id: "general", label: "General Business", icon: Building2 },
  ];

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col selection:bg-primary selection:text-on-primary">
      {/* 1. Top Navigation Bar */}
      <header className="bg-surface-container-lowest sticky top-0 z-50 w-full border-b border-outline-variant">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden text-on-surface-variant p-2 hover:bg-surface-container-low rounded-lg transition-all focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-headline-md font-headline-md font-bold text-on-surface tracking-tight">Fluture</span>
            </Link>
          </div>

          <nav className="hidden md:flex gap-6 items-center text-label-md font-label-md">
            <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="/features">
              Features
            </Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="/receptionists">
              AI Receptionists
            </Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="/how-it-works">
              How It Works
            </Link>
            <Link className="text-primary border-b-2 border-primary pb-1 font-bold transition-colors duration-200" href="/solutions">
              Solutions
            </Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="/pricing">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-4 text-label-md font-label-md">
            <Link className="text-on-surface hover:text-primary transition-colors hidden md:block" href="/dashboard">
              Log in
            </Link>
            <Link className="bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-on-surface transition-colors" href="/dashboard">
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
            <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl font-label-md text-label-md" href="/how-it-works">
              <Settings className="w-5 h-5" /> How It Works
            </Link>
            <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-label-md text-label-md font-bold" href="/solutions">
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
      <main className="flex-grow flex flex-col">
        {/* 2. Hero Section */}
        <section className="w-full px-margin-mobile md:px-margin-desktop py-12 md:py-24 max-w-container-max mx-auto text-center flex flex-col items-center">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 font-bold">
            Industry Solutions
          </span>
          <h1 className="text-display font-display text-on-surface max-w-4xl mb-6 text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Built around the way your business works.
          </h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mb-10">
            Every business receives different calls. TIOS gives you the tools to configure an AI voice receptionist around your customers, your information, and your workflow.
          </p>

          {/* Hero Visual Mockup Box */}
          <div className="relative w-full max-w-5xl bg-surface-container-low rounded-xl border border-outline-variant p-6 md:p-10 shadow-sm overflow-hidden text-left">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              {/* Inputs */}
              <div className="flex flex-col gap-3 w-full md:w-64">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                  <Stethoscope className="w-5 h-5 text-secondary shrink-0" />
                  <span className="font-label-md text-label-md font-medium">Healthcare Intake</span>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                  <Hotel className="w-5 h-5 text-secondary shrink-0" />
                  <span className="font-label-md text-label-md font-medium">Concierge Inquiries</span>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                  <Building className="w-5 h-5 text-secondary shrink-0" />
                  <span className="font-label-md text-label-md font-medium">Real Estate Buyer Lead</span>
                </div>
              </div>

              {/* Central Core */}
              <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg relative z-20 shrink-0 my-4 md:my-0">
                <span className="font-display text-2xl font-bold tracking-tight">TIOS</span>
              </div>

              {/* Outputs */}
              <div className="flex flex-col gap-3 w-full md:w-64">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                  <ClipboardCheck className="w-5 h-5 text-secondary shrink-0" />
                  <span className="font-label-md text-label-md font-medium">Lead Created</span>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                  <PhoneMissed className="w-5 h-5 text-secondary shrink-0" />
                  <span className="font-label-md text-label-md font-medium">Callback Requested</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Sticky Horizontally Scrollable Industry Filter Bar */}
        <div className="w-full px-margin-mobile md:px-margin-desktop sticky top-[64px] md:top-[72px] bg-surface-container-lowest/90 backdrop-blur-md z-40 border-b border-outline-variant overflow-x-auto whitespace-nowrap scrollbar-none py-3 max-w-container-max mx-auto flex items-center gap-3">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-colors border ${
                  isActive
                    ? "bg-primary text-on-primary border-primary font-bold"
                    : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border-outline-variant"
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 4. Industry Sections (Stacked Cards + Tab Deep Dives) */}
        <section className="w-full px-margin-mobile md:px-margin-desktop py-12 max-w-container-max mx-auto space-y-12">
          {/* Healthcare & Clinics */}
          {(activeTab === "all" || activeTab === "healthcare") && (
            <div className="flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-primary shrink-0" />
                <h2 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface">Healthcare &amp; Clinics</h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Secure, HIPAA-compliant appointment scheduling and patient triage. Handles high call volumes during peak hours without putting patients on hold.
              </p>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-tertiary-fixed-dim"></div>
                <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                  <span className="font-label-md text-label-md font-bold text-on-surface">Triage &amp; Booking</span>
                  <span className="px-2.5 py-0.5 bg-surface-container-high rounded text-xs font-bold text-on-surface-variant">HIPAA</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-on-secondary-container" />
                    </div>
                    <div className="bg-surface p-3 rounded-lg border border-outline-variant flex-grow text-sm">
                      &quot;Are you an existing patient, or is this your first visit to our clinic?&quot;
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center">
                      <User className="w-4 h-4 text-on-surface" />
                    </div>
                    <div className="bg-primary text-on-primary p-3 rounded-lg flex-grow text-right text-sm">
                      &quot;Existing patient. I need to reschedule my consultation with Dr. Smith.&quot;
                    </div>
                  </div>
                </div>
                <Link href="/dashboard" className="w-full mt-2 py-2.5 border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface transition-colors flex justify-center items-center gap-2 font-semibold">
                  Deploy Healthcare Workflow <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Hospitality */}
          {(activeTab === "all" || activeTab === "hospitality") && (
            <div className="flex flex-col gap-4 text-left pt-6 border-t border-outline-variant">
              <div className="flex items-center gap-2">
                <Hotel className="w-6 h-6 text-primary shrink-0" />
                <h2 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface">Hospitality</h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Manage reservations, room service requests, and common inquiries 24/7. Provide a premium, multi-lingual concierge experience for guests.
              </p>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary"></div>
                <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                  <span className="font-label-md text-label-md font-bold text-on-surface">Concierge Desk</span>
                  <span className="px-2.5 py-0.5 bg-surface-container-high rounded text-xs font-bold text-on-surface-variant">24/7 Concierge</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="border border-outline-variant rounded-lg p-3 flex flex-col items-center text-center gap-1 bg-surface">
                    <BookOpen className="w-5 h-5 text-on-surface-variant" />
                    <span className="font-label-sm text-xs text-on-surface font-semibold">Reservations</span>
                  </div>
                  <div className="border border-outline-variant rounded-lg p-3 flex flex-col items-center text-center gap-1 bg-surface">
                    <Utensils className="w-5 h-5 text-on-surface-variant" />
                    <span className="font-label-sm text-xs text-on-surface font-semibold">Room Service</span>
                  </div>
                  <div className="border border-outline-variant rounded-lg p-3 flex flex-col items-center text-center gap-1 bg-surface">
                    <Luggage className="w-5 h-5 text-on-surface-variant" />
                    <span className="font-label-sm text-xs text-on-surface font-semibold">Check-in Info</span>
                  </div>
                  <div className="border border-outline-variant rounded-lg p-3 flex flex-col items-center text-center gap-1 bg-surface">
                    <Globe className="w-5 h-5 text-on-surface-variant" />
                    <span className="font-label-sm text-xs text-on-surface font-semibold">Multilingual</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Real Estate */}
          {(activeTab === "all" || activeTab === "realestate") && (
            <div className="flex flex-col gap-4 text-left pt-6 border-t border-outline-variant">
              <div className="flex items-center gap-2">
                <Building className="w-6 h-6 text-primary shrink-0" />
                <h2 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface">Real Estate</h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Never miss a buyer lead. Instantly qualify buyers, schedule property viewings, and answer FAQs about listings while agents are in the field.
              </p>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
                <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                  <span className="font-label-md text-label-md font-bold text-on-surface">Lead Capture &amp; Scheduling</span>
                  <span className="px-2.5 py-0.5 bg-surface-container-high rounded text-xs font-bold text-on-surface-variant">CRM Sync</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center p-2.5 rounded bg-surface border border-outline-variant text-sm">
                    <span className="text-on-surface-variant">Caller Intent</span>
                    <span className="font-bold text-on-surface">Property Purchase / Buying</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded bg-surface border border-outline-variant text-sm">
                    <span className="text-on-surface-variant">Target Property</span>
                    <span className="font-bold text-on-surface">Listing #TX-4921</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded bg-surface border border-outline-variant text-sm">
                    <span className="text-on-surface-variant">Viewing Time</span>
                    <span className="font-bold text-on-surface">Tomorrow, 2:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Retail */}
          {(activeTab === "all" || activeTab === "retail") && (
            <div className="flex flex-col gap-4 text-left pt-6 border-t border-outline-variant">
              <div className="flex items-center gap-2">
                <Store className="w-6 h-6 text-primary shrink-0" />
                <h2 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface">Retail &amp; E-Commerce</h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Check stock availability, verify store hours, and resolve order tracking inquiries without taking floor staff away from customers.
              </p>
            </div>
          )}

          {/* Professional Services */}
          {(activeTab === "all" || activeTab === "services") && (
            <div className="flex flex-col gap-4 text-left pt-6 border-t border-outline-variant">
              <div className="flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-primary shrink-0" />
                <h2 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface">Professional Services</h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Screen new consultation inquiries, intake project scope, and route high-value prospective clients to senior consultants.
              </p>
            </div>
          )}

          {/* Legal */}
          {(activeTab === "all" || activeTab === "legal") && (
            <div className="flex flex-col gap-4 text-left pt-6 border-t border-outline-variant">
              <div className="flex items-center gap-2">
                <Gavel className="w-6 h-6 text-primary shrink-0" />
                <h2 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface">Legal Practices</h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Confidential case intake, practice area screening, and attorney consultation scheduling with strict privacy guardrails.
              </p>
            </div>
          )}
        </section>

        {/* 5. Vertical Pipeline Node Stream */}
        <section className="px-margin-mobile md:px-margin-desktop py-16 bg-surface-container-low border-y border-outline-variant flex flex-col gap-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">One Platform, Different Workflows</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">How TIOS adapts to specific caller intent dynamically.</p>
          </div>
          <div className="flex flex-col gap-0 relative max-w-2xl mx-auto text-left">
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-outline-variant"></div>

            {/* Node 1 */}
            <div className="flex items-start gap-4 relative z-10 py-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center flex-shrink-0 shadow-sm">
                <PhoneIncoming className="w-5 h-5 text-primary" />
              </div>
              <div className="pt-1">
                <h3 className="font-label-md text-label-md text-on-surface font-bold">1. Call Inbound</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Customer dials your dedicated business phone line.</p>
              </div>
            </div>

            {/* Node 2 */}
            <div className="flex items-start gap-4 relative z-10 py-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center flex-shrink-0 shadow-sm">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div className="pt-1">
                <h3 className="font-label-md text-label-md text-on-surface font-bold">2. Intent Detection</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">AI identifies if the caller wants to book, cancel, or ask a question based on industry templates.</p>
              </div>
            </div>

            {/* Node 3 */}
            <div className="flex items-start gap-4 relative z-10 py-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                <CheckCheck className="w-5 h-5 text-on-primary" />
              </div>
              <div className="pt-1">
                <h3 className="font-label-md text-label-md text-on-surface font-bold">3. Action Executed</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Data is formatted and pushed directly to your specific CRM or scheduling tool.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Onboarding Templates Section */}
        <section className="px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto text-left">
          <div className="mb-8">
            <h2 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">Start with Industry Templates</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Deploy pre-configured AI receptionists in minutes.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Template Card 1 */}
            <div className="border border-outline-variant rounded-xl p-6 flex flex-col gap-4 bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-bold text-lg">Dental Clinic Base</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Includes common procedures, insurance FAQ, and appointment booking integration.</span>
                </div>
                <Stethoscope className="w-6 h-6 text-on-surface-variant shrink-0" />
              </div>
              <Link href="/dashboard" className="w-full py-2.5 bg-surface border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:border-primary transition-colors text-center font-semibold">
                Use Template
              </Link>
            </div>

            {/* Template Card 2 */}
            <div className="border border-outline-variant rounded-xl p-6 flex flex-col gap-4 bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-bold text-lg">Boutique Hotel Base</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Concierge persona, late check-in handling, and property management sync.</span>
                </div>
                <Hotel className="w-6 h-6 text-on-surface-variant shrink-0" />
              </div>
              <Link href="/dashboard" className="w-full py-2.5 bg-surface border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:border-primary transition-colors text-center font-semibold">
                Use Template
              </Link>
            </div>
          </div>
        </section>

        {/* 7. Core Capabilities Grid */}
        <section className="px-margin-mobile md:px-margin-desktop py-16 bg-surface-container-lowest border-t border-outline-variant">
          <div className="max-w-container-max mx-auto text-left">
            <h2 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface mb-8 text-center">Core Platform Capabilities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border border-outline-variant rounded-xl p-5 flex flex-col gap-3 bg-surface">
                <Layers className="w-6 h-6 text-primary" />
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface font-bold">Deep Integrations</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Connects natively to industry-standard tools via REST API and Webhooks.</p>
                </div>
              </div>
              <div className="border border-outline-variant rounded-xl p-5 flex flex-col gap-3 bg-surface">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface font-bold">Enterprise Security</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">End-to-end encryption, SOC2 compliance, and strict data retention policies.</p>
                </div>
              </div>
              <div className="border border-outline-variant rounded-xl p-5 flex flex-col gap-3 bg-surface">
                <Mic className="w-6 h-6 text-primary" />
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface font-bold">Custom Voices</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Select from ultra-realistic AI voice profiles tailored to your brand persona.</p>
                </div>
              </div>
              <div className="border border-outline-variant rounded-xl p-5 flex flex-col gap-3 bg-surface">
                <BarChart3 className="w-6 h-6 text-primary" />
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface font-bold">Call Analytics</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Transcripts, sentiment analysis, and call volume reporting dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Final Action CTA Banner */}
        <section className="w-full px-margin-mobile md:px-margin-desktop py-20 md:py-24 max-w-container-max mx-auto text-center border-t border-outline-variant bg-surface-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-headline-lg md:font-display text-2xl sm:text-4xl md:text-5xl font-bold text-on-surface mb-6">
              Your business has its own way of working. TIOS adapts to it.
            </h2>
            <p className="text-body-md text-on-surface-variant mb-8 max-w-xl mx-auto">
              Start configuring your industry-tailored AI receptionist today in under 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/dashboard" className="bg-primary text-on-primary px-8 py-4 rounded-lg font-label-md text-label-md hover:bg-on-surface transition-colors font-bold">
                Start Configuring
              </Link>
              <Link href="/#pricing" className="bg-surface-container-lowest border border-outline-variant text-on-surface px-8 py-4 rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors font-bold">
                Book a Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant w-full py-12 px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-container-max mx-auto text-left">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-headline-md text-headline-md font-bold text-on-surface">TIOS</span>
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
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/how-it-works">
              How It Works
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-label-md font-bold text-on-surface mb-2">Solutions</h4>
            <Link className="font-body-sm text-body-sm text-primary font-bold hover:text-primary transition-colors" href="/solutions">
              Healthcare
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/solutions">
              Real Estate
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/solutions">
              Hospitality
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

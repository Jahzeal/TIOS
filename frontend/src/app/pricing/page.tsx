"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Check,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Headset,
  Settings,
  Briefcase,
  CreditCard,
  User,
  Shield,
  PhoneCall,
  HelpCircle,
  Building2,
  ArrowRight,
} from "lucide-react";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("ai-capabilities");

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

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
            <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="/solutions">
              Solutions
            </Link>
            <Link className="text-primary border-b-2 border-primary pb-1 font-bold transition-colors duration-200" href="/pricing">
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
            <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl font-label-md text-label-md" href="/solutions">
              <Briefcase className="w-5 h-5" /> Solutions
            </Link>
            <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-label-md text-label-md font-bold" href="/pricing">
              <CreditCard className="w-5 h-5" /> Pricing
            </Link>
            <Link onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3 text-primary font-bold hover:bg-surface-container rounded-xl font-label-md text-label-md" href="/dashboard">
              <User className="w-5 h-5" /> Account Log In
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-20 w-full">
        {/* 2. Hero Section & Billing Toggle */}
        <section className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-primary mb-6 tracking-tight">
            Plans that fit the way you use TIOS.
          </h1>
          <p className="font-body-lg text-base md:text-xl text-on-surface-variant mb-10">
            Whether you&apos;re just starting to automate calls or managing a complex multi-branch operation, we have a plan to match your business needs.
          </p>

          {/* Interactive Billing Toggle */}
          <div className="inline-flex items-center justify-center gap-4 bg-surface-container-low p-1.5 rounded-full border border-outline-variant shadow-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full font-label-md text-label-md transition-all ${
                !isAnnual
                  ? "bg-surface-container-lowest text-primary shadow-sm font-bold border border-outline-variant"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full font-label-md text-label-md transition-all flex items-center gap-2 ${
                isAnnual
                  ? "bg-primary text-on-primary shadow-sm font-bold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Annually
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                isAnnual ? "bg-tertiary-fixed-dim text-on-tertiary-fixed" : "bg-emerald-100 text-emerald-800"
              }`}>
                Save 20%
              </span>
            </button>
          </div>
        </section>

        {/* 3. Pricing Cards Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-stretch text-left">
          {/* Starter Plan */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-headline-md text-2xl font-bold text-primary mb-2">Starter</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 h-10">
              For small teams getting started with intelligent AI phone automation.
            </p>
            <div className="mb-6 border-b border-outline-variant pb-6 flex items-baseline gap-1">
              <span className="font-display text-4xl md:text-5xl font-bold text-primary">
                {isAnnual ? "₦39,000" : "₦49,000"}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-on-surface">1,000 AI Call Interactions included</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-on-surface">1 Dedicated AI Voice Receptionist</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-on-surface">Standard industry templates &amp; config</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-on-surface">Call history &amp; standard transcripts</span>
              </li>
            </ul>
            <Link
              href="/dashboard"
              className="w-full bg-surface-container-lowest border border-outline text-primary font-label-md text-label-md py-3 rounded-lg hover:bg-surface-container-low transition-colors text-center font-bold"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Business Plan (Most Popular) */}
          <div className="bg-surface-container-lowest border-2 border-primary rounded-xl p-8 flex flex-col h-full relative shadow-lg">
            <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-primary text-on-primary font-label-sm text-xs px-4 py-1 rounded-full uppercase tracking-wider font-bold">
              Most Popular
            </div>
            <h3 className="font-headline-md text-2xl font-bold text-primary mb-2 flex items-center justify-between">
              <span>Business</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 h-10">
              For growing businesses that need higher call volume, custom knowledge, and CRM workflows.
            </p>
            <div className="mb-6 border-b border-outline-variant pb-6 flex items-baseline gap-1">
              <span className="font-display text-4xl md:text-5xl font-bold text-primary">
                {isAnnual ? "₦119,000" : "₦149,000"}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-on-surface font-semibold">10,000 AI Call Interactions included</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-on-surface">Up to 3 AI Voice Receptionists</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-on-surface">Custom voice configuration &amp; knowledge base</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-on-surface">Lead capture &amp; automatic follow-up SMS</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-on-surface">Advanced sentiment &amp; usage analytics</span>
              </li>
            </ul>
            <Link
              href="/dashboard"
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:opacity-90 transition-opacity text-center font-bold shadow-md"
            >
              Get Business
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-headline-md text-2xl font-bold text-primary mb-2">Enterprise</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 h-10">
              For larger organizations requiring multi-location routing and custom API integrations.
            </p>
            <div className="mb-6 border-b border-outline-variant pb-6 flex items-baseline gap-1">
              <span className="font-display text-4xl md:text-5xl font-bold text-primary">Custom</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">pricing</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-on-surface">Unlimited call volume &amp; minutes</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-on-surface">Unlimited AI Voice Receptionists</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-on-surface">Multi-branch / multi-location management</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-on-surface">Dedicated account manager &amp; 24/7 SLA</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-on-surface">Custom API &amp; Webhook integrations</span>
              </li>
            </ul>
            <a
              href="#contact"
              className="w-full bg-surface-container-lowest border border-outline text-primary font-label-md text-label-md py-3 rounded-lg hover:bg-surface-container-low transition-colors text-center font-bold"
            >
              Contact Sales
            </a>
          </div>
        </section>

        {/* 4. Expandable Feature Comparison Section */}
        <section className="mb-20 text-left">
          <h2 className="font-headline-lg text-2xl md:text-4xl font-bold text-on-surface mb-8 text-center">
            Compare Feature Capabilities
          </h2>

          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Accordion 1: AI Capabilities */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion("ai-capabilities")}
                className="w-full flex justify-between items-center p-5 bg-surface-container-low font-bold text-left text-on-surface"
              >
                <span>AI Capabilities &amp; Interactions</span>
                {openAccordion === "ai-capabilities" ? (
                  <ChevronUp className="w-5 h-5 text-on-surface-variant" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-on-surface-variant" />
                )}
              </button>

              {openAccordion === "ai-capabilities" && (
                <div className="p-6 space-y-4 border-t border-outline-variant">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3 border-b border-outline-variant">
                    <span className="font-bold text-sm text-on-surface">Monthly Interactions</span>
                    <span className="text-sm text-on-surface-variant">Starter: 1,000</span>
                    <span className="text-sm font-bold text-primary">Business: 10,000</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3 border-b border-outline-variant">
                    <span className="font-bold text-sm text-on-surface">Custom Knowledge Sync</span>
                    <span className="text-sm text-on-surface-variant">Basic FAQs</span>
                    <span className="text-sm font-bold text-primary">Full Document &amp; Web Scraping</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <span className="font-bold text-sm text-on-surface">Voice Customization</span>
                    <span className="text-sm text-on-surface-variant">Standard Profiles</span>
                    <span className="text-sm font-bold text-primary">Custom Brand Persona</span>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Support & Security */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion("support-security")}
                className="w-full flex justify-between items-center p-5 bg-surface-container-low font-bold text-left text-on-surface"
              >
                <span>Support, SLA &amp; Security</span>
                {openAccordion === "support-security" ? (
                  <ChevronUp className="w-5 h-5 text-on-surface-variant" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-on-surface-variant" />
                )}
              </button>

              {openAccordion === "support-security" && (
                <div className="p-6 space-y-4 border-t border-outline-variant">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3 border-b border-outline-variant">
                    <span className="font-bold text-sm text-on-surface">Support Level</span>
                    <span className="text-sm text-on-surface-variant">Standard Email</span>
                    <span className="text-sm font-bold text-primary">Priority 24/7</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <span className="font-bold text-sm text-on-surface">Security &amp; Compliance</span>
                    <span className="text-sm text-on-surface-variant">Standard SSL</span>
                    <span className="text-sm font-bold text-primary">SOC2 &amp; HIPAA Compliant</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. Call to Action Section */}
        <section id="contact" className="bg-surface-container-low rounded-xl p-8 md:p-14 text-center border border-outline-variant shadow-sm">
          <h2 className="font-headline-lg text-2xl md:text-4xl font-bold text-primary mb-4">
            Start building a better way to handle customer conversations.
          </h2>
          <p className="font-body-lg text-base md:text-lg text-on-surface-variant mb-8 max-w-2xl mx-auto">
            Join thousands of businesses streamlining operations with TIOS intelligent voice receptionists.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/dashboard"
              className="bg-primary text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-lg hover:opacity-90 transition-opacity font-bold"
            >
              Get Started Now
            </Link>
            <a
              href="mailto:sales@tios.ai"
              className="bg-surface-container-lowest border border-outline text-primary font-label-md text-label-md px-8 py-3.5 rounded-lg hover:bg-surface-container-low transition-colors font-bold"
            >
              Talk to Sales
            </a>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
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
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/solutions">
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

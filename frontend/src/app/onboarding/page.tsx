"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Save,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Check,
  CreditCard,
  Lock,
  X,
} from "lucide-react";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  // Step 1 Form state
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("us");
  const [city, setCity] = useState("");
  const [teamSize, setTeamSize] = useState("");

  // Step 2 Selected Plan state
  const [selectedPlan, setSelectedPlan] = useState<string>("business");

  // Step 3 Payment Form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      alert("Please enter your business name.");
      return;
    }
    if (!industry) {
      alert("Please select your industry.");
      return;
    }
    // Advance to Step 2
    setCurrentStep(2);
  };

  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
    // Advance to Step 3
    setCurrentStep(3);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Finish onboarding / start free trial and redirect to dashboard
    window.location.href = "/dashboard";
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col antialiased selection:bg-primary selection:text-on-primary">
      {/* 1. Top Navigation Bar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 h-16 sticky top-0 z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-1 rounded-lg hover:bg-surface-container-high"
              aria-label="Back to previous step"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-headline-md font-headline-md font-black text-primary tracking-tight">TIOS</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => alert("Support Team is available 24/7. Contacting support...")}
            className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <HelpCircle className="w-4 h-4" />
            Need help?
          </button>
          <Link
            href="/dashboard"
            className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors hidden md:flex items-center gap-1.5 text-xs font-semibold"
          >
            <Save className="w-4 h-4" />
            Save &amp; exit
          </Link>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-start pt-6 md:pt-8 pb-32 md:pb-24 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto text-left">
        {/* Step Progress Indicator Header */}
        <div className="w-full max-w-4xl mb-8 md:mb-10">
          <div className="flex items-center justify-between text-xs font-label-sm text-outline-variant mb-2 px-1">
            <span className={currentStep === 1 ? "text-primary font-bold" : "text-primary"}>01 Business</span>
            <span className={currentStep === 2 ? "text-primary font-bold" : currentStep > 2 ? "text-primary" : "text-outline-variant"}>02 Plan</span>
            <span className={currentStep === 3 ? "text-primary font-bold" : currentStep > 3 ? "text-primary" : "text-outline-variant"}>03 Payment</span>
            <span className="hidden md:inline">04 Phone</span>
            <span className="hidden md:inline">05 Receptionist</span>
            <span className="hidden md:inline">06 Customize</span>
            <span className="hidden md:inline">07 Business</span>
            <span className="hidden md:inline">08 Knowledge</span>
            <span className="hidden md:inline">09 Test</span>
            <span>10 Go Live</span>
          </div>

          {/* Progress Line Bar */}
          <div className="h-2 bg-surface-container-high rounded-full w-full overflow-hidden flex relative">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: currentStep === 1 ? "10%" : currentStep === 2 ? "20%" : "30%" }}
            ></div>
          </div>
        </div>

        {/* STEP 1: BUSINESS PROFILE FORM */}
        {currentStep === 1 && (
          <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm">
            <div className="mb-8">
              <h1 className="text-headline-lg font-headline-lg text-2xl md:text-3xl font-bold text-on-surface mb-2 tracking-tight">
                Create your business profile
              </h1>
              <p className="text-body-md font-body-md text-on-surface-variant text-sm md:text-base">
                Let&apos;s start with the basics to set up your AI receptionist.
              </p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <label className="block text-label-md font-label-md text-on-surface text-sm font-bold" htmlFor="businessName">
                  Business name
                </label>
                <input
                  id="businessName"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full h-11 px-3.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors placeholder:text-on-surface-variant/50"
                />
                <p className="text-body-sm text-xs text-on-surface-variant">
                  This is the name your callers and customers will recognize.
                </p>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="block text-label-md font-label-md text-on-surface text-sm font-bold" htmlFor="industry">
                  What type of business are you?
                </label>
                <div className="relative">
                  <select
                    id="industry"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full h-11 px-3.5 pr-10 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-sm appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer"
                  >
                    <option value="" disabled>Select industry...</option>
                    <option value="healthcare">Healthcare &amp; Medical Clinic</option>
                    <option value="hospitality">Hospitality &amp; Hotel</option>
                    <option value="real_estate">Real Estate &amp; Housing</option>
                    <option value="retail">Retail &amp; E-Commerce</option>
                    <option value="legal">Legal Practice</option>
                    <option value="professional_services">Professional Services</option>
                    <option value="other">Other Business Services</option>
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-label-md font-label-md text-on-surface text-sm font-bold">
                  Where is your business located?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full h-11 px-3.5 pr-10 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-sm appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer"
                    >
                      <option value="us">United States</option>
                      <option value="ca">Canada</option>
                      <option value="uk">United Kingdom</option>
                      <option value="au">Australia</option>
                      <option value="ng">Nigeria</option>
                      <option value="za">South Africa</option>
                      <option value="de">Germany</option>
                      <option value="fr">France</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  </div>
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full h-11 px-3.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>

              {/* Team Size */}
              <div className="space-y-2 pt-4 border-t border-outline-variant/40">
                <label className="block text-label-md font-label-md text-on-surface text-sm font-bold flex items-center justify-between" htmlFor="teamSize">
                  <span>How large is your team?</span>
                  <span className="text-xs text-on-surface-variant font-normal">Optional</span>
                </label>
                <div className="relative">
                  <select
                    id="teamSize"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full h-11 px-3.5 pr-10 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-sm appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer"
                  >
                    <option value="" disabled>Select team size...</option>
                    <option value="1">Just me</option>
                    <option value="2-10">2–10 members</option>
                    <option value="11-50">11–50 members</option>
                    <option value="51-200">51–200 members</option>
                    <option value="200+">200+ members</option>
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-primary text-on-primary h-11 px-6 rounded-lg font-label-md text-sm font-bold flex items-center justify-center hover:bg-on-surface transition-colors shadow-sm gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: CHOOSE YOUR PLAN */}
        {currentStep === 2 && (
          <div className="w-full max-w-5xl flex flex-col items-center">
            <div className="text-center max-w-2xl mb-10">
              <h1 className="font-headline-lg text-2xl md:text-4xl font-bold text-primary mb-3">
                Choose a plan for your business.
              </h1>
              <p className="font-body-lg text-base md:text-lg text-on-surface-variant">
                Select a plan to continue setting up your AI receptionist. You can change your plan at any time.
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center gap-3 mb-10 bg-surface-container-low p-1.5 rounded-full border border-outline-variant/30">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full font-label-md text-sm transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white text-primary font-bold shadow-sm border border-outline-variant/20"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-5 py-2 rounded-full font-label-md text-sm transition-all flex items-center gap-2 ${
                  billingCycle === "yearly"
                    ? "bg-white text-primary font-bold shadow-sm border border-outline-variant/20"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Yearly
                <span className="bg-tertiary-fixed-dim/30 text-on-tertiary-fixed-variant px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
                  Save 20%
                </span>
              </button>
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl mb-10 text-left items-stretch">
              {/* Starter Plan */}
              <div className="bg-white border border-outline-variant rounded-xl p-6 md:p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="mb-6">
                  <h3 className="font-headline-md text-2xl font-bold text-primary mb-2">Starter</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-headline-lg text-3xl md:text-4xl font-bold text-primary">
                      {billingCycle === "yearly" ? "₦45,000" : "₦55,000"}
                    </span>
                    <span className="font-body-sm text-sm text-on-surface-variant">/mo</span>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    {billingCycle === "yearly" ? "Billed annually at ₦540,000" : "Billed monthly"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPlan("starter")}
                  className="w-full py-3 px-4 bg-white border border-outline-variant rounded-lg font-label-md text-sm text-primary hover:bg-surface-container-low transition-colors mb-6 font-bold"
                >
                  Start Free Trial
                </button>
                <div className="flex-grow">
                  <p className="font-label-sm text-xs uppercase tracking-wider text-outline mb-3 font-bold">Core Features</p>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-on-surface">1,000 AI Minutes / mo</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-on-surface">1 Dedicated Receptionist</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-on-surface">Standard Knowledge Base</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-on-surface">Email Support</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Business Plan */}
              <div className="bg-white border-2 border-primary rounded-xl p-6 md:p-8 flex flex-col shadow-md relative overflow-hidden transform md:-translate-y-2">
                <div className="absolute top-0 inset-x-0 h-1 bg-primary"></div>
                <div className="absolute top-4 right-4 bg-primary text-white font-label-sm text-xs uppercase tracking-wider px-3 py-1 rounded-full font-bold">
                  Recommended
                </div>
                <div className="mb-6 mt-2">
                  <h3 className="font-headline-md text-2xl font-bold text-primary mb-2">Business</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-headline-lg text-3xl md:text-4xl font-bold text-primary">
                      {billingCycle === "yearly" ? "₦120,000" : "₦149,000"}
                    </span>
                    <span className="font-body-sm text-sm text-on-surface-variant">/mo</span>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    {billingCycle === "yearly" ? "Billed annually at ₦1,440,000" : "Billed monthly"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPlan("business")}
                  className="w-full py-3 px-4 bg-primary text-white rounded-lg font-label-md text-sm hover:bg-primary/90 transition-colors mb-6 shadow-sm font-bold"
                >
                  Get Business
                </button>
                <div className="flex-grow">
                  <p className="font-label-sm text-xs uppercase tracking-wider text-outline mb-3 font-bold">Advanced Features</p>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-on-surface font-bold">10,000 AI Minutes / mo</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-on-surface font-bold">3 Dedicated Receptionists</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-on-surface">Advanced CRM Integration</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-on-surface">Custom Voice Synthesis</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-on-surface">Priority 24/7 Support</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="mb-6">
                  <h3 className="font-headline-md text-2xl font-bold text-primary mb-2">Enterprise</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-headline-lg text-3xl md:text-4xl font-bold text-primary">Custom</span>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant">Tailored for large scale operations</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPlan("enterprise")}
                  className="w-full py-3 px-4 bg-white border border-outline-variant rounded-lg font-label-md text-sm text-primary hover:bg-surface-container-low transition-colors mb-6 font-bold"
                >
                  Contact Sales
                </button>
                <div className="flex-grow">
                  <p className="font-label-sm text-xs uppercase tracking-wider text-outline mb-3 font-bold">Enterprise Features</p>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-on-surface">Unlimited AI Minutes</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-on-surface">Unlimited Receptionists</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-on-surface">Dedicated Success Manager</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-on-surface">SLA Guarantee</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-on-surface">Custom Infrastructure Hosting</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4"
              >
                ← Back to Business Profile
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT METHOD FORM & ORDER SUMMARY */}
        {currentStep === 3 && (
          <div className="w-full max-w-4xl flex flex-col gap-6">
            {/* Header context info on mobile */}
            <div className="md:hidden text-left mb-2">
              <p className="font-label-sm text-xs text-secondary uppercase tracking-wider mb-1 font-bold">
                Step 3 of 10 - Payment
              </p>
              <h1 className="font-headline-lg-mobile text-2xl font-bold text-primary mb-1">
                Set up your payment method
              </h1>
              <p className="font-body-md text-xs text-on-surface-variant">
                Your 14-day free trial starts now. You won&apos;t be charged until your trial ends.
              </p>
            </div>

            {/* Desktop Dual-Panel & Mobile Stacked Cards Container */}
            <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row">
              {/* Payment Details Form (Left on Desktop, Stacked on Mobile) */}
              <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col order-2 md:order-1">
                <div className="hidden md:flex justify-between items-center mb-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-widest font-bold">
                  <span>Step 03 / 10</span>
                  <span>Payment</span>
                </div>

                <div className="hidden md:block mb-6">
                  <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary mb-2">
                    Set up your payment method
                  </h1>
                  <p className="font-body-md text-sm text-on-surface-variant">
                    Your 14-day free trial starts now. You won&apos;t be charged until your trial ends.
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-4 md:hidden">
                  <CreditCard className="w-5 h-5 text-secondary" />
                  <h2 className="font-headline-md text-lg font-bold text-primary">Payment Details</h2>
                </div>

                <form id="payment-form" onSubmit={handleStep3Submit} className="flex flex-col gap-4 flex-grow">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-xs font-bold text-on-surface" htmlFor="cardName">
                      Cardholder Name
                    </label>
                    <input
                      id="cardName"
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-sm text-on-surface placeholder-on-surface-variant transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-xs font-bold text-on-surface" htmlFor="cardNumber">
                      Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                      <input
                        id="cardNumber"
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        className="w-full pl-11 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-sm text-on-surface placeholder-on-surface-variant transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1.5 w-1/2">
                      <label className="font-label-md text-xs font-bold text-on-surface" htmlFor="expiry">
                        Expiry Date
                      </label>
                      <input
                        id="expiry"
                        type="text"
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-sm text-on-surface placeholder-on-surface-variant transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 w-1/2">
                      <label className="font-label-md text-xs font-bold text-on-surface" htmlFor="cvc">
                        CVC
                      </label>
                      <input
                        id="cvc"
                        type="text"
                        required
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="123"
                        className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-sm text-on-surface placeholder-on-surface-variant transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-auto pt-6 hidden md:block">
                    <button
                      type="submit"
                      className="w-full bg-primary text-on-primary font-label-md text-sm py-3.5 rounded-lg hover:bg-on-surface transition-colors font-bold flex items-center justify-center gap-2 shadow-md"
                    >
                      Start Free Trial
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-on-surface-variant text-xs font-medium">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      Secured by Stripe
                    </div>
                  </div>
                </form>
              </div>

              {/* Order Summary (Right on Desktop, Top on Mobile) */}
              <div className="w-full md:w-2/5 bg-surface-container-low p-6 md:p-8 border-b md:border-b-0 md:border-l border-outline-variant flex flex-col justify-between order-1 md:order-2">
                <div>
                  <h2 className="font-headline-md text-xl font-bold text-primary mb-4 border-b border-outline-variant pb-3">
                    Order Summary
                  </h2>

                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex justify-between items-start mb-4 shadow-sm">
                    <div>
                      <div className="font-label-md text-sm font-bold text-primary capitalize">
                        {selectedPlan} Plan
                      </div>
                      <div className="text-xs text-on-surface-variant capitalize">
                        {billingCycle} Billing
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-label-md text-sm font-bold text-primary">
                        {selectedPlan === "starter" ? (billingCycle === "yearly" ? "₦540,000" : "₦55,000") : selectedPlan === "business" ? (billingCycle === "yearly" ? "₦1,440,000" : "₦149,000") : "Custom"}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        /{billingCycle === "yearly" ? "year" : "month"}
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-6 text-xs text-on-surface">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Unlimited AI Receptionists</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>24/7 Phone Support Integration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Custom Knowledge Base &amp; FAQs</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-outline-variant pt-4">
                  <div className="flex justify-between items-center mb-2 text-xs text-on-surface-variant">
                    <span>Subtotal</span>
                    <span>
                      {selectedPlan === "starter" ? (billingCycle === "yearly" ? "₦540,000" : "₦55,000") : selectedPlan === "business" ? (billingCycle === "yearly" ? "₦1,440,000" : "₦149,000") : "Custom"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3 text-xs text-on-surface-variant">
                    <span>Taxes</span>
                    <span>Calculated next</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-sm text-primary border-t border-outline-variant/40 pt-2">
                    <span>Total Due Today</span>
                    <span className="text-emerald-600">₦0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Fixed Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-between items-center px-4 py-3 bg-surface-container-lowest border-t border-outline-variant shadow-lg z-50 rounded-t-xl">
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-on-surface-variant px-3 py-2 text-xs font-bold hover:text-primary"
              >
                <X className="w-4 h-4" />
                Save &amp; exit
              </Link>
              <button
                type="submit"
                form="payment-form"
                className="flex items-center justify-center bg-primary text-on-primary rounded-full px-5 py-2.5 font-label-md text-xs font-bold shadow-sm gap-1.5 hover:bg-on-surface transition-colors"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}

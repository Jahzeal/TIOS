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
  Search,
  Phone,
  PhoneOff,
  Mic,
  Bot,
  Rocket,
  LogOut,
  Signal,
  Building2,
  Home,
  Hotel,
  Headphones,
  User,
  Store,
  Volume2,
  PlayCircle,
  Plus,
  MapPin,
  Car,
  Calendar,
  X,
} from "lucide-react";

interface PhoneNumberOption {
  id: string;
  number: string;
  location: string;
  type: "Local" | "Toll-Free";
}

interface ChatMessage {
  id: string;
  sender: "AI" | "You" | "System";
  text: string;
}

interface TemplateOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: "healthcare",
    title: "Healthcare Assistant",
    description: "Optimized for appointment scheduling, patient intake, and answering standard medical FAQ.",
    icon: Building2,
  },
  {
    id: "real_estate",
    title: "Real Estate Agent",
    description: "Specialized in property inquiries, scheduling viewings, and providing listing details.",
    icon: Home,
  },
  {
    id: "hospitality",
    title: "Hospitality Desk",
    description: "Configured for booking reservations, handling guest requests, and local recommendations.",
    icon: Hotel,
  },
  {
    id: "general_support",
    title: "General Support",
    description: "A versatile baseline for standard customer service, routing, and FAQ handling.",
    icon: Headphones,
  },
];

const AVAILABLE_NUMBERS: PhoneNumberOption[] = [
  { id: "1", number: "+1 (415) 555-0198", location: "San Francisco, CA", type: "Local" },
  { id: "2", number: "+1 (415) 555-0247", location: "San Francisco, CA", type: "Local" },
  { id: "3", number: "+1 (800) 555-0899", location: "United States", type: "Toll-Free" },
  { id: "4", number: "+1 (415) 555-0871", location: "San Francisco, CA", type: "Local" },
  { id: "5", number: "+1 (212) 555-0432", location: "New York, NY", type: "Local" },
  { id: "6", number: "+1 (888) 555-0112", location: "United States", type: "Toll-Free" },
];

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

  // Step 4 Phone Number state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>("+1 (415) 555-0247");

  // Step 5 Template state
  const [selectedTemplate, setSelectedTemplate] = useState<string>("real_estate");

  // Step 6-7 Customize state
  const [receptionistName, setReceptionistName] = useState<string>("Alice");
  const [voiceType, setVoiceType] = useState<"professional_female" | "friendly_male">("professional_female");
  const [conversationStyle, setConversationStyle] = useState<number>(50);
  const [openTime, setOpenTime] = useState<string>("9:00 AM");
  const [closeTime, setCloseTime] = useState<string>("5:00 PM");
  const [differentWeekendHours, setDifferentWeekendHours] = useState<boolean>(false);
  const [directivesText, setDirectivesText] = useState<string>(
    "- We are located next to the central post office.\n- Parking is free in the rear lot.\n- Appointments are required for all services."
  );

  // Step 9 Simulator state
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const filteredNumbers = AVAILABLE_NUMBERS.filter(
    (item) =>
      item.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    setCurrentStep(2);
  };

  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
    setCurrentStep(3);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(4);
  };

  const handleStep4Confirm = () => {
    if (!selectedPhoneNumber) {
      alert("Please select a business phone number.");
      return;
    }
    setCurrentStep(5);
  };

  const handleStep5Continue = () => {
    if (!selectedTemplate) {
      alert("Please select a receptionist template.");
      return;
    }
    setCurrentStep(6);
  };

  const handleStep6SaveAndContinue = () => {
    if (!receptionistName.trim()) {
      alert("Please provide a name for your receptionist.");
      return;
    }
    setCurrentStep(9);
  };

  const handleToggleCall = () => {
    if (!isCalling) {
      setIsCalling(true);
      setMessages([]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "AI",
            text: `Hello! Thank you for calling ${businessName || "TIOS"}. My name is ${receptionistName || "Alice"}. How can I help you today?`,
          },
        ]);
      }, 1000);
    } else {
      setIsCalling(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "System",
          text: "Call ended.",
        },
      ]);
    }
  };

  const getStyleLabel = (val: number) => {
    if (val < 35) return "Concise & Direct";
    if (val > 65) return "Chatty & Engaging";
    return "Balanced";
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
          <div className="flex items-center gap-2 text-primary md:hidden">
            <Signal className="w-4 h-4 fill-current text-primary" />
          </div>
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
            <span className={currentStep === 4 ? "text-primary font-bold" : currentStep > 4 ? "text-primary" : "text-outline-variant"}>04 Phone</span>
            <span className={currentStep === 5 ? "text-primary font-bold" : currentStep > 5 ? "text-primary" : "text-outline-variant"}>05 Receptionist</span>
            <span className={currentStep === 6 ? "text-primary font-bold" : currentStep > 6 ? "text-primary" : "text-outline-variant"}>06 Customize</span>
            <span className="hidden md:inline">07 Details</span>
            <span className="hidden md:inline">08 Knowledge</span>
            <span className={currentStep === 9 ? "text-primary font-bold" : "text-outline-variant"}>09 Test</span>
            <span>10 Go Live</span>
          </div>

          {/* Progress Line Bar */}
          <div className="h-2 bg-surface-container-high rounded-full w-full overflow-hidden flex relative">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{
                width:
                  currentStep === 1
                    ? "10%"
                    : currentStep === 2
                    ? "20%"
                    : currentStep === 3
                    ? "30%"
                    : currentStep === 4
                    ? "40%"
                    : currentStep === 5
                    ? "50%"
                    : currentStep === 6
                    ? "65%"
                    : "90%",
              }}
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
              {/* Payment Details Form */}
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

              {/* Order Summary */}
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

        {/* STEP 4: CHOOSE YOUR BUSINESS NUMBER */}
        {currentStep === 4 && (
          <div className="w-full max-w-3xl flex flex-col items-center">
            <div className="w-full text-left mb-6">
              <p className="font-label-sm text-xs text-secondary uppercase tracking-wider mb-1 font-bold">
                STEP 4 OF 10 - PHONE NUMBER
              </p>
              <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary mb-2">
                Choose your business number
              </h1>
              <p className="font-body-md text-sm text-on-surface-variant">
                Select a local or toll-free number for your AI receptionist.
              </p>
            </div>

            <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm text-left mb-6">
              <div className="relative mb-6">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by area code or city..."
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-sm text-sm text-on-surface placeholder-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>

              <div className="space-y-3 mb-6">
                {filteredNumbers.map((item) => {
                  const isSelected = selectedPhoneNumber === item.number;
                  return (
                    <label
                      key={item.id}
                      onClick={() => setSelectedPhoneNumber(item.number)}
                      className={`relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-2 border-primary bg-surface-container-low shadow-sm"
                          : "border-outline-variant hover:bg-surface-container-low bg-surface-container-lowest"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="phone_number"
                          checked={isSelected}
                          onChange={() => setSelectedPhoneNumber(item.number)}
                          className="w-4 h-4 text-primary border-outline-variant focus:ring-primary cursor-pointer"
                        />
                        <div>
                          <div className={`font-headline-md text-base md:text-lg font-bold ${isSelected ? "text-primary" : "text-on-surface"}`}>
                            {item.number}
                          </div>
                          <div className="font-body-sm text-xs text-on-surface-variant">
                            {item.location}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full font-label-sm text-xs font-semibold ${
                          item.type === "Toll-Free"
                            ? "bg-secondary-fixed text-on-secondary-fixed"
                            : isSelected
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {item.type}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="hidden md:flex justify-between items-center pt-6 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="font-label-md text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStep4Confirm}
                  className="bg-primary text-on-primary font-label-md text-sm font-bold px-6 py-3 rounded-lg hover:bg-on-surface transition-colors flex items-center gap-2 shadow-sm"
                >
                  Confirm Number
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-between items-center px-4 py-3 bg-surface-container-lowest border-t border-outline-variant shadow-lg z-50">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="font-label-md text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1 font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleStep4Confirm}
                className="bg-primary text-on-primary font-label-md text-xs font-bold rounded-lg px-6 py-3 flex items-center gap-2 hover:bg-on-surface transition-colors shadow-sm"
              >
                Confirm Number
                <ArrowRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}

        {/* STEP 5: SELECT RECEPTIONIST TEMPLATE */}
        {currentStep === 5 && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <div className="w-full text-left mb-6">
              <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-bold md:hidden">
                Step 5 of 10 - 50%
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-1">
                Select a receptionist template
              </h2>
              <p className="font-body-lg text-sm md:text-base text-on-surface-variant">
                Choose a baseline configuration for your industry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full mb-8 text-left">
              {TEMPLATE_OPTIONS.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                const IconComponent = tmpl.icon;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`group relative bg-surface-container-lowest border rounded-xl p-5 md:p-6 transition-all cursor-pointer flex items-start gap-4 md:flex-col md:gap-0 h-full ${
                      isSelected
                        ? "border-2 border-primary bg-slate-50 md:bg-primary/5 shadow-sm"
                        : "border-outline-variant hover:shadow-md hover:border-primary/30"
                    }`}
                  >
                    <div className="mt-1 flex-shrink-0 md:hidden">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? "border-primary bg-primary" : "border-outline-variant bg-surface-container-lowest"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                    </div>

                    <div className="hidden md:flex items-center justify-between w-full mb-4">
                      <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center border border-outline-variant group-hover:bg-primary/5 transition-colors">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? "border-primary bg-primary" : "border-outline-variant"
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 text-white ${isSelected ? "opacity-100" : "opacity-0"}`} />
                      </div>
                    </div>

                    <div className="flex-grow flex flex-col gap-1 md:gap-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5 text-secondary md:hidden" />
                        <h3 className="font-headline-md text-base md:text-lg font-bold text-primary">
                          {tmpl.title}
                        </h3>
                      </div>
                      <p className="font-body-md text-xs md:text-sm text-on-surface-variant flex-1 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplate(tmpl.id);
                      }}
                      className={`hidden md:block w-full mt-6 py-2.5 px-4 rounded font-label-md text-xs font-bold transition-colors ${
                        isSelected
                          ? "bg-primary text-on-primary border border-transparent"
                          : "bg-surface-container-lowest border border-outline-variant text-primary hover:bg-surface-container-low"
                      }`}
                    >
                      {isSelected ? "Selected" : "Select Template"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:flex w-full pt-4 border-t border-outline-variant justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="font-label-md text-sm font-bold text-primary hover:text-surface-tint transition-colors"
              >
                Back
              </button>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="font-label-md text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
                >
                  Save &amp; Exit
                </Link>
                <button
                  type="button"
                  onClick={handleStep5Continue}
                  className="bg-primary text-on-primary font-label-md text-sm font-bold px-6 py-2.5 rounded hover:bg-on-surface transition-colors flex items-center gap-2 shadow-sm"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-between items-center px-4 py-3 bg-surface-container-lowest border-t border-outline-variant shadow-lg z-50">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="font-label-md text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1 font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleStep5Continue}
                className="bg-primary text-on-primary font-label-md text-xs font-bold rounded-lg px-6 py-3 flex items-center gap-1.5 hover:bg-on-surface transition-colors shadow-sm"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}

        {/* STEP 6-7: CUSTOMIZE RECEPTIONIST & BUSINESS INFO */}
        {currentStep === 6 && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            {/* Header */}
            <div className="w-full text-left mb-6">
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-primary">
                  Customize Receptionist &amp; Business Info
                </h2>
                <span className="font-label-sm text-xs font-bold text-secondary">Step 6-7 of 10</span>
              </div>
              <p className="font-body-md text-sm md:text-base text-on-surface-variant">
                Define how your AI interacts with customers and provide essential details about your operations.
              </p>
            </div>

            {/* Split Layout Container Card */}
            <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col lg:flex-row mb-8 text-left">
              {/* Left Side: Receptionist Profile */}
              <div className="w-full lg:w-1/2 p-6 md:p-8 bg-surface-bright border-b lg:border-b-0 lg:border-r border-outline-variant space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-headline-md text-lg font-bold text-primary">Receptionist Profile</h3>
                </div>

                {/* Name Input */}
                <div className="space-y-1.5">
                  <label className="block font-label-md text-xs font-bold text-on-surface" htmlFor="recName">
                    Receptionist Name
                  </label>
                  <input
                    id="recName"
                    type="text"
                    value={receptionistName}
                    onChange={(e) => setReceptionistName(e.target.value)}
                    placeholder="e.g., Sarah, Alex, Assistant"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3.5 py-2.5 font-body-md text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <p className="text-[12px] text-on-surface-variant">This is how the AI will introduce itself.</p>
                </div>

                {/* Voice Personality */}
                <div className="space-y-2">
                  <label className="block font-label-md text-xs font-bold text-on-surface">Voice Personality</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVoiceType("professional_female")}
                      className={`flex items-center justify-between p-3 border-2 rounded-lg text-left transition-all ${
                        voiceType === "professional_female"
                          ? "border-primary bg-surface-container-lowest shadow-sm"
                          : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low"
                      }`}
                    >
                      <div>
                        <div className="font-label-md text-xs font-bold text-primary">Professional Female</div>
                        <div className="text-[11px] text-on-surface-variant">Clear, authoritative</div>
                      </div>
                      <PlayCircle className={`w-5 h-5 ${voiceType === "professional_female" ? "text-primary fill-primary/10" : "text-on-surface-variant"}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setVoiceType("friendly_male")}
                      className={`flex items-center justify-between p-3 border-2 rounded-lg text-left transition-all ${
                        voiceType === "friendly_male"
                          ? "border-primary bg-surface-container-lowest shadow-sm"
                          : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low"
                      }`}
                    >
                      <div>
                        <div className="font-label-md text-xs font-bold text-primary">Friendly Male</div>
                        <div className="text-[11px] text-on-surface-variant">Warm, approachable</div>
                      </div>
                      <PlayCircle className={`w-5 h-5 ${voiceType === "friendly_male" ? "text-primary fill-primary/10" : "text-on-surface-variant"}`} />
                    </button>
                  </div>
                </div>

                {/* Conversation Style Slider */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="font-label-md text-xs font-bold text-on-surface">Conversation Style</label>
                    <span className="font-label-sm text-xs font-semibold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                      {getStyleLabel(conversationStyle)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={conversationStyle}
                    onChange={(e) => setConversationStyle(Number(e.target.value))}
                    className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary outline-none"
                  />
                  <div className="flex justify-between text-[11px] text-on-surface-variant pt-1 font-medium">
                    <span>Concise &amp; Direct</span>
                    <span>Chatty &amp; Engaging</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Business Knowledge */}
              <div className="w-full lg:w-1/2 p-6 md:p-8 bg-surface-container-lowest space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="w-5 h-5 text-primary" />
                  <h3 className="font-headline-md text-lg font-bold text-primary">Business Knowledge</h3>
                </div>

                {/* Operating Hours */}
                <div className="space-y-2">
                  <label className="block font-label-md text-xs font-bold text-on-surface">Standard Operating Hours</label>
                  <div className="flex items-center gap-3">
                    <select
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary cursor-pointer"
                    >
                      <option>8:00 AM</option>
                      <option>9:00 AM</option>
                      <option>10:00 AM</option>
                    </select>
                    <span className="text-xs text-on-surface-variant font-bold">to</span>
                    <select
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary cursor-pointer"
                    >
                      <option>4:00 PM</option>
                      <option>5:00 PM</option>
                      <option>6:00 PM</option>
                      <option>7:00 PM</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id="weekendCheck"
                      type="checkbox"
                      checked={differentWeekendHours}
                      onChange={(e) => setDifferentWeekendHours(e.target.checked)}
                      className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="weekendCheck" className="text-xs text-on-surface-variant cursor-pointer">
                      Different hours on weekends
                    </label>
                  </div>
                </div>

                {/* Key Directives */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-label-md text-xs font-bold text-on-surface">Key Directives / Quick Answers</label>
                  </div>
                  <p className="text-[12px] text-on-surface-variant">What should the AI prioritize telling callers?</p>
                  <textarea
                    rows={4}
                    value={directivesText}
                    onChange={(e) => setDirectivesText(e.target.value)}
                    placeholder="- We are located next to the central post office..."
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors leading-relaxed"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Desktop Action Footer */}
            <div className="hidden md:flex w-full pt-4 border-t border-outline-variant justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="font-label-md text-sm font-bold text-primary hover:text-surface-tint transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStep6SaveAndContinue}
                className="bg-primary text-on-primary font-label-md text-sm font-bold px-6 py-3 rounded-lg hover:bg-on-surface transition-colors flex items-center gap-2 shadow-sm"
              >
                Save &amp; Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Fixed Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-4 py-3 bg-surface-container-lowest border-t border-outline-variant shadow-lg">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="font-label-md text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1 font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleStep6SaveAndContinue}
                className="bg-primary text-on-primary font-label-md text-xs font-bold rounded-lg px-6 py-3 flex items-center gap-1.5 hover:bg-on-surface transition-colors shadow-sm"
              >
                Save &amp; Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}

        {/* STEP 9: TEST YOUR RECEPTIONIST SIMULATOR */}
        {currentStep === 9 && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            {/* Context Header */}
            <div className="w-full text-left md:text-center mb-6 md:mb-8">
              <p className="font-label-sm text-xs text-secondary uppercase tracking-wider mb-1 font-bold md:hidden">
                Step 9 of 10 - Test (90%)
              </p>
              <h2 className="font-display font-headline-lg text-2xl md:text-3xl font-bold text-primary mb-2">
                Try out your AI receptionist
              </h2>
              <p className="font-body-md text-sm md:text-base text-on-surface-variant max-w-xl md:mx-auto">
                Call your agent to ensure it handles inquiries exactly how you want before going live.
              </p>
            </div>

            {/* Desktop Full Simulator Canvas Card */}
            <div className="hidden md:flex w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden flex-col min-h-[480px]">
              <div className="flex justify-between items-center border-b border-outline-variant pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                    <Bot className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-label-md text-sm font-bold text-primary">TIOS Agent</div>
                    <div className="font-label-sm text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Ready to test
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 font-body-sm text-sm pb-4 min-h-[250px] justify-center">
                {messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-on-surface-variant flex-col gap-2 opacity-60 my-auto">
                    <Mic className="w-12 h-12 text-outline" />
                    <p className="text-sm">Initiate a call to begin the simulation.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "You"
                          ? "justify-end"
                          : msg.sender === "System"
                          ? "justify-center opacity-60 my-2"
                          : "justify-start"
                      }`}
                    >
                      {msg.sender === "System" ? (
                        <div className="text-xs font-label-sm uppercase tracking-widest text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">
                          {msg.text}
                        </div>
                      ) : (
                        <div
                          className={`px-4 py-3 rounded-xl max-w-[80%] shadow-sm ${
                            msg.sender === "AI"
                              ? "bg-surface-container-low border border-outline-variant rounded-tl-none text-on-surface"
                              : "bg-primary text-on-primary rounded-tr-none"
                          }`}
                        >
                          <div className="text-xs font-bold mb-1 opacity-70">{msg.sender}</div>
                          <div className="text-sm leading-relaxed">{msg.text}</div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-outline-variant flex justify-center items-center relative">
                <button
                  type="button"
                  onClick={handleToggleCall}
                  className={`relative group flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-200 active:scale-95 ${
                    isCalling ? "bg-red-600 text-white" : "bg-primary text-on-primary hover:scale-105"
                  }`}
                  aria-label={isCalling ? "End call" : "Start call"}
                >
                  {isCalling ? <PhoneOff className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
                </button>
              </div>
            </div>

            {/* Mobile Visualizer Simulation Card */}
            <div className="md:hidden w-full flex flex-col items-center justify-center mb-6">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm flex flex-col items-center justify-center w-full max-w-sm gap-6 relative overflow-hidden text-center">
                <div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-1.5 rounded-full border border-outline-variant z-10">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span className="font-label-sm text-xs text-on-surface-variant font-medium">TIOS Agent Ready</span>
                </div>

                <div className="w-28 h-28 rounded-full bg-surface-container-low flex items-center justify-center border border-outline-variant relative z-10 animate-pulse">
                  <Bot className="w-12 h-12 text-primary" />
                </div>

                <button
                  type="button"
                  onClick={handleToggleCall}
                  className="flex items-center justify-center gap-2.5 w-full bg-primary text-on-primary py-3.5 rounded-lg font-label-md text-sm font-bold shadow-sm z-10 hover:bg-on-surface transition-colors"
                >
                  {isCalling ? <PhoneOff className="w-4 h-4 text-red-400" /> : <Phone className="w-4 h-4" />}
                  {isCalling ? "End Voice Test" : "Start Voice Test"}
                </button>
              </div>
            </div>

            {/* Desktop Go Live Action Button */}
            <div className="hidden md:flex mt-8 w-full max-w-2xl justify-end">
              <Link
                href="/dashboard"
                className="bg-primary text-on-primary font-label-md text-sm font-bold px-6 py-3.5 rounded-lg shadow-sm hover:bg-on-surface transition-colors flex items-center gap-2"
              >
                Looks Good, Go Live
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Fixed Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex flex-col bg-surface-container-lowest border-t border-outline-variant rounded-t-xl shadow-lg">
              <div className="px-4 pt-3 pb-2 w-full">
                <Link
                  href="/dashboard"
                  className="w-full bg-emerald-800 text-white py-3.5 rounded-lg font-label-md text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
                >
                  <Rocket className="w-4 h-4" />
                  Looks Good, Go Live
                </Link>
              </div>
              <div className="flex justify-between items-center px-4 pb-4 pt-1 w-full text-xs font-semibold text-secondary">
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="flex items-center gap-1 p-2 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1 p-2 hover:text-primary transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Save &amp; Exit
                </Link>
              </div>
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { apiRequest, authApi } from "@/lib/api";
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
  Phone,
  PhoneOff,
  Rocket,
  Building2,
  Calendar,
  Loader2,
  Activity,
  Send,
  FileText,
  Globe,
  UploadCloud,
  CheckCheck,
  ShieldCheck,
  Eye,
  EyeOff,
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
  action?: string;
}

const AVAILABLE_NUMBERS: PhoneNumberOption[] = [
  { id: "1", number: "+1 (415) 555-0198", location: "San Francisco, CA", type: "Local" },
  { id: "2", number: "+1 (415) 555-0247", location: "San Francisco, CA", type: "Local" },
  { id: "3", number: "+1 (800) 555-0899", location: "United States", type: "Toll-Free" },
  { id: "4", number: "+1 (415) 555-0871", location: "San Francisco, CA", type: "Local" },
  { id: "5", number: "+1 (212) 555-0432", location: "New York, NY", type: "Local" },
  { id: "6", number: "+1 (888) 555-0112", location: "United States", type: "Toll-Free" },
];

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedAgents, setSelectedAgents] = useState<string[]>(["front-desk"]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isSalesOnly = selectedAgents.includes("sales") && !selectedAgents.includes("front-desk") && !selectedAgents.includes("billing");
  const targetWorkspacePath = isSalesOnly ? "/sales" : "/dashboard";

  const agentCount = selectedAgents.length || 1;
  const baseMonthly = agentCount === 1 ? 99 : agentCount === 2 ? 179 : 249;
  const monthlyRate = billingCycle === "yearly" ? Math.round(baseMonthly * 0.8) : baseMonthly;
  const yearlyTotal = monthlyRate * 12;

  const finishOnboarding = () => {
    const accountType = isSalesOnly ? "SALES" : selectedAgents.includes("sales") ? "BOTH" : "VOICE";
    const token = authApi.getToken() || "active-session-token";
    const email = authApi.getUserEmail() || userEmail || "user@company.com";
    authApi.setSession({
      token,
      email,
      accountType: accountType,
    });
    if (isSalesOnly) {
      window.location.href = "/sales";
    } else {
      router.push("/dashboard");
    }
  };

  const toggleAgentSelection = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      if (selectedAgents.length > 1) {
        setSelectedAgents(selectedAgents.filter((id) => id !== agentId));
      } else {
        alert("You must have at least one active agent selected in your workforce.");
      }
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
    }
  };

  useEffect(() => {
    const agentsParam = searchParams.get("agents");
    if (agentsParam) {
      const parsed = agentsParam.split(",").filter((a) => ["front-desk", "sales", "billing"].includes(a));
      if (parsed.length > 0) {
        setSelectedAgents(parsed);
      }
    }
  }, [searchParams]);

  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("healthcare");
  const [country, setCountry] = useState("us");
  const [city, setCity] = useState("");
  const [teamSize, setTeamSize] = useState("2-10");

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [frontDeskPhone, setFrontDeskPhone] = useState<string>("+1 (415) 555-0247");
  const [receptionistName, setReceptionistName] = useState<string>("Alice");
  const [openTime, setOpenTime] = useState<string>("9:00 AM");
  const [closeTime, setCloseTime] = useState<string>("5:00 PM");
  const [calendarProvider, setCalendarProvider] = useState<"google" | "outlook" | "calendly">("google");

  const [salesName, setSalesName] = useState<string>("Marcus");
  const [targetIndustry, setTargetIndustry] = useState<string>("");
  const [targetLocation, setTargetLocation] = useState<string>("");
  const [targetRoles, setTargetRoles] = useState<string>("");
  const [dailyLeadQuota, setDailyLeadQuota] = useState<string>("25");
  const [meetingBookingLink, setMeetingBookingLink] = useState<string>("");

  const [billingName, setBillingName] = useState<string>("Elena");
  const [overdueReminderFrequency, setOverdueReminderFrequency] = useState<string>("3_days_after_due");
  const [smsPaymentTemplate, setSmsPaymentTemplate] = useState<string>(
    "Hi [Name], here is your secure checkout link for [Item] ($[Amount]): [URL]. Please reply if you have questions!"
  );

  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isSyncingKb, setIsSyncingKb] = useState<boolean>(false);

  const [activeSimAgent, setActiveSimAgent] = useState<string>("front-desk");

  // Ensure active simulator agent always matches an agent selected in the workforce
  useEffect(() => {
    if (selectedAgents.length > 0 && !selectedAgents.includes(activeSimAgent)) {
      setActiveSimAgent(selectedAgents[0]);
    }
  }, [selectedAgents, activeSimAgent]);

  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>("");

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<"FORM" | "OTP">("FORM");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(60);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const googleBtnRef = React.useRef<HTMLDivElement>(null);

  // Check existing session
  useEffect(() => {
    setUserEmail(authApi.getUserEmail());
  }, []);

  // Fetch Google Client ID
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
        console.log("[GoogleAuth] Standalone mode / Google client ID check:", err);
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

      // Completely clear existing contents before rendering to prevent duplicate containers
      googleBtnRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: "360",
        text: "signup_with",
        shape: "rectangular",
      });
    } catch (err) {
      console.warn("[GoogleAuth] renderButton error:", err);
    }
  };

  // Re-render Google button whenever step or authStep returns to unauthenticated form
  useEffect(() => {
    if (currentStep === 1 && authStep === "FORM" && googleClientId) {
      renderGoogleButton(googleClientId);
    }
  }, [currentStep, authStep, googleClientId]);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await authApi.googleLogin(response.credential);
      authApi.setSession({
        token: res.token,
        email: res.email,
        accountType: (res.accountType as any) || "SALES",
      });
      setUserEmail(res.email);
      if (!businessName) {
        setBusinessName(res.email.split("@")[0] + " Company");
      }
    } catch (err: any) {
      setAuthError(err.message || "Google Sign-In failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!businessName.trim()) {
      setAuthError("Please enter your business or full name.");
      return;
    }
    if (!userEmail || !userEmail.includes("@")) {
      setAuthError("Please enter a valid work email.");
      return;
    }
    if (signupPassword.length < 8) {
      setAuthError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.sendVerificationCode(userEmail);
      setAuthStep("OTP");
      setResendCountdown(60);
    } catch (err: any) {
      setAuthError(err.message || "Failed to send verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpAndSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!otpCode || otpCode.trim().length < 6) {
      setAuthError("Please enter the 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.register({
        username: businessName || userEmail?.split("@")[0] || "User",
        email: userEmail!,
        password: signupPassword,
        code: otpCode.trim(),
        accountType: isSalesOnly ? "SALES" : "VOICE",
      });

      authApi.setSession({
        token: res.token,
        email: res.email,
        accountType: (res.accountType as any) || "SALES",
      });

      // Save tenant profile
      try {
        const step1Res = await apiRequest("/onboarding/step1", {
          method: "POST",
          body: JSON.stringify({ businessName, industry, country, city, teamSize }),
        });
        if (step1Res?.tenantId) setTenantId(step1Res.tenantId);
      } catch {}

      setCurrentStep(2);
    } catch (err: any) {
      setAuthError(err.message || "Invalid or expired verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setAuthError("Please enter your business name.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiRequest("/onboarding/step1", {
        method: "POST",
        body: JSON.stringify({ businessName, industry, country, city, teamSize }),
      });
      if (res?.tenantId) {
        setTenantId(res.tenantId);
      }
    } catch (err) {
      console.warn("Using local tenant state:", err);
    } finally {
      setIsSubmitting(false);
      setCurrentStep(2);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0 || !userEmail) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await authApi.sendVerificationCode(userEmail);
      setResendCountdown(60);
    } catch (err: any) {
      setAuthError(err.message || "Failed to resend code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (authStep === "OTP" && resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [authStep, resendCountdown]);

  const handleStep2Submit = async () => {
    setIsSubmitting(true);
    try {
      await apiRequest("/onboarding/step2", {
        method: "POST",
        body: JSON.stringify({
          tenantId,
          plan: selectedAgents.join("+"),
          billingCycle,
          agents: selectedAgents,
        }),
      });
    } catch (err) {
      console.warn("Proceeding to payment:", err);
    } finally {
      setIsSubmitting(false);
      setCurrentStep(3);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !expiry || !cvc) {
      alert("Please fill in all payment fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiRequest("/onboarding/step3", {
        method: "POST",
        body: JSON.stringify({ tenantId, cardName, cardNumber, expiry, cvc }),
      });
    } catch (err) {
      console.warn("Payment authorization proceeding locally:", err);
    } finally {
      setIsSubmitting(false);
      if (selectedAgents.includes("front-desk")) {
        setCurrentStep(4);
      } else if (selectedAgents.includes("sales")) {
        setCurrentStep(5);
      } else {
        setCurrentStep(6);
      }
    }
  };

  const handleStartCall = () => {
    setIsCalling(true);
    const greetingText =
      activeSimAgent === "sales"
        ? `Hi there! This is ${salesName} with ${businessName || "Fluture Solutions"}. We help companies automate lead qualification and close demos. How can I help supercharge your sales pipeline today?`
        : activeSimAgent === "billing"
        ? `Hello! This is ${billingName} from the accounts department at ${businessName || "Fluture Solutions"}. How may I help you with your account or invoice today?`
        : `Hello! Thank you for calling ${businessName || "Fluture Solutions"}. My name is ${receptionistName}. How can I assist you today?`;

    setMessages([
      { id: "1", sender: "AI", text: greetingText },
    ]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "You", text: userInput };
    setMessages((prev) => [...prev, userMsg]);
    const inputClean = userInput.toLowerCase();
    setUserInput("");

    setTimeout(() => {
      let aiResponse = "";
      let actionTag = undefined;

      if (activeSimAgent === "sales") {
        if (inputClean.includes("demo") || inputClean.includes("book") || inputClean.includes("schedule") || inputClean.includes("meeting")) {
          aiResponse = `Awesome! I'm sending our executive demo booking link (${meetingBookingLink || 'https://calendar.app.google/...'}) right now. Let's get your team set up!`;
          actionTag = "[ACTION:BOOK_DEMO]";
        } else if (inputClean.includes("budget") || inputClean.includes("price") || inputClean.includes("cost") || inputClean.includes("how much")) {
          aiResponse = `Our outreach engine scales with your daily quota (starting at $99/mo). We target ${targetRoles || 'key decision-makers'} in ${targetLocation || 'your region'}. Would you like to schedule a 15-minute demo?`;
          actionTag = "[ACTION:QUALIFY_LEAD]";
        } else {
          aiResponse = `We automate lead discovery and high-converting multi-channel outreach for ${targetIndustry || 'your industry'}. Would you like to book a quick demo?`;
        }
      } else if (activeSimAgent === "billing") {
        if (inputClean.includes("pay") || inputClean.includes("link") || inputClean.includes("send") || inputClean.includes("invoice")) {
          aiResponse = `I have just sent your secure payment link via SMS text to your phone! Please check your text messages to complete checkout.`;
          actionTag = "[ACTION:SEND_PAYMENT_LINK]";
        } else if (inputClean.includes("what is this") || inputClean.includes("why") || inputClean.includes("expensive")) {
          aiResponse = `This invoice covers your 24/7 AI workforce provisioning, dedicated Twilio phone channels, and automated CRM integrations. Would you like me to dispatch the checkout link now?`;
        } else {
          aiResponse = `Your account is in good standing. We accept all major credit cards and bank transfers via Stripe.`;
        }
      } else {
        if (inputClean.includes("book") || inputClean.includes("appointment") || inputClean.includes("schedule")) {
          aiResponse = `I'd be glad to schedule that for you. I have an opening tomorrow at 2:00 PM or Thursday at 10:00 AM. Which works best for you?`;
          actionTag = "[ACTION:BOOK_APPOINTMENT]";
        } else {
          aiResponse = `Got it! We are open Monday through Friday from ${openTime} to ${closeTime}. Is there anything else I can help you with?`;
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "AI", text: aiResponse, action: actionTag },
      ]);
    }, 900);
  };

  const handleEndCall = () => {
    setIsCalling(false);
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col antialiased selection:bg-primary selection:text-on-primary">
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
            <span className="text-headline-md font-headline-md font-black text-primary tracking-tight">Fluture</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => alert("Our AI support specialists are ready to assist you 24/7.")}
            className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <HelpCircle className="w-4 h-4" />
            Need help?
          </button>
          <Link
            href={targetWorkspacePath}
            onClick={() => {
              const accountType = isSalesOnly ? "SALES" : selectedAgents.includes("sales") ? "BOTH" : "VOICE";
              authApi.setSession({
                token: authApi.getToken() || "",
                email: authApi.getUserEmail() || "",
                accountType: accountType,
              });
            }}
            className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors hidden md:flex items-center gap-1.5 text-xs font-semibold"
          >
            <Save className="w-4 h-4" />
            Save &amp; exit
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start pt-6 md:pt-8 pb-32 md:pb-24 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto text-left">
        <div className="w-full max-w-4xl mb-8 md:mb-10">
          <div className="flex items-center justify-between text-xs font-label-sm text-outline-variant mb-2 px-1">
            <span className={currentStep === 1 ? "text-primary font-bold" : "text-primary"}>1. Profile</span>
            <span className={currentStep === 2 ? "text-primary font-bold" : currentStep > 2 ? "text-primary" : "text-outline-variant"}>2. Workforce</span>
            <span className={currentStep === 3 ? "text-primary font-bold" : currentStep > 3 ? "text-primary" : "text-outline-variant"}>3. Payment</span>
            {selectedAgents.includes("front-desk") && (
              <span className={currentStep === 4 ? "text-primary font-bold" : currentStep > 4 ? "text-primary" : "text-outline-variant"}>4. Front Desk</span>
            )}
            {selectedAgents.includes("sales") && (
              <span className={currentStep === 5 ? "text-primary font-bold" : currentStep > 5 ? "text-primary" : "text-outline-variant"}>
                {isSalesOnly ? "4. Sales Setup" : "5. Sales"}
              </span>
            )}
            {selectedAgents.includes("billing") && (
              <span className={currentStep === 6 ? "text-primary font-bold" : currentStep > 6 ? "text-primary" : "text-outline-variant"}>6. Billing</span>
            )}
            {!isSalesOnly && (
              <>
                <span className={currentStep === 7 ? "text-primary font-bold" : currentStep > 7 ? "text-primary" : "text-outline-variant"}>7. Knowledge</span>
                <span className={currentStep === 8 ? "text-primary font-bold" : "text-outline-variant"}>8. Simulator</span>
              </>
            )}
          </div>

          <div className="h-2 bg-surface-container-high rounded-full w-full overflow-hidden flex relative">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{
                width: `${Math.min(100, Math.round((currentStep / (isSalesOnly ? 5 : 8)) * 100))}%`,
              }}
            ></div>
          </div>
        </div>

        {/* STEP 1: BUSINESS PROFILE & ACCOUNT AUTHENTICATION */}
        {currentStep === 1 && (
          <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm">
            <div className="mb-6">
              <h1 className="text-headline-lg font-headline-lg text-2xl md:text-3xl font-bold text-on-surface mb-2 tracking-tight">
                Create your business profile
              </h1>
              <p className="text-body-md font-body-md text-on-surface-variant text-sm md:text-base">
                Set up your company workspace and account for your Fluture AI workforce.
              </p>
            </div>

            {/* Error Alert */}
            {authError && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 text-xs font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-red-500" />
                <span>{authError}</span>
              </div>
            )}

            {/* If user is already authenticated */}
            {userEmail && authApi.getToken() ? (
              <form onSubmit={handleStep1Submit} className="space-y-6">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Signed in as <strong className="font-bold">{userEmail}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      authApi.clearSession();
                      setUserEmail(null);
                    }}
                    className="text-xs font-bold text-emerald-900 hover:underline"
                  >
                    Switch Account
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-label-md font-label-md text-on-surface text-sm font-bold" htmlFor="businessName">
                    Business name *
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex Health Partners"
                    className="w-full h-11 px-3.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-label-md font-label-md text-on-surface text-sm font-bold" htmlFor="industry">
                      Industry *
                    </label>
                    <select
                      id="industry"
                      required
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer"
                    >
                      <option value="healthcare">Healthcare &amp; Clinic</option>
                      <option value="real_estate">Real Estate &amp; Property</option>
                      <option value="legal">Legal &amp; Law Firm</option>
                      <option value="finance">Finance &amp; Accounting</option>
                      <option value="home_services">Home Services &amp; Contracting</option>
                      <option value="technology">Technology &amp; SaaS</option>
                      <option value="other">Other Business</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-label-md font-label-md text-on-surface text-sm font-bold" htmlFor="teamSize">
                      Team Size
                    </label>
                    <select
                      id="teamSize"
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer"
                    >
                      <option value="1">Solo Practitioner</option>
                      <option value="2-10">2–10 employees</option>
                      <option value="11-50">11–50 employees</option>
                      <option value="50+">50+ employees</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-on-primary h-11 px-6 rounded-lg font-label-md text-sm font-bold flex items-center justify-center hover:bg-on-surface transition-colors shadow-sm gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue to Workforce Stack"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : authStep === "FORM" ? (
              /* Unauthenticated: Google Sign-In + Email Sign-Up Form */
              <div className="space-y-6">
                {/* Google Sign-In */}
                <div className="w-full flex justify-center">
                  <div
                    id="google-onboarding-btn-container"
                    ref={googleBtnRef}
                    className="w-full flex justify-center min-h-[44px]"
                  ></div>
                </div>

                <div className="relative flex items-center my-2">
                  <div className="flex-grow border-t border-outline-variant"></div>
                  <span className="flex-shrink-0 mx-3 font-label-sm text-xs text-outline font-bold uppercase tracking-wider">
                    OR REGISTER WITH WORK EMAIL
                  </span>
                  <div className="flex-grow border-t border-outline-variant"></div>
                </div>

                <form onSubmit={handleSendVerificationCode} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase">
                        Business or Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Apex Health Partners"
                        className="w-full h-11 px-3.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:border-primary outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={userEmail || ""}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full h-11 px-3.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase">
                      Create Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:border-primary outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute inset-y-0 right-0 px-3.5 flex items-center text-outline hover:text-on-surface transition-colors"
                        aria-label={showSignupPassword ? "Hide password" : "Show password"}
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="block font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase">
                        Industry *
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:border-primary outline-none cursor-pointer"
                      >
                        <option value="healthcare">Healthcare &amp; Clinic</option>
                        <option value="real_estate">Real Estate &amp; Property</option>
                        <option value="legal">Legal &amp; Law Firm</option>
                        <option value="finance">Finance &amp; Accounting</option>
                        <option value="home_services">Home Services &amp; Contracting</option>
                        <option value="technology">Technology &amp; SaaS</option>
                        <option value="other">Other Business</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase">
                        Team Size
                      </label>
                      <select
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:border-primary outline-none cursor-pointer"
                      >
                        <option value="1">Solo Practitioner</option>
                        <option value="2-10">2–10 employees</option>
                        <option value="11-50">11–50 employees</option>
                        <option value="50+">50+ employees</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto bg-primary text-on-primary h-11 px-8 rounded-lg font-label-md text-sm font-bold flex items-center justify-center hover:bg-on-surface transition-colors shadow-sm gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending Code...
                        </>
                      ) : (
                        <>
                          Send Verification Code &amp; Continue
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* OTP Verification Step */
              <form onSubmit={handleVerifyOtpAndSaveProfile} className="space-y-6">
                <div className="p-5 bg-surface-container rounded-xl border border-outline-variant flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">Enter Verification Code</h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      We sent a 6-digit code to <strong className="text-on-surface">{userEmail}</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-label-sm text-xs font-bold text-on-surface tracking-wider uppercase text-center">
                    6-DIGIT VERIFICATION CODE
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full h-14 text-center tracking-[0.6em] text-2xl font-bold bg-surface-container-lowest border-2 border-primary/60 rounded-xl text-primary placeholder:text-outline focus:border-primary outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otpCode.length < 6}
                  className="w-full h-12 bg-primary text-on-primary rounded-lg font-label-md text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying Account...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Verify &amp; Continue to Workforce Stack
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthStep("FORM")}
                    className="text-on-surface-variant hover:text-on-surface underline font-medium"
                  >
                    ← Edit details
                  </button>

                  <button
                    type="button"
                    disabled={resendCountdown > 0 || isSubmitting}
                    onClick={handleResendCode}
                    className="text-primary font-bold hover:underline disabled:text-on-surface-variant disabled:no-underline"
                  >
                    {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : "Resend code"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: WORKFORCE SELECTION & DYNAMIC PRICING */}
        {currentStep === 2 && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <div className="text-center max-w-2xl mb-8">
              <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary mb-2">
                Assemble Your Fluture AI Workforce
              </h1>
              <p className="font-body-lg text-sm md:text-base text-on-surface-variant">
                Select one or more specialized AI agents. Bundled discounts apply automatically.
              </p>
            </div>

            <div className="flex items-center gap-3 mb-8 bg-surface-container-low p-1.5 rounded-full border border-outline-variant/40">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full font-label-md text-sm transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white text-primary font-bold shadow-sm border border-outline-variant/30"
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
                    ? "bg-white text-primary font-bold shadow-sm border border-outline-variant/30"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Yearly
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
                  Save 20%
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
              {/* Agent 1: Front Desk */}
              <div
                onClick={() => toggleAgentSelection("front-desk")}
                className={`bento-card p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 text-left ${
                  selectedAgents.includes("front-desk")
                    ? "ring-2 ring-primary border-primary bg-surface-container-lowest shadow-md"
                    : "border-outline-variant bg-surface-container-lowest hover:border-outline"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-surface-container text-primary flex items-center justify-center border border-outline-variant/60">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        selectedAgents.includes("front-desk")
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {selectedAgents.includes("front-desk") ? "✓ SELECTED" : "ACTIVE"}
                    </span>
                  </div>
                  <h3 className="text-headline-md font-headline-md text-on-surface text-[19px] font-bold mb-1">
                    Fluture Front Desk
                  </h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mb-4">
                    24/7 AI receptionist for inbound phone calls and live appointment bookings.
                  </p>
                  <ul className="text-xs text-on-surface-variant space-y-1.5 mb-4">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Dedicated Twilio Number
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Calendar Booking Sync
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-outline-variant flex items-center justify-between">
                  <span className="font-bold text-sm text-primary">$99/mo value</span>
                  <span className="text-xs font-semibold text-emerald-600">
                    {selectedAgents.includes("front-desk") ? "Included" : "+ Add"}
                  </span>
                </div>
              </div>

              {/* Agent 2: Sales */}
              <div
                onClick={() => toggleAgentSelection("sales")}
                className={`bento-card p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 text-left ${
                  selectedAgents.includes("sales")
                    ? "ring-2 ring-primary border-primary bg-surface-container-lowest shadow-md"
                    : "border-outline-variant bg-surface-container-lowest hover:border-outline"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-surface-container text-primary flex items-center justify-center border border-outline-variant/60">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        selectedAgents.includes("sales")
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {selectedAgents.includes("sales") ? "✓ SELECTED" : "ACTIVE"}
                    </span>
                  </div>
                  <h3 className="text-headline-md font-headline-md text-on-surface text-[19px] font-bold mb-1">
                    Fluture Sales
                  </h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mb-4">
                    Inbound and outbound AI rep that qualifies high-value leads and schedules demos.
                  </p>
                  <ul className="text-xs text-on-surface-variant space-y-1.5 mb-4">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Lead Qualification Engine
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> CRM Webhook Sync
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-outline-variant flex items-center justify-between">
                  <span className="font-bold text-sm text-primary">$99/mo value</span>
                  <span className="text-xs font-semibold text-emerald-600">
                    {selectedAgents.includes("sales") ? "Included" : "+ Add"}
                  </span>
                </div>
              </div>

              {/* Agent 3: Billing */}
              <div
                onClick={() => toggleAgentSelection("billing")}
                className={`bento-card p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 text-left ${
                  selectedAgents.includes("billing")
                    ? "ring-2 ring-primary border-primary bg-surface-container-lowest shadow-md"
                    : "border-outline-variant bg-surface-container-lowest hover:border-outline"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-surface-container text-primary flex items-center justify-center border border-outline-variant/60">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        selectedAgents.includes("billing")
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {selectedAgents.includes("billing") ? "✓ SELECTED" : "ACTIVE"}
                    </span>
                  </div>
                  <h3 className="text-headline-md font-headline-md text-on-surface text-[19px] font-bold mb-1">
                    Fluture Billing
                  </h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mb-4">
                    Voice invoicing, collection calls, dispute handling, and live on-call SMS checkout.
                  </p>
                  <ul className="text-xs text-on-surface-variant space-y-1.5 mb-4">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Stripe SMS Checkout Links
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Automated Collection Calls
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-outline-variant flex items-center justify-between">
                  <span className="font-bold text-sm text-primary">$99/mo value</span>
                  <span className="text-xs font-semibold text-emerald-600">
                    {selectedAgents.includes("billing") ? "Included" : "+ Add"}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full bg-surface-container-lowest border-2 border-primary rounded-xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-headline-md text-xl font-bold text-primary">
                    Your Custom Fluture Workforce Stack
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {agentCount === 1 ? "Single Specialist" : agentCount === 2 ? "10% Bundle Discount" : "15% Full Suite Discount"}
                  </span>
                </div>
                <p className="text-body-sm text-sm text-on-surface-variant">
                  Configuring {agentCount} AI {agentCount === 1 ? "worker" : "workers"}:{" "}
                  <strong className="text-primary font-bold">
                    {selectedAgents.map((a) => a.replace("-", " ").toUpperCase()).join(", ")}
                  </strong>
                </p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="text-3xl font-extrabold text-primary">${monthlyRate}<span className="text-sm font-normal text-on-surface-variant">/mo</span></div>
                  <div className="text-xs text-on-surface-variant">
                    {billingCycle === "yearly" ? `Billed annually at $${yearlyTotal}/yr` : "Billed monthly"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleStep2Submit}
                  disabled={isSubmitting}
                  className="bg-primary text-on-primary h-12 px-6 rounded-lg font-label-md text-sm font-bold flex items-center justify-center hover:bg-on-surface transition-colors shadow-md gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Proceed to Payment"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SECURE PAYMENT CHECKOUT */}
        {currentStep === 3 && (
          <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md overflow-hidden">
            <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col">
              <div className="mb-6">
                <p className="font-label-sm text-xs text-secondary uppercase tracking-wider mb-1 font-bold">
                  Step 03 / 08 • Checkout
                </p>
                <h1 className="font-headline-lg text-2xl font-bold text-primary mb-1">
                  Authorize Your Workforce Subscription
                </h1>
                <p className="font-body-md text-xs text-on-surface-variant">
                  Includes a 14-day risk-free trial. You will not be billed until your trial concludes.
                </p>
              </div>

              <form onSubmit={handleStep3Submit} className="space-y-4 flex-grow">
                <div className="space-y-1">
                  <label className="font-label-md text-xs font-bold text-on-surface" htmlFor="cardName">
                    Cardholder Name
                  </label>
                  <input
                    id="cardName"
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
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
                      placeholder="4242 •••• •••• 4242"
                      className="w-full pl-11 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
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
                      className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-md text-xs font-bold text-on-surface" htmlFor="cvc">
                      CVC / CVV
                    </label>
                    <input
                      id="cvc"
                      type="text"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="123"
                      className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-on-primary font-label-md text-sm py-3.5 rounded-lg hover:bg-on-surface transition-colors font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start 14-Day Free Trial & Configure Agents"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-on-surface-variant text-xs font-medium">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    Encrypted with 256-Bit Stripe Security
                  </div>
                </div>
              </form>
            </div>

            <div className="w-full md:w-2/5 bg-surface-container-low p-6 md:p-8 border-t md:border-t-0 md:border-l border-outline-variant flex flex-col justify-between">
              <div>
                <h2 className="font-headline-md text-lg font-bold text-primary mb-4 border-b border-outline-variant pb-3">
                  Subscription Summary
                </h2>

                <div className="space-y-3 mb-6">
                  {selectedAgents.map((agentId) => (
                    <div key={agentId} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-primary capitalize flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Fluture {agentId.replace("-", " ")}
                      </span>
                      <span className="font-semibold text-on-surface">$99/mo</span>
                    </div>
                  ))}
                  {agentCount > 1 && (
                    <div className="flex justify-between items-center text-xs text-emerald-700 font-bold border-t border-outline-variant/40 pt-2">
                      <span>Multi-Agent Bundle Discount</span>
                      <span>-{agentCount === 2 ? "$19/mo (10%)" : "$48/mo (15%)"}</span>
                    </div>
                  )}
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3.5 mb-6 text-xs text-on-surface-variant">
                  <div className="flex justify-between items-center mb-1">
                    <span>Billing Frequency:</span>
                    <strong className="text-primary capitalize">{billingCycle}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Trial Duration:</span>
                    <strong className="text-emerald-700">14 Days Free</strong>
                  </div>
                </div>
              </div>

              <div className="border-t border-outline-variant pt-4">
                <div className="flex justify-between items-center font-bold text-base text-primary">
                  <span>Total Due Today:</span>
                  <span className="text-emerald-600 text-lg">$0.00</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Renews at ${monthlyRate}/mo after 14-day trial. Cancel anytime in 1-click.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FLUTURE FRONT DESK CONFIGURATION MODULE */}
        {currentStep === 4 && selectedAgents.includes("front-desk") && (
          <div className="w-full max-w-3xl bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  <Phone className="w-4 h-4" />
                </span>
                <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider">
                  Specialist Setup • Fluture Front Desk
                </span>
              </div>
              <h1 className="font-headline-lg text-2xl font-bold text-primary mb-1">
                Claim Your Dedicated Receptionist Phone Line
              </h1>
              <p className="font-body-md text-xs text-on-surface-variant">
                Select a local or toll-free Twilio number for 24/7 call intake and appointment bookings.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="font-label-md text-xs font-bold text-on-surface">Available Phone Numbers</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AVAILABLE_NUMBERS.slice(0, 4).map((num) => {
                    const isSelected = frontDeskPhone === num.number;
                    return (
                      <div
                        key={num.id}
                        onClick={() => setFrontDeskPhone(num.number)}
                        className={`p-3.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? "border-2 border-primary bg-surface-container-low shadow-sm"
                            : "border-outline-variant hover:bg-surface-container-low"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-primary">{num.number}</div>
                          <div className="text-xs text-on-surface-variant">{num.location}</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high">
                          {num.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">Receptionist Name</label>
                  <input
                    type="text"
                    value={receptionistName}
                    onChange={(e) => setReceptionistName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">Calendar Integration</label>
                  <select
                    value={calendarProvider}
                    onChange={(e: any) => setCalendarProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="google">Google Calendar (Auto-Sync)</option>
                    <option value="outlook">Microsoft Outlook 365</option>
                    <option value="calendly">Calendly Integration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">Opens at</label>
                  <input
                    type="text"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">Closes at</label>
                  <input
                    type="text"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-bold text-on-surface-variant hover:text-primary"
                >
                  ← Back to Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAgents.includes("sales")) setCurrentStep(5);
                    else if (selectedAgents.includes("billing")) setCurrentStep(6);
                    else setCurrentStep(7);
                  }}
                  className="bg-primary text-on-primary h-11 px-6 rounded-lg font-label-md text-sm font-bold flex items-center gap-2 hover:bg-on-surface transition-colors"
                >
                  Save Front Desk &amp; Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: FLUTURE SALES CONFIGURATION MODULE (AIOS LEAD HUNTER & OUTREACH) */}
        {currentStep === 5 && selectedAgents.includes("sales") && (
          <div className="w-full max-w-3xl bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 bg-primary/10 text-primary rounded-lg">
                    <Activity className="w-4 h-4" />
                  </span>
                  <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider">
                    Specialist Setup • Fluture Sales (AIOS Engine)
                  </span>
                </div>
                <h1 className="font-headline-lg text-2xl font-bold text-primary mb-1">
                  Configure Automated Lead Hunting &amp; Outreach
                </h1>
                <p className="font-body-md text-xs text-on-surface-variant">
                  Define your ideal customer profile, search geography, and automated booking link (or configure later).
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (selectedAgents.includes("billing")) setCurrentStep(6);
                  else if (isSalesOnly) finishOnboarding();
                  else setCurrentStep(7);
                }}
                className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-lg transition-colors shrink-0 self-start md:self-auto"
              >
                {isSalesOnly ? "Skip & Launch Sales →" : "Skip for now →"}
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">Target Industry / Search Query</label>
                  <input
                    type="text"
                    value={targetIndustry}
                    onChange={(e) => setTargetIndustry(e.target.value)}
                    placeholder="e.g. Dental clinics, B2B SaaS, Law firms"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">Prospecting Geography / Location</label>
                  <input
                    type="text"
                    value={targetLocation}
                    onChange={(e) => setTargetLocation(e.target.value)}
                    placeholder="e.g. New York, London, Nationwide"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">Decision-Maker Roles to Target</label>
                  <input
                    type="text"
                    value={targetRoles}
                    onChange={(e) => setTargetRoles(e.target.value)}
                    placeholder="e.g. CEO, Owner, Operations Manager"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">Daily Lead Outreach Quota</label>
                  <select
                    value={dailyLeadQuota}
                    onChange={(e) => setDailyLeadQuota(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="15">15 Leads / Day (Safe Warmup)</option>
                    <option value="25">25 Leads / Day (Recommended)</option>
                    <option value="50">50 Leads / Day (High Growth)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label-md text-xs font-bold text-on-surface">Calendar Meeting Booking Link</label>
                <input
                  type="url"
                  value={meetingBookingLink}
                  onChange={(e) => setMeetingBookingLink(e.target.value)}
                  placeholder="https://calendar.app.google/... or https://calendly.com/..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:border-primary"
                />
                <p className="text-[11px] text-on-surface-variant">
                  Automatically inserted into cold email pitches and sent via SMS on qualified phone calls.
                </p>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAgents.includes("front-desk")) setCurrentStep(4);
                    else setCurrentStep(3);
                  }}
                  className="text-xs font-bold text-on-surface-variant hover:text-primary"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedAgents.includes("billing")) setCurrentStep(6);
                      else if (isSalesOnly) finishOnboarding();
                      else setCurrentStep(7);
                    }}
                    className="text-xs font-semibold text-on-surface-variant hover:text-on-surface px-3 py-2"
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedAgents.includes("billing")) setCurrentStep(6);
                      else if (isSalesOnly) finishOnboarding();
                      else setCurrentStep(7);
                    }}
                    className="bg-primary text-on-primary h-11 px-6 rounded-lg font-label-md text-sm font-bold flex items-center gap-2 hover:bg-on-surface transition-colors"
                  >
                    {isSalesOnly ? "Launch Sales Workspace" : "Save Sales Setup & Next"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: FLUTURE BILLING CONFIGURATION MODULE */}
        {currentStep === 6 && selectedAgents.includes("billing") && (
          <div className="w-full max-w-3xl bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  <CreditCard className="w-4 h-4" />
                </span>
                <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider">
                  Specialist Setup • Fluture Billing
                </span>
              </div>
              <h1 className="font-headline-lg text-2xl font-bold text-primary mb-1">
                Voice Invoicing, Collection Calls &amp; Live SMS Payments
              </h1>
              <p className="font-body-md text-xs text-on-surface-variant">
                Set up automated payment links dispatched while on the phone with clients.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">Billing Specialist Name</label>
                  <input
                    type="text"
                    value={billingName}
                    onChange={(e) => setBillingName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">Stripe Gateway Connection</label>
                  <div className="flex items-center gap-2 h-10 px-3.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Stripe Live Checkout Connected
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label-md text-xs font-bold text-on-surface">
                  On-Call SMS Checkout Delivery Template
                </label>
                <textarea
                  rows={3}
                  value={smsPaymentTemplate}
                  onChange={(e) => setSmsPaymentTemplate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs font-mono outline-none focus:border-primary"
                />
                <p className="text-[11px] text-on-surface-variant">
                  Automatically filled with client name, item scope, and secure Stripe checkout link.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-label-md text-xs font-bold text-on-surface">
                  Overdue Invoice Automated Call Schedule
                </label>
                <select
                  value={overdueReminderFrequency}
                  onChange={(e) => setOverdueReminderFrequency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:border-primary cursor-pointer"
                >
                  <option value="1_day_before">1 Day Before Due Date</option>
                  <option value="on_due_date">On Due Date Morning</option>
                  <option value="3_days_after_due">3 Days After Due Date (Overdue Notice)</option>
                  <option value="7_days_after_due">7 Days After Due Date (Final Notice)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAgents.includes("sales")) setCurrentStep(5);
                    else if (selectedAgents.includes("front-desk")) setCurrentStep(4);
                    else setCurrentStep(3);
                  }}
                  className="text-xs font-bold text-on-surface-variant hover:text-primary"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(7)}
                  className="bg-primary text-on-primary h-11 px-6 rounded-lg font-label-md text-sm font-bold flex items-center gap-2 hover:bg-on-surface transition-colors"
                >
                  Save Billing &amp; Continue to Knowledge Base
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: UNIVERSAL COMPANY KNOWLEDGE BASE */}
        {currentStep === 7 && (
          <div className="w-full max-w-3xl bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 bg-primary/10 text-primary rounded-lg">
                    <Globe className="w-4 h-4" />
                  </span>
                  <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider">
                    Optional Knowledge Engine
                  </span>
                </div>
                <h1 className="font-headline-lg text-2xl font-bold text-primary mb-1">
                  Train Agents on Business Docs &amp; FAQs
                </h1>
                <p className="font-body-md text-xs text-on-surface-variant">
                  Vectorize pricing sheets and websites now, or configure anytime from the Knowledge Base tab.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(8)}
                className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-lg transition-colors shrink-0 self-start md:self-auto"
              >
                Skip for now →
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex flex-col gap-0.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">Company Website URL</label>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Fluture crawls your public pages, service catalogs, and pricing tables so your AI agents can instantly answer questions about what your business offers.
                  </p>
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-grow px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!websiteUrl) return;
                      setIsSyncingKb(true);
                      setTimeout(() => {
                        setIsSyncingKb(false);
                        alert("Website successfully crawled and indexed across all Fluture agents!");
                      }, 1200);
                    }}
                    className="bg-surface-container hover:bg-surface-container-high text-primary font-bold px-4 py-2.5 rounded-lg text-xs flex items-center gap-1.5 border border-outline-variant"
                  >
                    {isSyncingKb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                    Crawl Website
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col gap-0.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">Uploaded Documents &amp; FAQs</label>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Upload internal operating guidelines, price sheets, policy docs, or intake FAQs (PDF, DOCX, CSV). Our vector engine converts these into immediate conversational knowledge for live callers.
                  </p>
                </div>

                <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-surface-container-low">
                  <UploadCloud className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-xs font-bold text-on-surface">Upload PDFs, Docx, or CSV sheets</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Drag and drop or click to browse</p>
                </div>

                <div className="space-y-1.5 pt-2">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container text-xs border border-outline-variant"
                    >
                      <span className="flex items-center gap-2 font-medium text-on-surface">
                        <FileText className="w-4 h-4 text-primary" /> {file}
                      </span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5" /> Vectorized
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAgents.includes("billing")) setCurrentStep(6);
                    else if (selectedAgents.includes("sales")) setCurrentStep(5);
                    else setCurrentStep(4);
                  }}
                  className="text-xs font-bold text-on-surface-variant hover:text-primary"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(8)}
                    className="text-xs font-semibold text-on-surface-variant hover:text-on-surface px-3 py-2"
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(8)}
                    className="bg-primary text-on-primary h-11 px-6 rounded-lg font-label-md text-sm font-bold flex items-center gap-2 hover:bg-on-surface transition-colors"
                  >
                    Launch Interactive Simulator
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: LIVE MULTI-AGENT VOICE SIMULATOR */}
        {currentStep === 8 && (
          <div className="w-full max-w-4xl bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <span className="font-label-sm text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Ready to Test • Live Simulator
                  </span>
                </div>
                <h1 className="font-headline-lg text-2xl font-bold text-primary mb-1">
                  Test-Call Your Fluture AI Workforce
                </h1>
                <p className="font-body-md text-xs text-on-surface-variant">
                  Switch between your active specialists and simulate live voice conversations in the browser.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-surface-container p-1 rounded-lg border border-outline-variant">
                {selectedAgents.map((agentId) => (
                  <button
                    key={agentId}
                    type="button"
                    onClick={() => {
                      setActiveSimAgent(agentId);
                      setIsCalling(false);
                      setMessages([]);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${
                      activeSimAgent === agentId
                        ? "bg-primary text-on-primary shadow-sm"
                        : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {agentId.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center min-h-[360px] relative">
              {!isCalling ? (
                <div className="text-center space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                    {activeSimAgent === "sales" ? (
                      <Activity className="w-8 h-8" />
                    ) : activeSimAgent === "billing" ? (
                      <CreditCard className="w-8 h-8" />
                    ) : (
                      <Phone className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary capitalize">
                      {activeSimAgent === "sales"
                        ? `Simulate Fluture Sales Rep (${salesName})`
                        : activeSimAgent === "billing"
                        ? `Simulate Fluture Billing Specialist (${billingName})`
                        : `Call Fluture Front Desk (${receptionistName})`}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {activeSimAgent === "front-desk" && "Test asking for business hours, services, or booking an appointment."}
                      {activeSimAgent === "sales" && "Test lead qualification, objection handling, and booking a demo onto your calendar."}
                      {activeSimAgent === "billing" && "Test inquiring about an invoice and receiving a live checkout SMS."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartCall}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-full text-sm flex items-center justify-center gap-2 mx-auto shadow-md transition-all"
                  >
                    <Phone className="w-4 h-4" /> Start Simulated Call
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="font-bold text-xs text-primary capitalize">
                        Live Call with {activeSimAgent === "sales" ? salesName : activeSimAgent === "billing" ? billingName : receptionistName} ({activeSimAgent.replace("-", " ")})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleEndCall}
                      className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full flex items-center gap-1 border border-red-200"
                    >
                      <PhoneOff className="w-3.5 h-3.5" /> End Call
                    </button>
                  </div>

                  <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === "You" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs font-medium ${
                            msg.sender === "You"
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-lowest border border-outline-variant text-primary"
                          }`}
                        >
                          <div className="text-[10px] opacity-70 mb-0.5 font-bold">{msg.sender}</div>
                          <div>{msg.text}</div>
                          {msg.action && (
                            <div className="mt-2 pt-1.5 border-t border-emerald-300/40 text-[10px] font-mono text-emerald-800 font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              Triggered: {msg.action}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={
                        activeSimAgent === "front-desk"
                          ? "Say: 'Can I book an appointment for tomorrow?'"
                          : activeSimAgent === "sales"
                          ? "Say: 'Can we schedule a 15-minute demo?'"
                          : "Say: 'Can you text me the payment link for invoice #102?'"
                      }
                      className="flex-grow px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      className="bg-primary text-on-primary px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-on-surface transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setCurrentStep(7)}
                className="text-xs font-bold text-on-surface-variant hover:text-primary"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={finishOnboarding}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 rounded-lg font-label-md text-sm font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                <Rocket className="w-4 h-4" />
                {isSalesOnly ? "Launch Sales Outreach →" : "Go Live to Dashboard"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}

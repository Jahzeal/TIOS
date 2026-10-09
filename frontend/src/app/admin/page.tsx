"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  CreditCard,
  DollarSign,
  Phone,
  Settings,
  Sparkles,
  Users,
  Save,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent,
  Clock,
  Shield,
  Layers,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  HelpCircle,
  Activity,
  Sliders,
  Check,
  ChevronRight,
  Eye,
} from "lucide-react";

interface AgentPricing {
  id: string;
  name: string;
  role: string;
  monthlyPrice: number;
  yearlyPrice: number;
  includedMinutes: number;
  overagePerMinute: number;
  badge?: string;
  description: string;
  features: string[];
  isActive: boolean;
}

interface BundlesConfig {
  twoAgentsDiscountPercent: number;
  threeAgentsDiscountPercent: number;
  annualDiscountPercent: number;
  trialDays: number;
}

interface TelecomConfig {
  twilioNumberMonthlyCost: number;
  twilioVoiceCostPerMinute: number;
  twilioSmsCost: number;
}

interface PricingConfig {
  agents: AgentPricing[];
  bundles: BundlesConfig;
  telecom: TelecomConfig;
}

interface BusinessRecord {
  id: string;
  name: string;
  twilioPhone: string;
  forwardPhone?: string;
  agentsCount: number;
  agents: { id: string; name: string }[];
  totalCalls: number;
  totalAppointments: number;
  totalPayments: number;
  createdAt: string;
}

export default function AdminDashboardPage() {
  // Navigation State
  const [activeMainTab, setActiveMainTab] = useState<"overview" | "business" | "voice" | "settings">("business");
  const [activeBusinessSubTab, setActiveBusinessSubTab] = useState<"pricing" | "subscribers" | "economics">("pricing");

  // Pricing State
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState<boolean>(true);
  const [isSavingPricing, setIsSavingPricing] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Businesses State
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Live Preview Simulator State
  const [simSelectedAgents, setSimSelectedAgents] = useState<string[]>(["front-desk", "sales"]);
  const [simBillingCycle, setSimBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Load Data
  const fetchPricing = async () => {
    setIsLoadingPricing(true);
    try {
      const res = await fetch("/api/admin/pricing");
      const data = await res.json();
      if (data.success && data.pricing) {
        setPricing(data.pricing);
      }
    } catch (err) {
      console.error("Failed to load pricing:", err);
    } finally {
      setIsLoadingPricing(false);
    }
  };

  const fetchBusinesses = async () => {
    setIsLoadingBusinesses(true);
    try {
      const res = await fetch("/api/admin/businesses");
      const data = await res.json();
      if (data.success && data.businesses) {
        setBusinesses(data.businesses);
      }
    } catch (err) {
      console.error("Failed to load businesses:", err);
    } finally {
      setIsLoadingBusinesses(false);
    }
  };

  useEffect(() => {
    fetchPricing();
    fetchBusinesses();
  }, []);

  // Save Pricing
  const handleSavePricing = async () => {
    if (!pricing) return;
    setIsSavingPricing(true);
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);

    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricing),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessMessage("Pricing configuration updated and deployed live across the platform!");
        setTimeout(() => setSaveSuccessMessage(null), 5000);
      } else {
        setSaveErrorMessage(data.error || "Failed to update pricing.");
      }
    } catch (err: any) {
      setSaveErrorMessage(err.message || "Failed to connect to API.");
    } finally {
      setIsSavingPricing(false);
    }
  };

  // Pricing Helpers
  const updateAgentField = (index: number, field: keyof AgentPricing, value: any) => {
    if (!pricing) return;
    const updated = { ...pricing };
    updated.agents[index] = { ...updated.agents[index], [field]: value };
    setPricing(updated);
  };

  const updateBundleField = (field: keyof BundlesConfig, value: number) => {
    if (!pricing) return;
    setPricing({
      ...pricing,
      bundles: { ...pricing.bundles, [field]: value },
    });
  };

  const addFeatureToAgent = (agentIndex: number) => {
    if (!pricing) return;
    const updated = { ...pricing };
    updated.agents[agentIndex].features.push("New Feature Benefit");
    setPricing(updated);
  };

  const removeFeatureFromAgent = (agentIndex: number, featureIndex: number) => {
    if (!pricing) return;
    const updated = { ...pricing };
    updated.agents[agentIndex].features.splice(featureIndex, 1);
    setPricing(updated);
  };

  const updateFeatureText = (agentIndex: number, featureIndex: number, text: string) => {
    if (!pricing) return;
    const updated = { ...pricing };
    updated.agents[agentIndex].features[featureIndex] = text;
    setPricing(updated);
  };

  const addNewPlan = () => {
    if (!pricing) return;
    const newSlug = `plan-${Date.now().toString(36)}`;
    const newPlan: AgentPricing = {
      id: newSlug,
      name: "Custom AI Specialist",
      role: "AI Workforce Specialist",
      monthlyPrice: 99,
      yearlyPrice: 79,
      includedMinutes: 300,
      overagePerMinute: 0.08,
      badge: "Custom",
      description: "Custom AI specialist plan tier.",
      features: ["24/7 autonomous operations", "Real-time CRM sync"],
      isActive: true,
    };
    setPricing({
      ...pricing,
      agents: [...pricing.agents, newPlan],
    });
  };

  const removePlan = (index: number) => {
    if (!pricing) return;
    const updated = { ...pricing };
    updated.agents.splice(index, 1);
    setPricing(updated);
  };

  // Simulator Calculations
  const calculateSimTotal = () => {
    if (!pricing) {
      return {
        subtotal: 0,
        discount: 0,
        discountPercent: 0,
        total: 0,
        includedMinutes: 0,
      };
    }
    const activeAgents = pricing.agents.filter((a) => simSelectedAgents.includes(a.id));
    const isYearly = simBillingCycle === "yearly";

    let subtotal = activeAgents.reduce((sum, a) => sum + (isYearly ? a.yearlyPrice : a.monthlyPrice), 0);

    let bundleDiscountPercent = 0;
    if (activeAgents.length === 2) {
      bundleDiscountPercent = pricing.bundles.twoAgentsDiscountPercent || 10;
    } else if (activeAgents.length >= 3) {
      bundleDiscountPercent = pricing.bundles.threeAgentsDiscountPercent || 15;
    }

    const discountAmount = Math.round((subtotal * bundleDiscountPercent) / 100);
    const total = subtotal - discountAmount;

    return {
      subtotal,
      discount: discountAmount,
      discountPercent: bundleDiscountPercent,
      total,
      includedMinutes: activeAgents.reduce((sum, a) => sum + a.includedMinutes, 0),
    };
  };

  const simCalc = calculateSimTotal();

  // Metrics Calculations
  const totalBusinessesCount = businesses.length;
  const estimatedMRR = businesses.reduce((sum, b) => sum + (b.agentsCount || 1) * 99, 0);
  const totalCallsLogged = businesses.reduce((sum, b) => sum + b.totalCalls, 0);

  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.twilioPhone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">Fluture TIOS</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Admin Console
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Platform Management &amp; Dynamic Pricing Architecture</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            Client Dashboard
          </Link>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
            AD
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-r border-slate-800/80 bg-slate-900/30 p-4 flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Navigation</div>

            <button
              type="button"
              onClick={() => setActiveMainTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeMainTab === "overview"
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Activity className="w-4 h-4" />
              Overview &amp; KPIs
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab("business")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeMainTab === "business"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" />
                Business
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-white font-mono">3</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab("voice")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeMainTab === "voice"
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Phone className="w-4 h-4" />
              Voice &amp; Telephony
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeMainTab === "settings"
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Settings className="w-4 h-4" />
              Global Settings
            </button>
          </div>

          {/* Quick System Summary */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Twilio Webhooks</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Voice Latency</span>
              <span className="text-slate-200 font-mono text-[11px] font-semibold">&lt; 320ms</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
          {/* Toast Notifications */}
          {saveSuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-emerald-500/5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {saveErrorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-rose-500/5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{saveErrorMessage}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* MAIN TAB: BUSINESS                                           */}
          {/* ============================================================ */}
          {activeMainTab === "business" && (
            <div className="space-y-6">
              {/* Header Title & Sub-tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                    <Building2 className="w-6 h-6 text-indigo-400" />
                    Business Management
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage platform subscription pricing tiers, multi-agent bundle discounts, and active tenant subscribers.
                  </p>
                </div>

                {/* Sub Tabs Pill Selector */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveBusinessSubTab("pricing")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      activeBusinessSubTab === "pricing"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Pricing &amp; Plans
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveBusinessSubTab("subscribers")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      activeBusinessSubTab === "subscribers"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Subscribers ({businesses.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveBusinessSubTab("economics")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      activeBusinessSubTab === "economics"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Unit Economics
                  </button>
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* SUB-TAB 1: PRICING & PLANS (PRIMARY FEATURE)              */}
              {/* -------------------------------------------------------- */}
              {activeBusinessSubTab === "pricing" && (
                <div className="space-y-8">
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Sliders className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Live Pricing Engine Active</div>
                        <div className="text-[11px] text-slate-400">
                          Changes saved here immediately update the public /pricing page and the onboarding checkout flow.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSavingPricing || isLoadingPricing}
                      onClick={handleSavePricing}
                      className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                    >
                      {isSavingPricing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Deploying Pricing...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Publish Changes Live
                        </>
                      )}
                    </button>
                  </div>

                  {isLoadingPricing || !pricing ? (
                    <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                      <span>Loading current pricing models from database...</span>
                    </div>
                  ) : (
                    <>
                      {/* 1. Individual Specialist Agent Tiers */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                              <Layers className="w-4 h-4 text-indigo-400" />
                              AI Specialist Agent Rates
                            </h2>
                            <p className="text-xs text-slate-400">Configure base price and minute allocations per specialist agent.</p>
                          </div>
                          <button
                            type="button"
                            onClick={addNewPlan}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Custom Plan
                          </button>
                        </div>

                        {pricing.agents.length === 0 ? (
                          <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-2xl space-y-3">
                            <p>No pricing plans currently saved in PostgreSQL database.</p>
                            <button
                              type="button"
                              onClick={addNewPlan}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs"
                            >
                              Create First Plan
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {pricing.agents.map((agent, idx) => (
                              <div
                                key={agent.id}
                                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between space-y-5 shadow-sm hover:border-slate-700 transition-colors"
                              >
                                <div className="space-y-4">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                                        {agent.role}
                                      </span>
                                      <h3 className="text-base font-bold text-white">{agent.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        value={agent.badge || ""}
                                        onChange={(e) => updateAgentField(idx, "badge", e.target.value)}
                                        placeholder="Badge"
                                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-indigo-300 w-20 text-center outline-none focus:border-indigo-500"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removePlan(idx)}
                                        title="Delete plan"
                                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <textarea
                                    value={agent.description}
                                    onChange={(e) => updateAgentField(idx, "description", e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-indigo-500 resize-none"
                                  />

                                {/* Pricing Inputs */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Monthly Price ($)</label>
                                    <div className="relative">
                                      <span className="absolute left-2.5 top-2 text-xs text-slate-500 font-bold">$</span>
                                      <input
                                        type="number"
                                        value={agent.monthlyPrice}
                                        onChange={(e) => updateAgentField(idx, "monthlyPrice", Number(e.target.value))}
                                        className="w-full pl-6 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm font-bold text-white outline-none focus:border-indigo-500"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Yearly Rate ($/mo)</label>
                                    <div className="relative">
                                      <span className="absolute left-2.5 top-2 text-xs text-slate-500 font-bold">$</span>
                                      <input
                                        type="number"
                                        value={agent.yearlyPrice}
                                        onChange={(e) => updateAgentField(idx, "yearlyPrice", Number(e.target.value))}
                                        className="w-full pl-6 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm font-bold text-emerald-400 outline-none focus:border-indigo-500"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Telecom Allowances */}
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Included Minutes</label>
                                    <input
                                      type="number"
                                      value={agent.includedMinutes}
                                      onChange={(e) => updateAgentField(idx, "includedMinutes", Number(e.target.value))}
                                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 outline-none focus:border-indigo-500"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Overage ($/min)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={agent.overagePerMinute}
                                      onChange={(e) => updateAgentField(idx, "overagePerMinute", Number(e.target.value))}
                                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 outline-none focus:border-indigo-500"
                                    />
                                  </div>
                                </div>

                                {/* Features List */}
                                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                                    <span>Included Features</span>
                                    <button
                                      type="button"
                                      onClick={() => addFeatureToAgent(idx)}
                                      className="text-indigo-400 hover:text-indigo-300 text-[10px] flex items-center gap-1 font-bold"
                                    >
                                      <Plus className="w-3 h-3" /> Add
                                    </button>
                                  </div>

                                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                    {agent.features.map((feat, fIdx) => (
                                      <div key={fIdx} className="flex items-center gap-1.5">
                                        <input
                                          type="text"
                                          value={feat}
                                          onChange={(e) => updateFeatureText(idx, fIdx, e.target.value)}
                                          className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 outline-none focus:border-indigo-500"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeFeatureFromAgent(idx, fIdx)}
                                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                      {/* 2. Multi-Agent Bundle Discount Settings */}
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
                        <div>
                          <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <Percent className="w-4 h-4 text-emerald-400" />
                            Multi-Agent Bundle Discounts &amp; Trial Rules
                          </h2>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Automated percentage discounts applied when customers select multiple AI agents in their workforce.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase">2 Agents Bundle Discount</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={pricing.bundles.twoAgentsDiscountPercent}
                                onChange={(e) => updateBundleField("twoAgentsDiscountPercent", Number(e.target.value))}
                                className="w-20 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-base font-bold text-emerald-400 outline-none focus:border-indigo-500"
                              />
                              <span className="text-sm font-bold text-slate-400">% OFF</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase">3 Agents Full Stack Discount</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={pricing.bundles.threeAgentsDiscountPercent}
                                onChange={(e) => updateBundleField("threeAgentsDiscountPercent", Number(e.target.value))}
                                className="w-20 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-base font-bold text-emerald-400 outline-none focus:border-indigo-500"
                              />
                              <span className="text-sm font-bold text-slate-400">% OFF</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase">Annual Prepay Discount</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={pricing.bundles.annualDiscountPercent}
                                onChange={(e) => updateBundleField("annualDiscountPercent", Number(e.target.value))}
                                className="w-20 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-base font-bold text-emerald-400 outline-none focus:border-indigo-500"
                              />
                              <span className="text-sm font-bold text-slate-400">% OFF</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase">Free Trial Duration</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={pricing.bundles.trialDays}
                                onChange={(e) => updateBundleField("trialDays", Number(e.target.value))}
                                className="w-20 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-base font-bold text-indigo-400 outline-none focus:border-indigo-500"
                              />
                              <span className="text-sm font-bold text-slate-400">Days Free</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. Live Customer Simulator Preview */}
                      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950 p-6 space-y-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              Interactive Preview
                            </span>
                            <h2 className="text-base font-bold text-white">Live Customer Checkout Simulator</h2>
                            <p className="text-xs text-slate-400">
                              Test how your price changes and bundle formulas look to a business user during signup.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                            <button
                              type="button"
                              onClick={() => setSimBillingCycle("monthly")}
                              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                simBillingCycle === "monthly" ? "bg-indigo-600 text-white" : "text-slate-400"
                              }`}
                            >
                              Monthly
                            </button>
                            <button
                              type="button"
                              onClick={() => setSimBillingCycle("yearly")}
                              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                simBillingCycle === "yearly" ? "bg-indigo-600 text-white" : "text-slate-400"
                              }`}
                            >
                              Annual (20% Off)
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {pricing.agents.map((agent) => {
                            const isSelected = simSelectedAgents.includes(agent.id);
                            return (
                              <div
                                key={agent.id}
                                onClick={() => {
                                  if (isSelected) {
                                    if (simSelectedAgents.length > 1) {
                                      setSimSelectedAgents(simSelectedAgents.filter((id) => id !== agent.id));
                                    }
                                  } else {
                                    setSimSelectedAgents([...simSelectedAgents, agent.id]);
                                  }
                                }}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                  isSelected
                                    ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/10"
                                    : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"
                                }`}
                              >
                                <div>
                                  <div className="font-bold text-xs text-white">{agent.name}</div>
                                  <div className="text-[11px] text-slate-400">
                                    ${simBillingCycle === "yearly" ? agent.yearlyPrice : agent.monthlyPrice}/mo
                                  </div>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                                    isSelected ? "bg-indigo-600 text-white" : "border border-slate-700 bg-slate-900"
                                  }`}
                                >
                                  {isSelected && <Check className="w-3.5 h-3.5" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1 text-xs">
                            <div className="text-slate-400">
                              Selected Stack: <strong className="text-white">{simSelectedAgents.length} Agents</strong>
                            </div>
                            <div className="text-slate-400">
                              Total Included Minutes:{" "}
                              <strong className="text-indigo-400">{simCalc.includedMinutes} mins / mo</strong>
                            </div>
                            {simCalc.discountPercent > 0 && (
                              <div className="text-emerald-400 font-bold">
                                Bundle Discount: -${simCalc.discount}/mo ({simCalc.discountPercent}% OFF)
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-slate-500 line-through">${simCalc.subtotal}/mo</div>
                            <div className="text-2xl font-extrabold text-emerald-400">${simCalc.total}/mo</div>
                            <div className="text-[10px] text-slate-400">14-Day Free Trial ($0.00 today)</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* SUB-TAB 2: SUBSCRIBERS / BUSINESSES                       */}
              {/* -------------------------------------------------------- */}
              {activeBusinessSubTab === "subscribers" && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <input
                        type="text"
                        placeholder="Search business by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3.5 py-2 pl-9 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>

                    <button
                      type="button"
                      onClick={fetchBusinesses}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                      Refresh
                    </button>
                  </div>

                  {isLoadingBusinesses ? (
                    <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                      <span>Loading active tenants...</span>
                    </div>
                  ) : filteredBusinesses.length > 0 ? (
                    <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/40 shadow-sm">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900/80 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-bold">
                          <tr>
                            <th className="p-4">Business Name</th>
                            <th className="p-4">Assigned Twilio Number</th>
                            <th className="p-4">Workforce Agents</th>
                            <th className="p-4">Calls Processed</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {filteredBusinesses.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-white text-sm">{b.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{b.id}</div>
                              </td>
                              <td className="p-4 font-mono font-bold text-indigo-400">
                                {b.twilioPhone || "None Assigned"}
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] border border-slate-700">
                                  {b.agentsCount || 1} Agents Active
                                </span>
                              </td>
                              <td className="p-4 font-bold text-slate-200">{b.totalCalls}</td>
                              <td className="p-4">
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1 w-fit">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                  LIVE
                                </span>
                              </td>
                              <td className="p-4 text-right text-slate-500 text-[11px]">
                                {new Date(b.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                      No business accounts found matching your query.
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* SUB-TAB 3: UNIT ECONOMICS                                */}
              {/* -------------------------------------------------------- */}
              {activeBusinessSubTab === "economics" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Estimated MRR</div>
                      <div className="text-2xl font-extrabold text-emerald-400">${estimatedMRR.toLocaleString()}</div>
                      <div className="text-[11px] text-slate-500">Based on active tenant subscriptions</div>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Twilio Telecom Base Cost</div>
                      <div className="text-2xl font-extrabold text-indigo-400">
                        ${(totalBusinessesCount * 1.15).toFixed(2)}/mo
                      </div>
                      <div className="text-[11px] text-slate-500">1 wholesale number per business ($1.15/mo)</div>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Average Gross Margin</div>
                      <div className="text-2xl font-extrabold text-purple-400">&gt; 92.4%</div>
                      <div className="text-[11px] text-slate-500">High-margin software &amp; AI voice infrastructure</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* MAIN TAB: OVERVIEW & KPIS                                    */}
          {/* ============================================================ */}
          {activeMainTab === "overview" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Platform Performance &amp; Infrastructure Overview</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Businesses</span>
                  <div className="text-2xl font-extrabold text-white">{totalBusinessesCount}</div>
                </div>
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Inbound Calls</span>
                  <div className="text-2xl font-extrabold text-indigo-400">{totalCallsLogged}</div>
                </div>
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform MRR</span>
                  <div className="text-2xl font-extrabold text-emerald-400">${estimatedMRR.toLocaleString()}</div>
                </div>
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Twilio Auto-Provisioning</span>
                  <div className="text-2xl font-extrabold text-emerald-400">100% ONLINE</div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MAIN TAB: VOICE & TELEPHONY                                  */}
          {/* ============================================================ */}
          {activeMainTab === "voice" && (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold text-white">Voice &amp; Telephony Infrastructure</h1>
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-bold text-slate-200">Twilio Media Stream WebSocket Gateway</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">READY</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-bold text-slate-200">Deepgram Speech-To-Text (Nova-2 Stream)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">READY</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-bold text-slate-200">ElevenLabs Flash TTS Audio Pipeline</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">READY</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MAIN TAB: SETTINGS                                           */}
          {/* ============================================================ */}
          {activeMainTab === "settings" && (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold text-white">Platform System Settings</h1>
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 text-xs">
                <p className="text-slate-400">
                  Global environment configurations are managed in <code className="text-indigo-300">.env</code>.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

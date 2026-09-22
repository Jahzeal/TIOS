"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Menu,
  Building2,
  User,
  PhoneCall,
  LogOut,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import WebVoiceCallModal from "./WebVoiceCallModal";
import { authApi } from "@/lib/api";

interface HeaderProps {
  onMenuClick?: () => void;
  selectedAgentId?: string;
  setSelectedAgentId?: (id: string) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export default function Header({
  onMenuClick,
  selectedAgentId,
  setSelectedAgentId,
  searchQuery = "",
  setSearchQuery,
}: HeaderProps) {
  const [agents, setAgents] = useState<{ id: string; name: string; phoneNumber?: string }[]>([]);
  const [isWebCallOpen, setIsWebCallOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<"SALES" | "VOICE" | "BOTH">("VOICE");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    setUserEmail(authApi.getUserEmail());
    setAccountType(authApi.getAccountType());

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${API_BASE_URL}/settings/agents`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAgents(data);
          if (!selectedAgentId && setSelectedAgentId) {
            setSelectedAgentId(data[0].id);
          }
        }
      })
      .catch(() => {});
  }, [selectedAgentId, setSelectedAgentId]);

  const toggleWorkspace = (type: "SALES" | "VOICE") => {
    const token = authApi.getToken() || "";
    const email = authApi.getUserEmail() || "";
    authApi.setSession({
      token,
      email,
      accountType: type,
    });
    setAccountType(type);
    if (type === "SALES") {
      window.location.href = "/sales";
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleLogout = () => {
    authApi.clearSession();
    window.location.href = "/login";
  };

  const activeAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  return (
    <>
      <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search Input */}
          <div className="relative w-48 sm:w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder="Search leads, calls, transcripts..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-3">
          {/* Workspace Suite Switcher (Sales AIOS vs Voice TIOS) */}
          <div className="hidden sm:flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => toggleWorkspace("SALES")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                accountType === "SALES"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Search className="w-3 h-3" />
              <span>Sales (AIOS)</span>
            </button>

            <button
              onClick={() => toggleWorkspace("VOICE")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                accountType === "VOICE" || accountType === "BOTH"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <PhoneCall className="w-3 h-3" />
              <span>Voice (TIOS)</span>
            </button>
          </div>

          {/* Web Call Button */}
          <button
            onClick={() => setIsWebCallOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition-all shadow-md inline-flex items-center space-x-2 animate-pulse hover:animate-none"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Web Voice Call</span>
          </button>

          {/* User Profile & Logout Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold text-xs hover:border-indigo-400 transition-colors"
              aria-label="User profile"
            >
              <User className="h-4 w-4" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 text-left z-50">
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="text-xs font-bold text-white truncate">
                    {userEmail || "Signed In User"}
                  </div>
                  <div className="text-[11px] text-indigo-400 capitalize mt-0.5">
                    {accountType === "SALES" ? "Sales Agent (AIOS)" : "Voice Receptionist (TIOS)"}
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    Account Settings
                  </Link>
                  <Link
                    href="/onboarding"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    Agent Onboarding Wizard
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-slate-800 hover:text-red-300 flex items-center gap-1.5 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Web Voice Call Modal */}
      <WebVoiceCallModal
        isOpen={isWebCallOpen}
        onClose={() => setIsWebCallOpen(false)}
        agentId={activeAgent?.id}
        agentName={activeAgent?.name || "AI Receptionist"}
      />
    </>
  );
}


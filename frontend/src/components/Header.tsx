"use client";

import React from "react";
import { Search, Menu, Building2, User } from "lucide-react";
import { mockAgents } from "@/lib/mockData";

interface HeaderProps {
  onMenuClick?: () => void;
  selectedAgentId?: string;
  setSelectedAgentId?: (id: string) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export default function Header({
  onMenuClick,
  selectedAgentId = "agent-1",
  setSelectedAgentId,
  searchQuery = "",
  setSearchQuery,
}: HeaderProps) {
  return (
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
            placeholder="Search calls, leads, prompts..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-3">
        {/* Active Tenant / Agent Selector */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
          <Building2 className="h-3.5 w-3.5 text-indigo-400" />
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId && setSelectedAgentId(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            {mockAgents.map((agent) => (
              <option key={agent.id} value={agent.id} className="bg-slate-900 text-slate-200">
                {agent.name} ({agent.phoneNumber || agent.id})
              </option>
            ))}
          </select>
        </div>

        {/* User Avatar */}
        <div className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold text-xs">
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}

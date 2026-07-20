"use client";

import React, { useEffect, useState } from "react";
import { Users, Calendar, Search, Activity, ChevronLeft, ChevronRight } from "lucide-react";

interface ApiLead {
  id: string;
  name?: string | null;
  phone: string;
  email?: string | null;
  status: string;
  interest?: string | null;
  notes?: string | null;
  bookingDetails?: string | null;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [filter, setFilter] = useState<"ALL" | "NEW" | "QUALIFIED" | "BOOKED" | "COLD">("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch leads on filter, page, or search change
  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    async function fetchLeads() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "10");

        if (filter !== "ALL") {
          params.append("status", filter);
        }

        if (debouncedSearch.trim()) {
          params.append("search", debouncedSearch.trim());
        }

        const res = await fetch(`${API_BASE_URL}/leads?${params.toString()}`);
        if (res.ok) {
          const result = await res.json();
          const leadData = Array.isArray(result) ? result : result.data || [];
          const metaData = result.meta || {
            total: leadData.length,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          };

          setLeads(leadData);
          setMeta(metaData);
          setIsLive(true);
        } else {
          setLeads([]);
          setIsLive(false);
        }
      } catch (err) {
        console.warn("Failed to fetch leads from NestJS backend:", err);
        setLeads([]);
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeads();
  }, [filter, page, debouncedSearch]);

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leads & Appointment Pipeline</h1>
          <p className="text-xs text-slate-400">
            Prospects captured by AI receptionist, qualified via prompt instructions, and synced to Google Calendar.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isLive
                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            <Activity className="h-3 w-3 animate-pulse" />
            <span>{isLive ? `${meta.total} Active Leads` : "API Offline (0 Leads)"}</span>
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, phone, or intent..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {(["ALL", "NEW", "QUALIFIED", "BOOKED", "COLD"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Intent / Summary</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Booking Info</th>
                <th className="py-3.5 px-4">Captured At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="py-4 px-4">
                      <div className="h-4 bg-slate-800 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                    No leads captured in pipeline yet.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-medium text-white">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                          {(lead.name || "Lead").charAt(0)}
                        </div>
                        <div>
                          <div>{lead.name || "Anonymous Prospect"}</div>
                          <div className="text-xs text-slate-500 flex items-center space-x-2">
                            <span>{lead.phone}</span>
                            {lead.email && <span>• {lead.email}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-200">{lead.notes || "Inbound Call Query"}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          lead.status === "QUALIFIED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : lead.status === "BOOKED"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-300">
                      {lead.bookingDetails ? (
                        <span className="inline-flex items-center text-indigo-400 font-medium">
                          <Calendar className="h-3.5 w-3.5 mr-1" /> {lead.bookingDetails}
                        </span>
                      ) : (
                        <span className="text-slate-500">No booking request</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400 font-mono">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server Pagination Bar */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} active leads)
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={!meta.hasPrevPage || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-700 flex items-center space-x-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>
            <button
              disabled={!meta.hasNextPage || isLoading}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-700 flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

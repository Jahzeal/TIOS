"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PhoneForwarded,
  PhoneIncoming,
  Search,
  Clock,
  UserCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ApiCall {
  id: string;
  sid?: string | null;
  direction: string;
  status: string;
  callerName?: string | null;
  callerPhone: string;
  duration: number;
  summary?: string | null;
  sentiment?: string | null;
  transcript?: any;
  createdAt: string;
  tenant?: { name: string } | null;
  agent?: { name: string } | null;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function CallbackRequestsPage() {
  const router = useRouter();
  const [callbacks, setCallbacks] = useState<ApiCall[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchCallbacks();
  }, [page, debouncedSearch]);

  const fetchCallbacks = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        status: "FORWARD_REQUESTED",
      });

      if (debouncedSearch) {
        queryParams.set("search", debouncedSearch);
      }

      const res = await fetch(`${API_BASE_URL}/calls?${queryParams.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setCallbacks(result.data || []);
        if (result.meta) {
          setMeta(result.meta);
        }
      }
    } catch (error) {
      console.error("Failed to fetch callback requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCall = (callId: string) => {
    router.push(`/calls?callId=${callId}`);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <PhoneForwarded className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Requested Callbacks</h1>
              <p className="text-sm text-slate-400">
                Callers who requested human agent transfers, representatives, or phone callbacks.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/calls"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-sm font-medium border border-slate-700 transition-all"
          >
            <PhoneIncoming className="h-4 w-4 mr-2 text-indigo-400" />
            All Call History
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Callback Requests</p>
            <p className="text-2xl font-bold text-white mt-1">{meta.total}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <PhoneForwarded className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-400 font-medium">Pending Follow-ups</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{meta.total}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-400 font-medium">Routing Priority</p>
            <p className="text-sm font-semibold text-emerald-400 mt-2 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-400" /> High Priority Agent List
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search phone number or summary..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="text-xs text-slate-400">
          Showing {callbacks.length} of {meta.total} callback requests
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Caller Info</th>
                <th className="py-3.5 px-4">Request Reason / Summary</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Requested Time</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="py-4 px-4">
                      <div className="h-4 bg-slate-800 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : callbacks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                    No callback requests logged yet.
                  </td>
                </tr>
              ) : (
                callbacks.map((call) => {
                  const displayName = call.callerName || call.tenant?.name || "Inbound Caller";
                  const rawPhone = call.callerPhone || "";
                  const isWeb = !rawPhone || rawPhone === "Unknown" || rawPhone.includes("Web") || rawPhone.includes("Inbound Phone Call");
                  const phoneDisplay = isWeb ? "+1 (Web Voice Call)" : rawPhone;
                  const timeFormatted = call.createdAt
                    ? new Date(call.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "—";

                  return (
                    <tr
                      key={call.id}
                      onClick={() => handleSelectCall(call.id)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-medium text-white">
                        {displayName}
                        <div className="text-xs text-amber-400 font-mono group-hover:underline">{phoneDisplay}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {call.summary || "Caller requested to speak to a representative or receive a phone callback."}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <PhoneForwarded className="h-3 w-3 mr-1" />
                          Callback Needed
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">{timeFormatted}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCall(call.id);
                          }}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold border border-amber-500/20 transition-all"
                        >
                          View Transcript
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={!meta.hasPrevPage}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={!meta.hasNextPage}
                onClick={() => setPage((prev) => prev + 1)}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

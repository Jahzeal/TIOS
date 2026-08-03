"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Users,
  TrendingUp,
  ArrowRight,
  Calendar,
  Activity,
  RefreshCw,
} from "lucide-react";

interface DashboardStats {
  totalCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  avgDurationSeconds: number;
  conversionRatePercent: number;
  leadsGenerated: number;
  appointmentsBooked: number;
  totalDepositsAmount?: number;
  totalDepositsCount?: number;
}

interface DashboardCall {
  id: string;
  direction: string;
  status: string;
  callerName?: string | null;
  callerPhone: string;
  duration: number;
  summary?: string | null;
  sentiment?: string | null;
  tenant?: { name: string } | null;
  createdAt?: string | Date | null;
}

const emptyStats: DashboardStats = {
  totalCalls: 0,
  inboundCalls: 0,
  outboundCalls: 0,
  avgDurationSeconds: 0,
  conversionRatePercent: 0,
  leadsGenerated: 0,
  appointmentsBooked: 0,
  totalDepositsAmount: 0,
  totalDepositsCount: 0,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [recentCalls, setRecentCalls] = useState<DashboardCall[]>([]);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    if (isManualRefresh) {
      setIsRefreshing(true);
    }

    try {
      const [statsRes, callsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/stats`),
        fetch(`${API_BASE_URL}/dashboard/recent-calls?limit=5`),
      ]);

      if (statsRes.ok && callsRes.ok) {
        const statsData = await statsRes.json();
        const callsData = await callsRes.json();
        setStats({
          totalCalls: statsData.totalCalls ?? 0,
          inboundCalls: statsData.inboundCalls ?? 0,
          outboundCalls: statsData.outboundCalls ?? 0,
          avgDurationSeconds: statsData.avgDurationSeconds ?? 0,
          conversionRatePercent: statsData.conversionRatePercent ?? 0,
          leadsGenerated: statsData.leadsGenerated ?? 0,
          appointmentsBooked: statsData.appointmentsBooked ?? 0,
          totalDepositsAmount: statsData.totalDepositsAmount ?? 0,
          totalDepositsCount: statsData.totalDepositsCount ?? 0,
        });
        setRecentCalls(Array.isArray(callsData) ? callsData : []);
        setIsLive(true);
      } else {
        setStats(emptyStats);
        setRecentCalls([]);
        setIsLive(false);
      }
    } catch (err) {
      console.warn("Could not connect to NestJS backend API. Defaulting to 0/empty.", err);
      setStats(emptyStats);
      setRecentCalls([]);
      setIsLive(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 10 seconds for real-time live calls
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                <span>TIOS AI Autonomous Gateway</span>
              </div>
              <span
                className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  isLive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }`}
              >
                <Activity className="h-3 w-3 animate-pulse" />
                <span>{isLive ? "Live Stream (Auto-Refreshed 10s)" : "API Offline (0 Data)"}</span>
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              24/7 AI Receptionist & Sales Agent
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Answering inbound calls, handling emergency forwarding, booking Google Calendar appointments, and processing Stripe deposits.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-sm transition-all border border-slate-700 disabled:opacity-50"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            </button>
            <Link
              href="/calls"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
            >
              <PhoneCall className="h-4 w-4" />
              <span>View Live Calls</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 animate-pulse h-32">
              <div className="h-4 bg-slate-800 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-800 rounded w-1/3"></div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Calls Handled</span>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <PhoneCall className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white">{stats.totalCalls}</span>
                <span className="text-xs text-emerald-400 font-semibold ml-2 inline-flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +0%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Across all connected tenant phone numbers</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inbound Calls</span>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <PhoneIncoming className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white">{stats.inboundCalls}</span>
                <span className="text-xs text-slate-400 font-normal ml-2">Avg duration {stats.avgDurationSeconds}s</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">AI Receptionist handling & triage</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leads Qualified</span>
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white">{stats.leadsGenerated}</span>
                <span className="text-xs text-emerald-400 font-semibold ml-2">{stats.conversionRatePercent}% Qualified</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Converted into Google Calendar bookings</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stripe Deposits Collected</span>
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white">
                  ${(stats.totalDepositsAmount || 0).toFixed(2)}
                </span>
                <span className="text-xs text-emerald-400 font-semibold ml-2">
                  {stats.totalDepositsCount || 0} Payments
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Automated booking checkout links</p>
            </div>
          </>
        )}
      </div>

      {/* Recent Calls Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Call Stream Logs</h2>
            <p className="text-xs text-slate-400">Bi-directional media stream sessions processed by Deepgram STT & ElevenLabs TTS</p>
          </div>
          <Link
            href="/calls"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center space-x-1"
          >
            <span>View All ({recentCalls.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Caller</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4">Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4">
                      <div className="h-4 bg-slate-800 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : recentCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No recent calls logged yet.
                  </td>
                </tr>
              ) : (
                recentCalls.map((call) => {
                  const rawPhone = call.callerPhone || "";
                  const isWeb = !rawPhone || rawPhone === "Unknown" || rawPhone.includes("Web");
                  const phoneDisplay = isWeb ? "+1 (Web Voice Call)" : rawPhone;
                  const displayName = call.callerName || (isWeb ? "Web Voice Call" : rawPhone);
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
                    <tr key={call.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white">
                        {displayName}
                        <div className="text-xs text-slate-400 font-mono">{phoneDisplay}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300">
                          {call.direction === "INBOUND" ? (
                            <PhoneIncoming className="h-3 w-3 mr-1 text-emerald-400" />
                          ) : (
                            <PhoneOutgoing className="h-3 w-3 mr-1 text-blue-400" />
                          )}
                          {call.direction}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            call.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : call.status === "FORWARD_REQUESTED"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {call.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">{call.duration}s</td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs font-mono whitespace-nowrap">{timeFormatted}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs truncate">{call.summary || "—"}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            call.sentiment === "POSITIVE"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : call.sentiment === "NEGATIVE"
                              ? "bg-rose-500/10 text-rose-400"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {call.sentiment || "NEUTRAL"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

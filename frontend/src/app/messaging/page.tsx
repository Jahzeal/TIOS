"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, Clock, Search, Activity, ChevronLeft, ChevronRight, Plus, Send, CheckCircle } from "lucide-react";

interface ApiSmsLog {
  id: string;
  tenantId?: string;
  tenantName: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
}

interface ApiReminder {
  id: string;
  tenantId?: string;
  tenantName: string;
  phone: string;
  bookingDetails: string;
  message: string;
  scheduledAt: string;
  status: string;
  createdAt?: string;
}

interface TenantItem {
  id: string;
  name: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function MessagingPage() {
  const [activeTab, setActiveTab] = useState<"sms" | "reminders">("sms");
  const [smsLogs, setSmsLogs] = useState<ApiSmsLog[]>([]);
  const [reminders, setReminders] = useState<ApiReminder[]>([]);
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | "SENT" | "DELIVERED" | "PENDING" | "FAILED">("ALL");
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

  // Modal State for Outbound SMS
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenantName, setSelectedTenantName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [smsText, setSmsText] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when switching tabs
  const handleTabChange = (tab: "sms" | "reminders") => {
    setActiveTab(tab);
    setPage(1);
    setFilter("ALL");
  };

  // Fetch tenants for modal select dropdown
  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    async function fetchTenants() {
      try {
          }
        }
      } catch (e) {
        // tenant list handled gracefully
      }
    }
    fetchTenants();
  }, []);

  // Fetch data on tab, filter, page, or search change
  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    async function fetchData() {
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

        const endpoint = activeTab === "sms" ? `${API_BASE_URL}/messaging/sms` : `${API_BASE_URL}/messaging/reminders`;
        const res = await fetch(`${endpoint}?${params.toString()}`);

        if (res.ok) {
          const result = await res.json();
          const dataList = Array.isArray(result) ? result : result.data || [];
          const metaData = result.meta || {
            total: dataList.length,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          };

          if (activeTab === "sms") {
            setSmsLogs(dataList);
          } else {
            setReminders(dataList);
          }
          setMeta(metaData);
          setIsLive(true);
        } else {
          setSmsLogs([]);
          setReminders([]);
          setIsLive(false);
        }
      } catch (err) {
        console.warn("Failed to fetch messaging data from NestJS backend:", err);
        setSmsLogs([]);
        setReminders([]);
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [activeTab, filter, page, debouncedSearch]);

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone.trim() || !smsText.trim()) return;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${API_BASE_URL}/messaging/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName: selectedTenantName || "Default Business",
          phone: recipientPhone.trim(),
          message: smsText.trim(),
        }),
      });

      if (res.ok) {
        const newLog = await res.json();
        setSmsLogs((prev) => [newLog, ...prev]);
        setMeta((prev) => ({ ...prev, total: prev.total + 1 }));
        setSentSuccess(true);
        setIsModalOpen(false);
        setTimeout(() => setSentSuccess(false), 4000);
      }
    } catch (err) {
      console.warn("Failed to send custom SMS:", err);
    } finally {
      setSmsText("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SMS & Automated Reminders</h1>
          <p className="text-xs text-slate-400">
            Outbound SMS logs, Twilio REST dispatch history, and 24-hour appointment reminder scheduler.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isLive
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            <Activity className="h-3 w-3 animate-pulse" />
            <span>{isLive ? `${meta.total} ${activeTab === "sms" ? "SMS Logs" : "Reminders"}` : "API Offline"}</span>
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-all shadow-md inline-flex items-center space-x-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Send Outbound SMS</span>
          </button>
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleTabChange("sms")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "sms"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              SMS Logs
            </button>
            <button
              onClick={() => handleTabChange("reminders")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "reminders"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Reminders Queue
            </button>
          </div>
        </div>
      </div>

      {sentSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center space-x-2 shadow-lg">
          <CheckCircle className="h-4 w-4" />
          <span>Outbound SMS message dispatched to customer phone via Twilio REST API!</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phone, message, or tenant..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {(["ALL", "SENT", "DELIVERED", "PENDING", "FAILED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
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

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {activeTab === "sms" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Tenant</th>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Message Body</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Dispatched At</th>
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
                ) : smsLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                      No SMS logs found in database.
                    </td>
                  </tr>
                ) : (
                  smsLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white">{log.tenantName}</td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-300">{log.phone}</td>
                      <td className="py-4 px-4 text-xs text-slate-200 max-w-sm">{log.message}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            log.status === "DELIVERED" || log.status === "SENT"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400 font-mono">
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Tenant</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Booking</th>
                  <th className="py-3.5 px-4">Reminder Message</th>
                  <th className="py-3.5 px-4">Scheduled For</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="py-4 px-4">
                        <div className="h-4 bg-slate-800 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : reminders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                      No scheduled reminders found in database.
                    </td>
                  </tr>
                ) : (
                  reminders.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white">{r.tenantName}</td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-300">{r.phone}</td>
                      <td className="py-4 px-4 text-xs text-indigo-400 font-medium">{r.bookingDetails}</td>
                      <td className="py-4 px-4 text-xs text-slate-200 max-w-xs">{r.message}</td>
                      <td className="py-4 px-4 text-xs font-mono text-slate-400">
                        {r.scheduledAt ? new Date(r.scheduledAt).toLocaleString() : "—"}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            r.status === "SENT" || r.status === "DELIVERED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : r.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Server Pagination Bar */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} {activeTab === "sms" ? "SMS logs" : "reminders"})
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

      {/* Outbound SMS Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Send Outbound SMS</h2>
            <form onSubmit={handleSendSms} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tenant Business</label>
                <select
                  value={selectedTenantName}
                  onChange={(e) => setSelectedTenantName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {tenants.length === 0 ? (
                    <option value="Default Business">Default Business</option>
                  ) : (
                    tenants.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Customer Mobile Phone
                </label>
                <input
                  type="text"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="e.g. +15551234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  SMS Message Body
                </label>
                <textarea
                  rows={4}
                  required
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  placeholder="Type your outbound message..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl shadow-md inline-flex items-center space-x-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Dispatch SMS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

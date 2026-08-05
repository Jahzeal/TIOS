"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, ExternalLink, Plus, Send, CheckCircle, RefreshCw, Copy, Check, Search, Activity, ChevronLeft, ChevronRight } from "lucide-react";

interface ApiPayment {
  id: string;
  tenantId?: string;
  tenantName: string;
  amount: number;
  phone: string;
  inquiredService?: string;
  callId?: string;
  leadId?: string;
  status: string;
  link: string;
  notes?: string;
  stripeSessionId?: string | null;
  createdAt: string;
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

export default function PaymentsPage() {
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING_QUOTE" | "SMS_SENT" | "PAID">("ALL");
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
  const [sendingSmsId, setSendingSmsId] = useState<string | null>(null);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenantName, setSelectedTenantName] = useState("");
  const [inquiredService, setInquiredService] = useState("Utility Service Setup");
  const [amount, setAmount] = useState(250);
  const [phone, setPhone] = useState("+1 (555) 888-9999");
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch tenants for modal select dropdown
  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    async function fetchTenants() {
      try {
        const res = await fetch(`${API_BASE_URL}/tenants`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTenants(data);
            setSelectedTenantName(data[0].name);
          }
        }
      } catch (e) {
        // tenant fetch handled gracefully
      }
    }
    fetchTenants();
  }, []);

  // Fetch payments on page, filter, or search change
  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    async function fetchPayments() {
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

        const res = await fetch(`${API_BASE_URL}/payments?${params.toString()}`);
        if (res.ok) {
          const result = await res.json();
          const payData = Array.isArray(result) ? result : result.data || [];
          const metaData = result.meta || {
            total: payData.length,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          };

          setPayments(payData);
          setMeta(metaData);
          setIsLive(true);
        } else {
          setPayments([]);
          setIsLive(false);
        }
      } catch (err) {
        console.warn("Failed to fetch payments from NestJS backend:", err);
        setPayments([]);
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPayments();
  }, [filter, page, debouncedSearch]);

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleCopyLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendSmsLink = async (id: string) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      setSendingSmsId(id);
      const res = await fetch(`${API_BASE_URL}/payments/send-sms/${id}`, {
        method: "POST",
      });

      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "SMS_SENT" } : p)),
        );
        setSentSuccess(true);
        setTimeout(() => setSentSuccess(false), 4000);
      }
    } catch (err) {
      console.warn("Failed to send payment SMS link:", err);
    } finally {
      setSendingSmsId(null);
    }
  };

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${API_BASE_URL}/payments/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName: selectedTenantName || "Default Tenant",
          inquiredService: inquiredService || "Utility Service Setup",
          amount: Number(amount),
          phone: phone,
          status: "PENDING_QUOTE",
        }),
      });

      if (res.ok) {
        const newPayment = await res.json();
        setPayments((prev) => [newPayment, ...prev]);
        setMeta((prev) => ({ ...prev, total: prev.total + 1 }));
        setSentSuccess(true);
        setIsModalOpen(false);
        setTimeout(() => setSentSuccess(false), 4000);
      }
    } catch (err) {
      console.warn("Failed to generate checkout link:", err);
    }
  };

  const handleSimulateWebhookPayment = async (id: string) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      setSimulatingId(id);
      const res = await fetch(`${API_BASE_URL}/payments/simulate-webhook/${id}`, {
        method: "POST",
      });

      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "PAID" } : p)),
        );
      }
    } catch (err) {
      console.warn("Failed to simulate paid webhook:", err);
    } finally {
      setSimulatingId(null);
    }
  };

  const paidCount = payments.filter((p) => p.status === "PAID").length;
  const totalPaidRevenue = payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Inquiry-to-Payment Conversion Center</h1>
          <p className="text-xs text-slate-400">
            Real-time tracking of prospective caller inquiries, SMS checkout links, and converted payments.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isLive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            <Activity className="h-3 w-3 animate-pulse" />
            <span>{isLive ? `${meta.total} Invoices & Quotes` : "API Offline (0 Invoices)"}</span>
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-md inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create Pending Quote / Invoice</span>
          </button>
        </div>
      </div>

      {sentSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center space-x-2 shadow-lg">
          <CheckCircle className="h-4 w-4" />
          <span>Stripe Checkout link generated and SMS dispatched to customer phone!</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400">Total Converted Revenue</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">${totalPaidRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400">Active Inquiries / Pending Quotes</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {payments.filter((p) => p.status === "PENDING_QUOTE" || p.status === "SMS_SENT").length}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400">Converted Clients</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{paidCount} Paid Accounts</p>
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
            placeholder="Search phone, service, session ID, or tenant..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {(["ALL", "PENDING_QUOTE", "SMS_SENT", "PAID"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {f === "ALL"
                ? "All Quotes"
                : f === "PENDING_QUOTE"
                ? "Pending Quotes"
                : f === "SMS_SENT"
                ? "SMS Sent"
                : "Paid / Converted"}
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
                <th className="py-3.5 px-4">Caller / Recipient</th>
                <th className="py-3.5 px-4">Inquired Service Package</th>
                <th className="py-3.5 px-4">Quote Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date &amp; Time</th>
                <th className="py-3.5 px-4">SMS &amp; Checkout Actions</th>
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
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No pending quotes or payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      {(() => {
                        const rawPhone = p.phone || "";
                        const isWeb = !rawPhone || rawPhone === "Unknown" || rawPhone.includes("Web") || rawPhone.includes("Inbound Phone Call");
                        const phoneDisplay = isWeb ? "+1 (Web Voice Call)" : rawPhone;
                        return (
                          <>
                            <div className="font-semibold text-white">{phoneDisplay}</div>
                            <div className="text-xs text-slate-400">{p.tenantName || "Hive Business"}</div>
                          </>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-200">
                      {p.inquiredService || "Utility Service Setup"}
                    </td>
                    <td className="py-4 px-4 font-bold text-white">${Number(p.amount).toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : p.status === "SMS_SENT"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {p.createdAt ? (
                        <>
                          {new Date(p.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          •{" "}
                          {new Date(p.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-indigo-400">
                      <div className="flex items-center space-x-2">
                        <button
                          disabled={sendingSmsId === p.id}
                          onClick={() => handleSendSmsLink(p.id)}
                          className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 transition-all disabled:opacity-50"
                        >
                          <Send className="h-3 w-3" />
                          <span>{sendingSmsId === p.id ? "Sending..." : "Send SMS Link"}</span>
                        </button>
                        <button
                          onClick={() => handleCopyLink(p.id, p.link)}
                          title="Copy Checkout Link"
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedId === p.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
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
            Page {meta.page} of {meta.totalPages} ({meta.total} total payments)
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Generate Deposit Link & Dispatch SMS</h2>
            <form onSubmit={handleGenerateLink} className="space-y-4">
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
                  Deposit Amount ($ USD)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Customer Mobile Phone (SMS Target)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const tempLink = `https://checkout.stripe.com/pay/cs_test_${Date.now()}`;
                    navigator.clipboard.writeText(tempLink);
                    setCopiedId("modal-generated");
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 inline-flex items-center space-x-1.5 transition-all"
                >
                  {copiedId === "modal-generated" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Copy Checkout Link</span>
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl shadow-md inline-flex items-center space-x-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send SMS Link</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, ExternalLink, Plus, Send, CheckCircle, RefreshCw, Copy, Check, Search, Activity, ChevronLeft, ChevronRight } from "lucide-react";

interface ApiPayment {
  id: string;
  tenantId?: string;
  tenantName: string;
  amount: number;
  phone: string;
  status: string;
  link: string;
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
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PAID" | "FAILED">("ALL");
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
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenantName, setSelectedTenantName] = useState("");
  const [amount, setAmount] = useState(25);
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

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${API_BASE_URL}/payments/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName: selectedTenantName || "Default Tenant",
          amount: Number(amount),
          phone: phone,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Stripe Payments & SMS Checkout Links</h1>
          <p className="text-xs text-slate-400">
            Real-time Stripe Checkout URL generation, SMS dispatch to callers, and automated webhook status reflection.
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
            <span>{isLive ? `${meta.total} Payments Processed` : "API Offline (0 Payments)"}</span>
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-md inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Deposit Link & Send SMS</span>
          </button>
        </div>
      </div>

      {sentSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center space-x-2 shadow-lg">
          <CheckCircle className="h-4 w-4" />
          <span>Stripe Checkout link generated and SMS dispatched to customer phone!</span>
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
            placeholder="Search phone, link, session ID, or tenant..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {(["ALL", "PENDING", "PAID", "FAILED"] as const).map((f) => (
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
                <th className="py-3.5 px-4">Tenant</th>
                <th className="py-3.5 px-4">Recipient Phone</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Stripe Checkout Link</th>
                <th className="py-3.5 px-4">Simulate Webhook</th>
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
                    No payment deposit links found in database.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">{p.tenantName || "Default Tenant"}</td>
                    <td className="py-4 px-4 text-slate-300 font-mono text-xs">{p.phone}</td>
                    <td className="py-4 px-4 font-bold text-white">${Number(p.amount).toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-indigo-400">
                      <div className="flex items-center space-x-2">
                        <a href={p.link} target="_blank" rel="noreferrer" className="hover:underline flex items-center">
                          <span>{p.link ? p.link.slice(0, 30) : "N/A"}...</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
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
                    <td className="py-4 px-4">
                      {p.status === "PENDING" && (
                        <button
                          disabled={simulatingId === p.id}
                          onClick={() => handleSimulateWebhookPayment(p.id)}
                          className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 disabled:opacity-50"
                        >
                          <RefreshCw className={`h-3 w-3 ${simulatingId === p.id ? "animate-spin" : ""}`} />
                          <span>{simulatingId === p.id ? "Simulating..." : "Simulate Paid Webhook"}</span>
                        </button>
                      )}
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

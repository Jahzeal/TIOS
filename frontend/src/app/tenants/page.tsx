"use client";

import React, { useEffect, useState } from "react";
import { Building2, Plus, Phone, ArrowRightLeft, Key, Trash2, Search, Activity, ChevronLeft, ChevronRight } from "lucide-react";

interface ApiTenant {
  id: string;
  name: string;
  twilioPhone: string;
  forwardPhone?: string;
  stripeSecret?: string;
  agentsCount?: number;
  createdAt?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<ApiTenant[]>([]);
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [twilioPhone, setTwilioPhone] = useState("");
  const [forwardPhone, setForwardPhone] = useState("");
  const [stripeSecret, setStripeSecret] = useState("");

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch tenants on page or search change
  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    async function fetchTenants() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "10");

        if (debouncedSearch.trim()) {
          params.append("search", debouncedSearch.trim());
        }

        const res = await fetch(`${API_BASE_URL}/tenants?${params.toString()}`);
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

          setTenants(dataList);
          setMeta(metaData);
          setIsLive(true);
        } else {
          setTenants([]);
          setIsLive(false);
        }
      } catch (err) {
        console.warn("Failed to fetch tenants from NestJS backend:", err);
        setTenants([]);
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTenants();
  }, [page, debouncedSearch]);

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${API_BASE_URL}/tenants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          twilioPhone: twilioPhone.trim() || undefined,
          forwardPhone: forwardPhone.trim() || undefined,
          stripeSecret: stripeSecret.trim() || undefined,
        }),
      });

      if (res.ok) {
        const newTenant = await res.json();
        setTenants((prev) => [newTenant, ...prev]);
        setMeta((prev) => ({ ...prev, total: prev.total + 1 }));
      }
    } catch (err) {
      console.warn("Failed to onboard tenant:", err);
    } finally {
      setName("");
      setTwilioPhone("");
      setForwardPhone("");
      setStripeSecret("");
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${API_BASE_URL}/tenants/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTenants((prev) => prev.filter((t) => t.id !== id));
        setMeta((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      }
    } catch (err) {
      console.warn("Failed to delete tenant:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Multi-Tenant Management</h1>
          <p className="text-xs text-slate-400">
            Configure business profiles, Twilio phone numbers, emergency call forwarding destinations, and Stripe secret keys.
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
            <span>{isLive ? `${meta.total} Onboarded Tenants` : "API Offline (0 Tenants)"}</span>
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-md inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard New Tenant</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tenant by name or phone..."
          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      {/* Grid of Tenants */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-pulse h-48">
                <div className="h-5 bg-slate-800 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-slate-800 rounded w-full mb-2"></div>
                <div className="h-10 bg-slate-800 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : tenants.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
            No business tenants onboarded yet. Click "Onboard New Tenant" above to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((t) => (
              <div key={t.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 group relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{t.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">ID: {t.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-all"
                    title="Delete Tenant"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 flex items-center">
                      <Phone className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Twilio Phone
                    </span>
                    <span className="font-mono text-white font-medium">{t.twilioPhone}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 flex items-center">
                      <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5 text-amber-400" /> Emergency Forward
                    </span>
                    <span className="font-mono text-white font-medium">{t.forwardPhone}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 flex items-center">
                      <Key className="h-3.5 w-3.5 mr-1.5 text-purple-400" /> Stripe Key
                    </span>
                    <span className="font-mono text-slate-400">{t.stripeSecret}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Server Pagination Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} onboarded tenants)
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
            <h2 className="text-lg font-bold text-white">Onboard New Business Tenant</h2>
            <form onSubmit={handleAddTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Business / Tenant Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Legal Group"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Twilio Phone Number
                </label>
                <input
                  type="text"
                  value={twilioPhone}
                  onChange={(e) => setTwilioPhone(e.target.value)}
                  placeholder="+1 (888) 555-0199"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Emergency Forwarding Phone Number
                </label>
                <input
                  type="text"
                  value={forwardPhone}
                  onChange={(e) => setForwardPhone(e.target.value)}
                  placeholder="+1 (415) 555-0199"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Stripe Secret Key (Optional)
                </label>
                <input
                  type="text"
                  value={stripeSecret}
                  onChange={(e) => setStripeSecret(e.target.value)}
                  placeholder="sk_test_..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl shadow-md"
                >
                  Onboard Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

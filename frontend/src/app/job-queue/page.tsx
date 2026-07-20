"use client";

import React, { useEffect, useState } from "react";
import { Cpu, RefreshCw, Search, Activity, ChevronLeft, ChevronRight } from "lucide-react";

interface ApiJob {
  id: string;
  queueName: string;
  tenantName: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  availableAt: string;
  error?: string | null;
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

export default function JobQueuePage() {
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PROCESSING" | "DONE" | "FAILED">("ALL");
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
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch jobs on filter, page, or search change
  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    async function fetchJobs() {
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

        const res = await fetch(`${API_BASE_URL}/job-queue?${params.toString()}`);
        if (res.ok) {
          const result = await res.json();
          const jobData = Array.isArray(result) ? result : result.data || [];
          const metaData = result.meta || {
            total: jobData.length,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          };

          setJobs(jobData);
          setMeta(metaData);
          setIsLive(true);
        } else {
          setJobs([]);
          setIsLive(false);
        }
      } catch (err) {
        console.warn("Failed to fetch job queue from NestJS backend:", err);
        setJobs([]);
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchJobs();
  }, [filter, page, debouncedSearch]);

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleRetry = async (id: string) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      setRetryingId(id);
      const res = await fetch(`${API_BASE_URL}/job-queue/retry/${id}`, {
        method: "POST",
      });

      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === id ? { ...j, status: "PENDING", attempts: 0, error: null } : j)),
        );
      }
    } catch (err) {
      console.warn("Failed to retry job:", err);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Background Job Queue</h1>
          <p className="text-xs text-slate-400">
            Asynchronous queue execution for calendar bookings, Stripe payments, and SMS reminder dispatches.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isLive
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            <Activity className="h-3 w-3 animate-pulse" />
            <span>{isLive ? `${meta.total} Queue Jobs` : "API Offline (0 Jobs)"}</span>
          </span>
        </div>
      </div>

      {/* Search and Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search queue name, error, or tenant..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {(["ALL", "PENDING", "PROCESSING", "DONE", "FAILED"] as const).map((f) => (
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
                <th className="py-3.5 px-4">Queue Name</th>
                <th className="py-3.5 px-4">Tenant</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Attempts</th>
                <th className="py-3.5 px-4">Error Audit</th>
                <th className="py-3.5 px-4">Action</th>
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
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No background jobs found in execution queue.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-semibold text-white">{job.queueName}</td>
                    <td className="py-4 px-4 text-slate-300">{job.tenantName}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          job.status === "DONE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : job.status === "PROCESSING"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse"
                            : job.status === "FAILED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-400">
                      {job.attempts} / {job.maxAttempts}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400 max-w-xs truncate">
                      {job.error ? <span className="text-rose-400 font-mono">{job.error}</span> : "Clean execution"}
                    </td>
                    <td className="py-4 px-4">
                      {job.status === "FAILED" && (
                        <button
                          disabled={retryingId === job.id}
                          onClick={() => handleRetry(job.id)}
                          className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 disabled:opacity-50"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${retryingId === job.id ? "animate-spin" : ""}`} />
                          <span>{retryingId === job.id ? "Retrying..." : "Retry"}</span>
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
            Page {meta.page} of {meta.totalPages} ({meta.total} total jobs)
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

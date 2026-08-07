"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Building2,
  Trash2,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Scale,
  Stethoscope,
  UtensilsCrossed,
  Wrench,
  Server,
  Layers,
  CheckCircle2,
  X,
  BookOpen,
} from "lucide-react";

interface KbEntry {
  id: string;
  tenantId?: string;
  tenantName: string;
  question: string;
  answer: string;
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

interface TemplatePack {
  id: string;
  name: string;
  category: string;
  iconName: string;
  description: string;
  entries: { question: string; answer: string }[];
}

// Industry icons map
const ICON_MAP: Record<string, React.ReactNode> = {
  Scale: <Scale className="h-5 w-5 text-amber-400" />,
  Stethoscope: <Stethoscope className="h-5 w-5 text-rose-400" />,
  UtensilsCrossed: <UtensilsCrossed className="h-5 w-5 text-orange-400" />,
  Building2: <Building2 className="h-5 w-5 text-emerald-400" />,
  Wrench: <Wrench className="h-5 w-5 text-sky-400" />,
  Server: <Server className="h-5 w-5 text-indigo-400" />,
};

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KbEntry[]>([]);
  const [tenants, setTenants] = useState<TenantItem[]>([]);
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

  // Single Entry Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedTenantName, setSelectedTenantName] = useState("");

  // Industry Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplatePack[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("law-accounting");
  const [importingTenantName, setImportingTenantName] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load available tenants for modal select dropdown
  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    async function fetchTenants() {
      try {
        const res = await fetch(`${API_BASE_URL}/tenants`);
        if (res.ok) {
          const result = await res.json();
          const tenantList = Array.isArray(result) ? result : result.data || [];
          if (tenantList.length > 0) {
            setTenants(tenantList);
            setSelectedTenantName(tenantList[0].name);
            setImportingTenantName(tenantList[0].name);
          }
        }
      } catch (e) {}
    }
    fetchTenants();
  }, []);

  // Fetch available template packs from NestJS backend
  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    async function fetchTemplates() {
      try {
        const res = await fetch(`${API_BASE_URL}/knowledge-base/templates`);
        if (res.ok) {
          const list = await res.json();
          setTemplates(list);
          if (list.length > 0) {
            setSelectedTemplateId(list[0].id);
          }
        }
      } catch (e) {}
    }
    fetchTemplates();
  }, []);

  // Fetch knowledge base entries on page, filter, or search change
  const fetchKbEntries = async () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");

      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim());
      }

      const res = await fetch(`${API_BASE_URL}/knowledge-base?${params.toString()}`);
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

        setEntries(dataList);
        setMeta(metaData);
        setIsLive(true);
      } else {
        setEntries([]);
        setIsLive(false);
      }
    } catch (err) {
      console.warn("Failed to fetch knowledge base from NestJS backend:", err);
      setEntries([]);
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKbEntries();
  }, [page, debouncedSearch]);

  const handleAddKb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${API_BASE_URL}/knowledge-base`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName: selectedTenantName || "Default Tenant",
          question: question.trim(),
          answer: answer.trim(),
        }),
      });

      if (res.ok) {
        const newEntry = await res.json();
        setEntries((prev) => [newEntry, ...prev]);
        setMeta((prev) => ({ ...prev, total: prev.total + 1 }));
      }
    } catch (err) {
      console.warn("Failed to create knowledge base entry:", err);
    } finally {
      setQuestion("");
      setAnswer("");
      setIsModalOpen(false);
    }
  };

  const handleImportTemplate = async () => {
    if (!selectedTemplateId) return;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    setIsImporting(true);
    setImportSuccessMsg(null);

    try {
      const res = await fetch(`${API_BASE_URL}/knowledge-base/import-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          tenantName: importingTenantName || "Default Tenant",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setImportSuccessMsg(`Successfully imported ${data.importedCount} entries from template "${data.templateName}"!`);
        await fetchKbEntries();
        setTimeout(() => {
          setIsTemplateModalOpen(false);
          setImportSuccessMsg(null);
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to import template pack:", err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${API_BASE_URL}/knowledge-base/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        setMeta((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      }
    } catch (err) {
      console.warn("Failed to delete knowledge base entry:", err);
    }
  };

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tenant Knowledge Base</h1>
          <p className="text-xs text-slate-400">
            Domain-specific Q&A knowledge injected into LLM context during live phone calls.
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
            <span>{isLive ? `${meta.total} Knowledge Entries` : "API Offline (0 Entries)"}</span>
          </span>

          {/* Template Import Button */}
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-sm font-medium rounded-xl transition-all shadow-md inline-flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Import Template Pack</span>
          </button>

          {/* Add Single Entry Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-md inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Entry</span>
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
          placeholder="Search questions, answers, or tenants..."
          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      {/* Grid of Knowledge Entries */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 animate-pulse h-36">
                <div className="h-4 bg-slate-800 rounded w-1/3 mb-3"></div>
                <div className="h-5 bg-slate-800 rounded w-3/4 mb-3"></div>
                <div className="h-12 bg-slate-800 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-slate-300">No Knowledge Base Entries Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Choose an Industry Template Pack above to pre-populate Q&A domain knowledge in 1 click!
              </p>
            </div>
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl inline-flex items-center space-x-2 shadow-lg"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Browse 6 Industry Templates</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map((item) => (
              <div key={item.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg relative group">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                    <Building2 className="h-3.5 w-3.5 mr-1" /> {item.tenantName}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-all"
                    title="Delete Entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{item.question}</h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Server Pagination Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} knowledge entries)
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

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* INDUSTRY TEMPLATE PACK MODAL */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-indigo-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">Industry Knowledge Base Templates</h2>
                  <p className="text-xs text-slate-400">Select an industry model to pre-populate 5 production-ready Q&A domain entries into your tenant.</p>
                </div>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Success Feedback Banner */}
            {importSuccessMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold p-4 rounded-2xl flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            {/* Select Industry Template Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  1. Select Industry Model Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-slate-900 border border-indigo-500/40 rounded-xl p-3 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.category} — {tpl.entries.length} Q&As)
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Tenant Selector */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  2. Apply Template Pack To Tenant
                </label>
                <select
                  value={importingTenantName}
                  onChange={(e) => setImportingTenantName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
            </div>

            {/* 6 Industry Template Quick Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {templates.map((tpl) => {
                const isSelected = tpl.id === selectedTemplateId;
                const icon = ICON_MAP[tpl.iconName] || <Layers className="h-4 w-4 text-indigo-400" />;

                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center text-center space-y-1.5 ${
                      isSelected
                        ? "bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">{icon}</div>
                    <span className="font-bold text-white text-[11px] leading-tight">{tpl.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Template Entry Preview Box */}
            {activeTemplate && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <span>Included Q&A Entry Preview ({activeTemplate.entries.length} Items)</span>
                  </span>
                  <span className="text-slate-500 font-normal">Auto-injected into LLM context</span>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {activeTemplate.entries.map((entry, idx) => (
                    <div key={idx} className="bg-slate-900/80 border border-slate-800/80 p-2.5 rounded-xl text-xs space-y-1">
                      <div className="font-semibold text-white">Q: {entry.question}</div>
                      <div className="text-slate-400 text-[11px] leading-relaxed">A: {entry.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleImportTemplate}
                disabled={isImporting || !selectedTemplateId}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg inline-flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isImporting ? "Injecting Template..." : `Apply ${activeTemplate?.name || "Template"} Pack`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* SINGLE ENTRY CREATION MODAL */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Add Knowledge Base Entry</h2>
            <form onSubmit={handleAddKb} className="space-y-4">
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Question</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What are your opening hours?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="e.g., We are open Monday through Friday from 8 AM to 6 PM."
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl shadow-md"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

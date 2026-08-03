"use client";

import React, { useEffect, useState, Suspense } from "react";
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneCall,
  Play,
  Pause,
  Search,
  Volume2,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import WebVoiceCallModal from "@/components/WebVoiceCallModal";

interface CallTurn {
  role: "agent" | "user" | string;
  text: string;
  timestamp?: string;
}

interface ApiCall {
  id: string;
  sid?: string | null;
  direction: string;
  status: string;
  callerName?: string | null;
  callerPhone: string;
  duration: number;
  recordingUrl?: string | null;
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

function CallsPageContent() {
  const searchParams = useSearchParams();
  const urlCallId = searchParams ? searchParams.get("callId") : null;

  const [calls, setCalls] = useState<ApiCall[]>([]);
  const [selectedCall, setSelectedCall] = useState<ApiCall | null>(null);
  const [filter, setFilter] = useState<"ALL" | "INBOUND" | "OUTBOUND" | "COMPLETED" | "FORWARD_REQUESTED">("ALL");
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [isWebCallOpen, setIsWebCallOpen] = useState(false);

  // Stop audio playback when switching selected call
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, [selectedCall?.id]);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch calls whenever filter, page, or debounced search changes
  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    async function fetchCalls() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "10");

        if (filter !== "ALL") {
          if (filter === "INBOUND" || filter === "OUTBOUND") {
            params.append("direction", filter);
          } else {
            params.append("status", filter);
          }
        }

        if (debouncedSearch.trim()) {
          params.append("search", debouncedSearch.trim());
        }

        const res = await fetch(`${API_BASE_URL}/calls?${params.toString()}`);
        if (res.ok) {
          const result = await res.json();
          const callData = Array.isArray(result) ? result : result.data || [];
          const metaData = result.meta || {
            total: callData.length,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          };

          setCalls(callData);
          setMeta(metaData);
          setSelectedCall((prev) => {
            if (urlCallId) {
              const matchedCall = callData.find((c: ApiCall) => c.id === urlCallId || c.sid === urlCallId);
              if (matchedCall) return matchedCall;
            }
            if (prev && callData.some((c: ApiCall) => c.id === prev.id)) {
              return callData.find((c: ApiCall) => c.id === prev.id) || callData[0] || null;
            }
            return callData[0] || null;
          });
          setIsLive(true);
        } else {
          setCalls([]);
          setSelectedCall(null);
          setIsLive(false);
        }
      } catch (err) {
        console.warn("Failed to fetch calls from NestJS backend:", err);
        setCalls([]);
        setSelectedCall(null);
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCalls();
  }, [filter, page, debouncedSearch]);

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const turns: CallTurn[] = selectedCall && Array.isArray(selectedCall.transcript)
    ? selectedCall.transcript
    : [];

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Call History & Transcripts</h1>
          <p className="text-xs text-slate-400">
            Real-time Twilio media stream audit log, STT transcriptions, and audio playback simulator.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsWebCallOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition-all shadow-md inline-flex items-center space-x-2 animate-pulse hover:animate-none"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Start Web Voice Call</span>
          </button>
          <span
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isLive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            <Activity className="h-3 w-3 animate-pulse" />
            <span>{isLive ? `${meta.total} Total Recorded Calls` : "API Offline (0 Calls)"}</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by caller, phone, or summary..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {(["ALL", "INBOUND", "OUTBOUND", "COMPLETED", "FORWARD_REQUESTED"] as const).map((f) => (
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

      {/* Main Call List & Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Call List Column */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-4 min-h-[550px] max-h-[720px]">
          <div className="divide-y divide-slate-800 overflow-y-auto pr-1 flex-1">
            {isLoading ? (
              <div className="text-center py-20 text-slate-500 text-xs">
                Loading calls stream...
              </div>
            ) : calls.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-xs">
                No call records found.
              </div>
            ) : (
              calls.map((call) => {
                const rawPhone = call.callerPhone || "";
                const isWeb = !rawPhone || rawPhone === "Unknown" || rawPhone.includes("Web");
                const phoneDisplay = isWeb ? "+1 (Web Voice Call)" : rawPhone;
                const displayName = call.callerName || (isWeb ? "Web Voice Call" : rawPhone);
                const timeStr = call.createdAt
                  ? new Date(call.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "—";

                return (
                  <div
                    key={call.id}
                    onClick={() => {
                      setSelectedCall(call);
                      setIsPlaying(false);
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedCall?.id === call.id
                        ? "bg-indigo-600/10 border border-indigo-500/30 shadow-md"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-2 rounded-lg ${
                            call.direction === "INBOUND" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                          }`}
                        >
                          {call.direction === "INBOUND" ? (
                            <PhoneIncoming className="h-4 w-4" />
                          ) : (
                            <PhoneOutgoing className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">{displayName}</h3>
                          <p className="text-xs text-slate-400 font-mono">{phoneDisplay}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{timeStr}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2">{call.summary || "No summary provided."}</p>
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                      <span className="font-mono">{call.duration}s</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          call.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {call.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Server Pagination Bar */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs text-slate-400">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} calls)
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

        {/* Call Detail Inspector */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          {selectedCall ? (
            <div className="space-y-6">
              {/* Detail Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedCall.callerName || selectedCall.tenant?.name || "Anonymous Caller"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedCall.callerPhone} • CallSid: {selectedCall.sid || selectedCall.id}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      selectedCall.sentiment === "POSITIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : selectedCall.sentiment === "NEGATIVE"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {selectedCall.sentiment || "NEUTRAL"} SENTIMENT
                  </span>
                </div>
              </div>

              {/* Audio Player */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                {selectedCall.recordingUrl ? (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="inline-flex items-center">
                        <Volume2 className="h-3.5 w-3.5 mr-1 text-indigo-400" /> Twilio Audio Recording Playback
                      </span>
                      <span>{selectedCall.duration}s</span>
                    </div>
                    <audio controls className="w-full h-10 accent-indigo-500" src={selectedCall.recordingUrl} />
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        if (isPlaying) {
                          if (typeof window !== "undefined" && window.speechSynthesis) {
                            window.speechSynthesis.cancel();
                          }
                          setIsPlaying(false);
                        } else {
                          const transcriptList = Array.isArray(selectedCall?.transcript) ? selectedCall.transcript : [];
                          if (transcriptList.length === 0) {
                            alert("No recorded transcript available for this call.");
                            return;
                          }
                          setIsPlaying(true);
                          if (typeof window !== "undefined" && window.speechSynthesis) {
                            window.speechSynthesis.cancel();
                            const textToRead = transcriptList
                              .map((t: any) => `${t.text || t.content || ""}`.trim())
                              .filter(Boolean)
                              .join(". ");

                            const utterance = new SpeechSynthesisUtterance(textToRead);
                            utterance.onend = () => setIsPlaying(false);
                            utterance.onerror = () => setIsPlaying(false);
                            window.speechSynthesis.speak(utterance);
                          }
                        }
                      }}
                      className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all shadow-md"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </button>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="inline-flex items-center">
                          <Volume2 className="h-3.5 w-3.5 mr-1 text-indigo-400" /> Audio Recording Simulator
                        </span>
                        <span>{selectedCall.duration}s</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`bg-indigo-500 h-full transition-all duration-300 ${
                            isPlaying ? "w-2/3 animate-pulse" : "w-0"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">AI Executive Summary</h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedCall.summary || "No executive summary available for this call stream."}
                </p>
              </div>

              {/* Transcript Chat Turns */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Live Stream Dialogue Transcript
                </h4>
                {turns.length === 0 ? (
                  <div className="text-xs text-slate-500 italic bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                    No turn-by-turn dialogue transcript recorded for this call session.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                    {turns.map((turn, idx) => (
                      <div
                        key={idx}
                        className={`flex ${turn.role === "agent" ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                            turn.role === "agent"
                              ? "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60"
                              : "bg-indigo-600 text-white rounded-tr-none shadow-md"
                          }`}
                        >
                          <div className="font-semibold text-[10px] text-slate-400 mb-1">
                            {turn.role === "agent" ? "AI Receptionist" : (selectedCall.callerName || "Caller")} {turn.timestamp ? `• ${turn.timestamp}` : ""}
                          </div>
                          {turn.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              Select a call record to view full transcript & audio playback.
            </div>
          )}
        </div>
      </div>

      <WebVoiceCallModal
        isOpen={isWebCallOpen}
        onClose={() => setIsWebCallOpen(false)}
        agentName={selectedCall?.agent?.name || "AI Receptionist"}
        tenantName={selectedCall?.tenant?.name || "Default Business"}
      />
    </div>
  );
}

export default function CallsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading call history...</div>}>
      <CallsPageContent />
    </Suspense>
  );
}

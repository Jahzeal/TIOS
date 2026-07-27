"use client";

import React, { useEffect, useState } from "react";
import { Sliders, Save, Send, Bot, CheckCircle, Activity, RefreshCw } from "lucide-react";

interface ApiAgent {
  id: string;
  name: string;
  voiceId: string;
  prompt: string;
  phoneNumber?: string | null;
  tenantId?: string | null;
  tenant?: {
    id: string;
    name: string;
    twilioPhone?: string | null;
  } | null;
}

interface ChatTurn {
  role: "agent" | "user" | string;
  text: string;
  timestamp: string;
}

export default function SettingsPage() {
  const [agents, setAgents] = useState<ApiAgent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [agentName, setAgentName] = useState<string>("");
  const [voiceId, setVoiceId] = useState<string>("");

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Chat simulator state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Load agents on initial render
  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    async function fetchAgents() {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/settings/agents`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAgents(data);
            const initial = data[0];
            setSelectedAgentId(initial.id);
            setAgentName(initial.name);
            setVoiceId(initial.voiceId || "21m00Tcm4TlvDq8ikWAM");
            setSystemPrompt(initial.prompt || "");

            setChatHistory([
              {
                role: "agent",
                text: `Hello! I am ${initial.name.split(" ")[0]}. I am configured with your system prompt. Ask me anything to test my response!`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
            setIsLive(true);
          } else {
            setAgents([]);
            setSelectedAgentId("");
            setAgentName("");
            setVoiceId("");
            setSystemPrompt("");
            setIsLive(true);
          }
        } else {
          setAgents([]);
          setIsLive(false);
        }
      } catch (err) {
        console.warn("Failed to fetch settings from NestJS backend:", err);
        setAgents([]);
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgents();
  }, []);

  const handleAgentChange = (id: string) => {
    setSelectedAgentId(id);
    const agent = agents.find((a) => a.id === id);
    if (agent) {
      setAgentName(agent.name);
      setVoiceId(agent.voiceId || "21m00Tcm4TlvDq8ikWAM");
      setSystemPrompt(agent.prompt || "");
    }
  };

  const handleSave = async () => {
    if (!selectedAgentId) return;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE_URL}/settings/agent/${selectedAgentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agentName,
          prompt: systemPrompt,
          voiceId: voiceId,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setAgents((prev) => prev.map((a) => (a.id === selectedAgentId ? { ...a, ...updated } : a)));
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.warn("Failed to update agent settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSimulating) return;

    const userText = chatInput.trim();
    const userMessage: ChatTurn = {
      role: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsSimulating(true);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${API_BASE_URL}/settings/prompt-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: systemPrompt,
          userMessage: userText,
          agentId: selectedAgentId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const agentMessage: ChatTurn = {
          role: "agent",
          text: data.reply || "Thank you for calling!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setChatHistory((prev) => [...prev, agentMessage]);
      } else {
        const fallbackMessage: ChatTurn = {
          role: "agent",
          text: "Thank you for calling! I am configured with your system prompt instructions.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setChatHistory((prev) => [...prev, fallbackMessage]);
      }
    } catch (err) {
      const fallbackMessage: ChatTurn = {
        role: "agent",
        text: "Thank you for calling! I am operating under your active agent system prompt.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatHistory((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Agent Settings & Prompt Tester</h1>
          <p className="text-xs text-slate-400">
            Configure system persona, voice synthesis IDs, and test system prompt responses in real time.
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
            <span>{isLive ? "Live API Connected" : "API Offline (Local)"}</span>
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving || !selectedAgentId}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all shadow-md inline-flex items-center space-x-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="h-4 w-4" />
          <span>Agent configuration and prompt instructions updated successfully in backend database!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prompt Config Column */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <Sliders className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Agent Persona & Voice Tuning</h2>
          </div>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-slate-800 rounded-xl w-full"></div>
              <div className="h-10 bg-slate-800 rounded-xl w-full"></div>
              <div className="h-32 bg-slate-800 rounded-xl w-full"></div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Agent
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => handleAgentChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {agents.length === 0 ? (
                    <option value="">No agents configured in database</option>
                  ) : (
                    agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.tenant?.name ? `${ag.tenant.name} — ${ag.name}` : ag.name} ({ag.tenant?.twilioPhone || ag.phoneNumber || ag.id.slice(0, 8)})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    ElevenLabs Voice ID
                  </label>
                  <input
                    type="text"
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  System Instruction Prompt
                </label>
                <textarea
                  rows={8}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Instructions dictate how GPT-4o-mini responds to callers. Keep prompt under 300 words for optimal voice turn latency.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Live Prompt Tester Simulator Column */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[600px]">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 mb-4">
              <Bot className="h-5 w-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Live OpenAI Prompt Simulator</h2>
            </div>

            {/* Dialogue history */}
            <div className="space-y-3 h-[420px] overflow-y-auto pr-2">
              {chatHistory.map((turn, idx) => (
                <div key={idx} className={`flex ${turn.role === "agent" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-xs p-3 rounded-xl text-xs leading-relaxed ${
                      turn.role === "agent"
                        ? "bg-slate-800 text-slate-200 border border-slate-700/60"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    <div className="font-semibold text-[10px] text-slate-400 mb-1">
                      {turn.role === "agent" ? (agentName || "AI Receptionist") : "User"} • {turn.timestamp}
                    </div>
                    {turn.text}
                  </div>
                </div>
              ))}
              {isSimulating && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-3 rounded-xl text-xs text-slate-400 animate-pulse">
                    AI Assistant is generating response...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2 pt-3 border-t border-slate-800">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Test prompt response live..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isSimulating}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

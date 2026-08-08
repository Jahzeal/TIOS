"use client";

import React, { useEffect, useState } from "react";
import { Sliders, Save, Send, Bot, CheckCircle, Activity, RefreshCw, Plus, Trash2, PhoneCall, Clock } from "lucide-react";

interface ApiAgent {
  id: string;
  name: string;
  voiceId: string;
  prompt: string;
  phoneNumber?: string | null;
  tenantId?: string | null;
  callbackCadence?: any;
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

interface CadenceStepItem {
  step: number;
  value: number | string;
  unit: "MINUTES" | "HOURS" | "DAYS";
}

export default function SettingsPage() {
  const [agents, setAgents] = useState<ApiAgent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [agentName, setAgentName] = useState<string>("");
  const [voiceId, setVoiceId] = useState<string>("");

  // Cadence State
  const [cadenceSteps, setCadenceSteps] = useState<CadenceStepItem[]>([
    { step: 1, value: 15, unit: "MINUTES" },
    { step: 2, value: 24, unit: "HOURS" },
    { step: 3, value: 48, unit: "HOURS" },
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Chat simulator state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const parseCadenceToItems = (cadenceRaw: any): CadenceStepItem[] => {
    if (Array.isArray(cadenceRaw) && cadenceRaw.length > 0) {
      return cadenceRaw.map((item: any, idx: number) => {
        const mins = Number(item.delayMinutes) || 15;
        if (mins % 1440 === 0) {
          return { step: idx + 1, value: mins / 1440, unit: "DAYS" };
        } else if (mins % 60 === 0) {
          return { step: idx + 1, value: mins / 60, unit: "HOURS" };
        } else {
          return { step: idx + 1, value: mins, unit: "MINUTES" };
        }
      });
    }
    return [
      { step: 1, value: 15, unit: "MINUTES" },
      { step: 2, value: 24, unit: "HOURS" },
      { step: 3, value: 48, unit: "HOURS" },
    ];
  };

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
            setCadenceSteps(parseCadenceToItems(initial.callbackCadence));

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
      setCadenceSteps(parseCadenceToItems(agent.callbackCadence));
    }
  };

  const handleAddCadenceStep = () => {
    setCadenceSteps((prev) => {
      const nextStepNum = prev.length + 1;
      return [...prev, { step: nextStepNum, value: 24 * (nextStepNum - 1), unit: "HOURS" }];
    });
  };

  const handleRemoveCadenceStep = (index: number) => {
    setCadenceSteps((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.map((item, idx) => ({ ...item, step: idx + 1 }));
    });
  };

  const getUnitLimits = (unit: "MINUTES" | "HOURS" | "DAYS") => {
    if (unit === "MINUTES") return { min: 1, max: 60 };
    if (unit === "HOURS") return { min: 1, max: 24 };
    return { min: 1, max: 31 };
  };

  const handleCadenceStepChange = (index: number, field: "value" | "unit", val: any) => {
    setCadenceSteps((prev) => {
      const copy = [...prev];
      if (field === "value") {
        if (val === "" || val === null || val === undefined) {
          copy[index].value = "";
        } else {
          const limits = getUnitLimits(copy[index].unit);
          const numVal = parseInt(String(val), 10);
          if (!isNaN(numVal)) {
            copy[index].value = Math.min(limits.max, Math.max(0, numVal));
          }
        }
      } else {
        const newUnit = val as "MINUTES" | "HOURS" | "DAYS";
        copy[index].unit = newUnit;
        const limits = getUnitLimits(newUnit);
        const numVal = Number(copy[index].value) || 1;
        if (numVal > limits.max) copy[index].value = limits.max;
      }
      return copy;
    });
  };

  const handleCadenceStepBlur = (index: number) => {
    setCadenceSteps((prev) => {
      const copy = [...prev];
      const item = copy[index];
      const limits = getUnitLimits(item.unit);
      let numVal = parseInt(String(item.value), 10);
      if (isNaN(numVal) || numVal < limits.min) numVal = limits.min;
      if (numVal > limits.max) numVal = limits.max;
      copy[index].value = numVal;
      return copy;
    });
  };

  const handleSave = async () => {
    if (!selectedAgentId) return;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // Convert cadence items to delayMinutes
    const callbackCadence = cadenceSteps.map((s, idx) => {
      const limits = getUnitLimits(s.unit);
      let numVal = parseInt(String(s.value), 10);
      if (isNaN(numVal) || numVal < limits.min) numVal = limits.min;
      if (numVal > limits.max) numVal = limits.max;

      let mins = numVal;
      if (s.unit === "HOURS") mins = numVal * 60;
      if (s.unit === "DAYS") mins = numVal * 1440;
      return { step: idx + 1, delayMinutes: mins };
    });

    const firstDelayMins = callbackCadence[0]?.delayMinutes || 15;

    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE_URL}/settings/agent/${selectedAgentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agentName,
          prompt: systemPrompt,
          voiceId: voiceId,
          callbackDelayMinutes: firstDelayMins,
          callbackDelayHours: Math.ceil(firstDelayMins / 60),
          callbackCadence: callbackCadence,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setAgents((prev) => prev.map((a) => (a.id === selectedAgentId ? { ...a, ...updated } : a)));
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Failed to save agent settings:", err);
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
            Configure system persona, voice synthesis IDs, custom call cadence timing, and test prompt responses in real time.
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
          <span>Agent configuration and multi-touch call cadence updated successfully in database!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prompt Config Column */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <Sliders className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Agent Persona & Cadence Tuning</h2>
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

              {/* Multi-Touch Follow-Up Call Cadence Builder */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Automated Multi-Touch Call Cadence
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Auto-cancels if paid
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Configure sequential follow-up calls. If a customer hasn&apos;t paid, the AI will place follow-up calls according to these steps.
                </p>

                <div className="space-y-2.5 pt-1">
                  {cadenceSteps.map((stepItem, index) => {
                    const limits = getUnitLimits(stepItem.unit);

                    return (
                      <div key={index} className="flex items-center space-x-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-1.5 min-w-[85px]">
                          <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-xs font-bold text-white">Call {stepItem.step}</span>
                        </div>

                        <div className="flex-1 flex items-center space-x-2">
                          <input
                            type="number"
                            min={limits.min}
                            max={limits.max}
                            value={stepItem.value}
                            onChange={(e) => handleCadenceStepChange(index, "value", e.target.value)}
                            onBlur={() => handleCadenceStepBlur(index)}
                            className="w-20 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-white text-center focus:outline-none focus:border-indigo-500"
                          />
                          <select
                            value={stepItem.unit}
                            onChange={(e) => handleCadenceStepChange(index, "unit", e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="MINUTES">Minutes after inquiry (1-60)</option>
                            <option value="HOURS">Hours after inquiry (1-24)</option>
                            <option value="DAYS">Days after inquiry (1-31)</option>
                          </select>
                        </div>

                        {cadenceSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCadenceStep(index)}
                            className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Remove Call Step"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleAddCadenceStep}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-indigo-400 hover:text-indigo-300 font-semibold text-xs rounded-xl transition-all border border-indigo-500/30 flex items-center justify-center space-x-2 mt-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Call {cadenceSteps.length + 1} Step</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  System Persona Prompt Instructions
                </label>
                <textarea
                  rows={9}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>
            </>
          )}
        </div>

        {/* Real-time LLM Prompt Tester Column */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[580px]">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <Bot className="h-5 w-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Live System Prompt Simulator</h2>
            </div>
            <p className="text-xs text-slate-400">
              Test how your agent responds to customer questions, objections, or payment link requests with your active prompt instructions and Knowledge Base.
            </p>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 pt-2">
              {chatHistory.map((turn, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${turn.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs shadow-sm ${
                      turn.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none"
                    }`}
                  >
                    <p className="leading-relaxed">{turn.text}</p>
                    <span className="block text-[10px] text-slate-400 mt-1 text-right">{turn.timestamp}</span>
                  </div>
                </div>
              ))}
              {isSimulating && (
                <div className="flex items-start space-x-2">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 animate-pulse">
                    AI Agent is typing response...
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask agent a question or request a payment link..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isSimulating || !chatInput.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

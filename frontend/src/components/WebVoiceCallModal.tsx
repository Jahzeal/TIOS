"use client";

import React, { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, X, Sparkles, Activity } from "lucide-react";

interface WebVoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId?: string;
  agentName?: string;
  tenantName?: string;
}

interface ChatTurn {
  role: "agent" | "user";
  text: string;
  timestamp: string;
}

export default function WebVoiceCallModal({
  isOpen,
  onClose,
  agentId,
  agentName = "AI Receptionist",
  tenantName = "Default Business",
}: WebVoiceCallModalProps) {
  const [callStatus, setCallStatus] = useState<"IDLE" | "CONNECTING" | "ACTIVE" | "ENDED">("IDLE");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcripts, setTranscripts] = useState<ChatTurn[]>([]);
  const [currentAgentText, setCurrentAgentText] = useState("");
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isOpen) {
      endCall();
    }
  }, [isOpen]);

  useEffect(() => {
    if (callStatus === "ACTIVE") {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  const startCall = async () => {
    try {
      // Synchronously initialize and unblock AudioContext on user click gesture
      if (typeof window !== "undefined") {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        ctx.resume();
        audioContextRef.current = ctx;
      }

      setCallStatus("CONNECTING");
      setCallDuration(0);
      setTranscripts([]);
      setCurrentAgentText("");
      setIsMuted(false);
      nextStartTimeRef.current = 0;

      // Get user microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const wsProtocol = API_BASE_URL.startsWith("https") ? "wss" : "ws";
      const host = API_BASE_URL.replace(/^https?:\/\//, "");

      const webCallSid = `web-call-${Date.now()}`;
      const wsUrl = `${wsProtocol}://${host}/stream?tenantId=web-tenant&agentId=${agentId || "default-agent"}&callSid=${webCallSid}&callerPhone=${encodeURIComponent("+1 (Web Browser)")}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setCallStatus("ACTIVE");

        // Send start event
        ws.send(
          JSON.stringify({
            event: "start",
            start: {
              streamSid: `stream-${webCallSid}`,
              callSid: webCallSid,
            },
          })
        );

        // Record audio chunks and send over WebSocket
        try {
          const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = async (e) => {
            if (e.data.size > 0 && ws.readyState === WebSocket.OPEN && !isMuted) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64Audio = (reader.result as string).split(",")[1];
                if (base64Audio) {
                  ws.send(
                    JSON.stringify({
                      event: "media",
                      media: { payload: base64Audio },
                    })
                  );
                }
              };
              reader.readAsDataURL(e.data);
            }
          };

          mediaRecorder.start(250); // Send audio every 250ms
        } catch (err) {
          console.warn("MediaRecorder fallback mode:", err);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.event === "clear") {
            if (audioContextRef.current) {
              if (audioContextRef.current.state === "suspended") {
                audioContextRef.current.resume().catch(() => {});
              }
              nextStartTimeRef.current = audioContextRef.current.currentTime;
            } else {
              nextStartTimeRef.current = 0;
            }
          } else if (data.event === "media" && data.media?.payload) {
            // Play raw audio or text response
            playAudioPayload(data.media.payload);
          } else if (data.event === "transcript") {
            const newTurn: ChatTurn = {
              role: data.role || "agent",
              text: data.text,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setTranscripts((prev) => [...prev, newTurn]);
          }
        } catch (e) {
          // ignore non-json frames
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setCallStatus("ENDED");
      };

      ws.onclose = () => {
        setCallStatus("ENDED");
      };
    } catch (err) {
      console.error("Failed to start web voice call:", err);
      alert("Microphone permission is required to place a web call.");
      setCallStatus("IDLE");
    }
  };

  const nextStartTimeRef = useRef<number>(0);

  const mulawToPcmSample = (mulawByte: number): number => {
    mulawByte = ~mulawByte & 0xff;
    const sign = mulawByte & 0x80 ? -1 : 1;
    const exponent = (mulawByte >> 4) & 0x07;
    const mantissa = mulawByte & 0x0f;
    const sample = (((mantissa << 3) + 0x84) << exponent) - 0x84;
    return (sign * sample) / 32768.0;
  };

  const playAudioPayload = (base64Data: string) => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const pcm32 = new Float32Array(len);

      for (let i = 0; i < len; i++) {
        pcm32[i] = mulawToPcmSample(binaryString.charCodeAt(i));
      }

      const buffer = ctx.createBuffer(1, len, 8000);
      buffer.getChannelData(0).set(pcm32);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
    } catch (e) {
      console.error("Web Audio playback error:", e);
      try {
        const audio = new Audio(`data:audio/mp3;base64,${base64Data}`);
        audio.play().catch(() => {});
      } catch (err) {}
    }
  };

  const toggleMute = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const endCall = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    nextStartTimeRef.current = 0;
    setCallStatus("ENDED");
  };

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Web Voice AI Call Tester</h2>
          </div>
          <button
            onClick={() => {
              endCall();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Avatar & Call Indicator */}
        <div className="flex flex-col items-center justify-center space-y-3 py-4">
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                callStatus === "ACTIVE"
                  ? "bg-indigo-600/20 border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-pulse"
                  : "bg-slate-800 border border-slate-700"
              }`}
            >
              <Volume2 className={`h-10 w-10 ${callStatus === "ACTIVE" ? "text-indigo-400" : "text-slate-500"}`} />
            </div>

            {callStatus === "ACTIVE" && (
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 animate-ping" />
            )}
          </div>

          <div className="text-center">
            <h3 className="text-lg font-bold text-white">{agentName}</h3>
            <p className="text-xs text-slate-400">{tenantName}</p>
          </div>

          {/* Status Badge */}
          <div className="pt-1">
            {callStatus === "IDLE" && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Ready to Test Call
              </span>
            )}
            {callStatus === "CONNECTING" && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 animate-pulse inline-flex items-center space-x-1.5">
                <Activity className="h-3.5 w-3.5 animate-spin" />
                <span>Connecting Web Voice Stream...</span>
              </span>
            )}
            {callStatus === "ACTIVE" && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                🔴 Live • {formatTime(callDuration)}
              </span>
            )}
            {callStatus === "ENDED" && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                Call Ended
              </span>
            )}
          </div>
        </div>

        {/* Live Conversation Transcript */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 h-48 overflow-y-auto space-y-2">
          {transcripts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs italic">
              {callStatus === "ACTIVE"
                ? "Speak into your microphone to talk to the AI Receptionist..."
                : "Click 'Start Voice Call' below to begin live browser voice testing."}
            </div>
          ) : (
            transcripts.map((turn, idx) => (
              <div key={idx} className={`flex ${turn.role === "agent" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed ${
                    turn.role === "agent"
                      ? "bg-slate-800 text-slate-200 border border-slate-700/60"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  <div className="font-semibold text-[10px] text-slate-400 mb-0.5">
                    {turn.role === "agent" ? agentName : "You"} • {turn.timestamp}
                  </div>
                  {turn.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Call Control Buttons */}
        <div className="flex items-center justify-center space-x-4 pt-2">
          {callStatus === "ACTIVE" && (
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition-all ${
                isMuted
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
              }`}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>
          )}

          {callStatus === "ACTIVE" || callStatus === "CONNECTING" ? (
            <button
              onClick={endCall}
              className="p-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition-all shadow-lg hover:shadow-rose-600/30 flex items-center justify-center"
              title="End Call"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          ) : (
            <button
              onClick={startCall}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-full transition-all shadow-lg hover:shadow-emerald-600/30 inline-flex items-center space-x-2"
            >
              <Phone className="h-5 w-5" />
              <span>Start Voice Call</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

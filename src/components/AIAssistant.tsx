/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Sparkles, Loader2, AlertCircle, RefreshCw, Send } from "lucide-react";
import { TripBudget } from "../types";

const BLOCKED_URL_SCHEMES = /^(javascript|data|vbscript):/i;

function safeUrlTransform(url: string): string {
  const trimmed = url.trim();
  if (BLOCKED_URL_SCHEMES.test(trimmed)) {
    return "";
  }
  return trimmed;
}

interface AIAssistantProps {
  activeTrip: TripBudget;
  onUpdateAnalysis: (analysisText: string) => void;
}

const LOADING_MESSAGES = [
  "Checking tire pressure at a local vulcanizing shop...",
  "Consulting Marilaque, Cordillera, and Sierra Madre road layouts...",
  "Estimating class 1 toll fees for NLEX, SLEX, TPLEX, and STAR Tollway...",
  "Topping up engine oil and tightening chain slack for rugged provincial roads...",
  "Verifying fuel injection mapping for high-altitude mountain climbs in Baguio...",
  "Sourcing local transient house rates and beachside campsite listings...",
  "Checking roll-on/roll-off (RoRo) ferry schedules for island crossings...",
  "Factoring in contingency buffer for sudden rain showers and packing kapote...",
  "Checking and adjusting rear shocks for sudden potholes and speed bumps...",
  "Preparing GCash or RFID wallets for contactless toll booths...",
];

export const AIAssistant: React.FC<AIAssistantProps> = ({ activeTrip, onUpdateAnalysis }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");

  // Cycle loading messages during active analysis
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const runAnalysis = async (specificInquiry?: string) => {
    setLoading(true);
    setError(null);
    setLoadingMessageIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));

    // Incorporate specific query if clicked/typed
    const notesWithInquiry = specificInquiry
      ? `${activeTrip.customNotes || ""}\n\n[Rider specific inquiry: ${specificInquiry}]`.trim()
      : activeTrip.customNotes;

    const requestPayload = {
      tripName: activeTrip.tripName,
      motorcycleModel: activeTrip.motorcycleModel,
      distance: activeTrip.distance,
      distanceUnit: activeTrip.distanceUnit,
      fuelEconomy: activeTrip.fuelEconomy,
      fuelEconomyUnit: activeTrip.fuelEconomyUnit,
      fuelPrice: activeTrip.fuelPrice,
      fuelPriceUnit: activeTrip.fuelPriceUnit,
      duration: activeTrip.duration,
      expenses: activeTrip.expenses,
      ridingStyle: activeTrip.ridingStyle,
      routeType: activeTrip.routeType,
      passenger: activeTrip.passenger,
      customNotes: notesWithInquiry,
    };

    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate AI analysis.");
      }

      const data = await response.json();
      onUpdateAnalysis(data.analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while communicating with the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    runAnalysis(customPrompt);
    setCustomPrompt("");
  };

  const quickPrompts = [
    { text: "Can I do this trip cheaper by camping?", label: "Camping Options" },
    { text: "What motorcycle-specific maintenance gear should I bring?", label: "Gear Checklist" },
    { text: "How does carrying a passenger (two-up) affect my fuel budget?", label: "Two-Up Dynamics" },
    { text: "Is my Emergency Fund size realistic for mechanical breakdown?", label: "Emergency Audit" },
  ];

  return (
    <div id="ai-assistant-card" className="bg-[#111111] border border-amber-900/30 p-6 rounded-2xl flex flex-col h-full shadow-xl relative overflow-hidden">
      {/* Decorative background visual */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            AI Budget Assistant
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Get custom reviews and forgotten cost suggestions from a route expert.</p>
        </div>
        {activeTrip.aiAnalysis && !loading && (
          <button
            onClick={() => runAnalysis()}
            className="p-1.5 text-zinc-400 hover:text-white bg-[#0A0A0A] hover:bg-[#0F0F0F] border border-zinc-800 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer font-medium"
            title="Recalculate report"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-Analyze
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-300 mb-4 flex gap-2.5 items-start">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Analysis Failed</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-h-[300px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-6">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <div className="text-center max-w-[320px]">
              <span className="text-sm font-semibold text-zinc-200 block mb-1">Simulating Trip Parameters</span>
              <span className="text-xs text-amber-400 font-mono tracking-wide italic min-h-[40px] block">
                &quot;{LOADING_MESSAGES[loadingMessageIndex]}&quot;
              </span>
            </div>
          </div>
        ) : activeTrip.aiAnalysis ? (
          <div className="flex-1 flex flex-col justify-between">
            {/* Analysis report rendered safely with customized style components */}
            <div className="overflow-y-auto max-h-[500px] pr-2 mb-6 space-y-4">
              <Markdown
                rehypePlugins={[rehypeSanitize]}
                urlTransform={safeUrlTransform}
                components={{
                  h1: ({ ...props }) => (
                    <h1 className="text-base font-bold text-white mt-4 mb-2 border-b border-zinc-850 pb-1" {...props} />
                  ),
                  h2: ({ ...props }) => (
                    <h2 className="text-sm font-bold text-zinc-100 mt-4 mb-2 flex items-center gap-1.5" {...props} />
                  ),
                  h3: ({ ...props }) => (
                    <h3 className="text-xs font-semibold text-amber-500 mt-3 mb-1" {...props} />
                  ),
                  p: ({ ...props }) => (
                    <p className="text-xs text-[#C0C0C0] leading-relaxed mb-3 font-sans" {...props} />
                  ),
                  ul: ({ ...props }) => (
                    <ul className="list-disc pl-5 mb-3 space-y-1 text-xs text-[#C0C0C0]" {...props} />
                  ),
                  ol: ({ ...props }) => (
                    <ol className="list-decimal pl-5 mb-3 space-y-1 text-xs text-[#C0C0C0]" {...props} />
                  ),
                  li: ({ ...props }) => (
                    <li className="text-[#C0C0C0] marker:text-amber-500" {...props} />
                  ),
                  strong: ({ ...props }) => (
                    <strong className="font-semibold text-amber-500 bg-white/5 border border-white/5 px-1 py-0.2 rounded" {...props} />
                  ),
                  blockquote: ({ ...props }) => (
                    <blockquote className="border-l-2 border-amber-500 pl-3 italic text-zinc-400 my-2 bg-white/5 p-2.5 rounded-lg" {...props} />
                  ),
                }}
              >
                {activeTrip.aiAnalysis}
              </Markdown>
            </div>

            {/* Quick Refine & Custom Prompt Panel */}
            <div className="border-t border-zinc-800/80 pt-4">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Refine with Quick Queries</span>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => runAnalysis(q.text)}
                    className="px-2.5 py-1.5 bg-white/5 hover:border-amber-500/50 border border-white/5 text-zinc-300 hover:text-white rounded-lg text-[10px] font-medium transition-all cursor-pointer"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleCustomSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a custom question (e.g. 'What if it rains?')..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="flex-1 bg-[#0A0A0A] border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 outline-none italic"
                />
                <button
                  type="submit"
                  disabled={!customPrompt.trim()}
                  className="p-2 bg-amber-500 disabled:bg-[#0A0A0A] disabled:text-zinc-700 hover:bg-amber-600 text-black rounded-lg transition-all cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6 bg-[#0A0A0A]/40 border border-dashed border-[#222] rounded-xl">
            <Sparkles className="w-12 h-12 text-amber-500/30 animate-pulse mb-3" />
            <p className="text-sm font-semibold text-zinc-300">No Review Generated Yet</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-[280px] mb-5">
              Generate an expert-level review of your motorcycle budget. Find missing expenses and cost cutting opportunities!
            </p>
            <button
              onClick={() => runAnalysis()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg shadow-md shadow-amber-500/10 flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 text-black fill-black/10" />
              Analyze My Budget
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

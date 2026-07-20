/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TripBudget } from "../types";
import { ArrowRightLeft, X, Check, ArrowDownRight, ArrowUpRight } from "lucide-react";

interface TripComparerProps {
  activeTrip: TripBudget;
  compareTrip: TripBudget;
  onClose: () => void;
  onSetCompareAsActive: () => void;
}

export const TripComparer: React.FC<TripComparerProps> = ({
  activeTrip,
  compareTrip,
  onClose,
  onSetCompareAsActive,
}) => {
  const categories = [
    { key: "fuel", label: "Fuel Cost" },
    { key: "food", label: "Food & Drinks" },
    { key: "accommodation", label: "Lodging / Camping" },
    { key: "toll", label: "Road Tolls" },
    { key: "parking", label: "Secure Parking" },
    { key: "ferry", label: "Ferry Fees" },
    { key: "miscellaneous", label: "Miscellaneous" },
    { key: "emergency", label: "Contingency Fund" },
  ] as const;

  const getActiveTotal = () => {
    return Object.values(activeTrip.expenses).reduce((a, b) => a + b, 0);
  };

  const getCompareTotal = () => {
    return Object.values(compareTrip.expenses).reduce((a, b) => a + b, 0);
  };

  const activeTotal = getActiveTotal();
  const compareTotal = getCompareTotal();
  const totalDiff = activeTotal - compareTotal;

  return (
    <div id="trip-comparer" className="bg-[#151515] border border-[#222] p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-amber-500" />
            Side-By-Side Comparison
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Comparing differences between trip budgets.</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[#0F0F0F] text-zinc-500 hover:text-white rounded-lg transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid Comparison */}
      <div className="flex-1 overflow-y-auto max-h-[440px] space-y-4 pr-1">
        {/* Title row */}
        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800/60 pb-2">
          <div className="col-span-5">Metric</div>
          <div className="col-span-3 text-right">Active (Left)</div>
          <div className="col-span-4 text-right">Compared (Right)</div>
        </div>

        {/* Basic Parameters */}
        <div className="space-y-2 pb-3 border-b border-zinc-800/40">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Ride Details</span>
          
          {/* Trip Name */}
          <div className="grid grid-cols-12 gap-2 text-xs py-1">
            <div className="col-span-5 text-zinc-400 font-medium">Trip Name</div>
            <div className="col-span-3 text-right text-white font-bold truncate">{activeTrip.tripName || "Active"}</div>
            <div className="col-span-4 text-right text-amber-500 font-bold truncate">{compareTrip.tripName || "Saved"}</div>
          </div>

          {/* Motorcycle */}
          <div className="grid grid-cols-12 gap-2 text-xs py-1">
            <div className="col-span-5 text-zinc-400 font-medium">Motorcycle</div>
            <div className="col-span-3 text-right text-white font-medium truncate">{activeTrip.motorcycleModel || "Generic"}</div>
            <div className="col-span-4 text-right text-zinc-300 font-medium truncate">{compareTrip.motorcycleModel || "Generic"}</div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-12 gap-2 text-xs py-1">
            <div className="col-span-5 text-zinc-400 font-medium">Duration</div>
            <div className="col-span-3 text-right text-white font-semibold">{activeTrip.duration} Days</div>
            <div className="col-span-4 text-right text-zinc-300">
              {compareTrip.duration} Days
              <span className={`text-[10px] ml-1.5 font-bold ${activeTrip.duration === compareTrip.duration ? "text-zinc-650" : activeTrip.duration < compareTrip.duration ? "text-green-400" : "text-amber-500"}`}>
                ({activeTrip.duration === compareTrip.duration ? "=" : activeTrip.duration < compareTrip.duration ? `-${compareTrip.duration - activeTrip.duration}` : `+${activeTrip.duration - compareTrip.duration}`})
              </span>
            </div>
          </div>

          {/* Distance */}
          <div className="grid grid-cols-12 gap-2 text-xs py-1">
            <div className="col-span-5 text-zinc-400 font-medium">Distance</div>
            <div className="col-span-3 text-right text-white font-semibold">{activeTrip.distance} {activeTrip.distanceUnit}</div>
            <div className="col-span-4 text-right text-zinc-300">
              {compareTrip.distance} {compareTrip.distanceUnit}
            </div>
          </div>
        </div>

        {/* Category Expenses Matrix */}
        <div className="space-y-2 pb-3 border-b border-zinc-800/40">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block font-sans">Expense Categories</span>

          {categories.map((cat) => {
            const activeVal = activeTrip.expenses[cat.key];
            const compareVal = compareTrip.expenses[cat.key];
            const diffVal = activeVal - compareVal;

            return (
              <div key={cat.key} className="grid grid-cols-12 gap-2 text-xs items-center py-1 bg-[#0A0A0A]/20 px-1 rounded hover:bg-[#0A0A0A]/60 transition-all border border-transparent hover:border-zinc-800/40">
                <div className="col-span-5 text-zinc-300 font-medium">{cat.label}</div>
                <div className="col-span-3 text-right text-white font-semibold">₱{activeVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="col-span-4 text-right text-zinc-350 flex items-center justify-end gap-1.5">
                  <span>₱{compareVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  {diffVal !== 0 && (
                    <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded flex items-center shrink-0 ${diffVal < 0 ? "bg-red-950/30 border border-red-900/30 text-red-400" : "bg-green-950/30 border border-green-900/30 text-green-400"}`}>
                      {diffVal < 0 ? (
                        <><ArrowUpRight className="w-2 h-2 mr-0.5 shrink-0" />+₱{Math.abs(diffVal).toLocaleString(undefined, { maximumFractionDigits: 0 })}</>
                      ) : (
                        <><ArrowDownRight className="w-2 h-2 mr-0.5 shrink-0" />-₱{Math.abs(diffVal).toLocaleString(undefined, { maximumFractionDigits: 0 })}</>
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary totals */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-12 gap-2 items-center bg-[#0A0A0A] p-3 rounded-xl border border-zinc-800">
            <div className="col-span-5 text-sm font-bold text-white">Total Budget</div>
            <div className="col-span-3 text-right text-base font-black text-emerald-400 italic">₱{activeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="col-span-4 text-right text-sm font-bold text-zinc-300">
              ₱{compareTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Comparative Summary Callout */}
          <div className={`p-3 rounded-xl text-xs flex gap-2 border ${
            totalDiff === 0
              ? "bg-[#0A0A0A]/40 border-zinc-800 text-zinc-500"
              : totalDiff > 0
              ? "bg-green-950/15 border border-green-900/30 text-green-400"
              : "bg-amber-950/10 border border-amber-900/20 text-amber-400"
          }`}>
            <span className="font-semibold shrink-0">Verdict:</span>
            <span>
              {totalDiff === 0 ? (
                "Both trips have identical totals. Choose based on fuel metrics or destination."
              ) : totalDiff > 0 ? (
                `The compared trip ("${compareTrip.tripName}") is ₱${totalDiff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cheaper. Loading it will save your budget.`
              ) : (
                `The active trip is ₱${Math.abs(totalDiff).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cheaper than this saved plan.`
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-zinc-800 pt-4 mt-4 flex items-center justify-end gap-2.5">
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 bg-[#0A0A0A] border border-zinc-800 hover:border-zinc-700 hover:bg-[#0F0F0F] text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer transition-all"
        >
          Close Comparison
        </button>
        <button
          onClick={onSetCompareAsActive}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-amber-500/15"
        >
          <Check className="w-3.5 h-3.5" />
          Load Saved Trip
        </button>
      </div>
    </div>
  );
};

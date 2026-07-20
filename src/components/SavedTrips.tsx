/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import { TripBudget } from "../types";
import { Calendar, Bike, Compass, DollarSign, Trash2, FolderOpen, Copy, ArrowRightLeft, FileUp, FileDown, Plus } from "lucide-react";

interface SavedTripsProps {
  savedTrips: TripBudget[];
  currentTripId: string | null;
  onLoadTrip: (trip: TripBudget) => void;
  onDeleteTrip: (id: string) => void;
  onCompareTrip: (trip: TripBudget) => void;
  onExportTrips: () => void;
  onImportTrips: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNewTrip: () => void;
}

export const SavedTrips: React.FC<SavedTripsProps> = ({
  savedTrips,
  currentTripId,
  onLoadTrip,
  onDeleteTrip,
  onCompareTrip,
  onExportTrips,
  onImportTrips,
  onNewTrip,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);

  const calculateTotal = (trip: TripBudget) => {
    return Object.values(trip.expenses).reduce((a, b) => a + b, 0);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div id="saved-trips-container" className="bg-[#151515] border border-[#222] p-6 rounded-2xl flex flex-col h-full">
      {/* Header with Import/Export controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[#222] pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500" />
            Your Saved Trips
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Revisit, compare, or share your motorcycle trip budgets.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Create New Trip */}
          <button
            onClick={onNewTrip}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            New Planner
          </button>

          {/* Export JSON */}
          <button
            onClick={onExportTrips}
            disabled={savedTrips.length === 0}
            className="p-1.5 bg-[#0A0A0A] hover:bg-[#0F0F0F] text-zinc-400 disabled:opacity-40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-800"
            title="Export trips backup as JSON file"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Backup</span>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 bg-[#0A0A0A] hover:bg-[#0F0F0F] text-zinc-400 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-800"
            title="Import trips backup JSON file"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Restore</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImportTrips}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Trips List/Grid */}
      {savedTrips.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 bg-[#0A0A0A]/40 rounded-xl border border-dashed border-[#222]">
          <FolderOpen className="w-10 h-10 text-zinc-600 mb-3" />
          <p className="text-sm font-semibold text-zinc-400">No saved trips found</p>
          <p className="text-xs text-zinc-600 mt-1 max-w-[240px]">
            Build a motorcycle trip budget in the editor, and click &quot;Save Trip&quot; to preserve it!
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-[480px] space-y-3 pr-1">
          {savedTrips.map((trip) => {
            const isActive = trip.id === currentTripId;
            const totalBudget = calculateTotal(trip);

            return (
              <div
                key={trip.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? "border-zinc-800 border-l-4 border-l-amber-500 bg-[#0F0F0F] shadow-lg shadow-amber-500/5"
                    : "border-zinc-800 bg-[#0A0A0A]/60 hover:bg-[#0F0F0F] hover:border-zinc-750 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-bold text-sm text-white truncate block">
                        {trip.tripName || "Unnamed Trip"}
                      </span>
                      {isActive && (
                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[9px] font-bold uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Bike className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        <span className="truncate">{trip.motorcycleModel || "Generic Bike"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        <span>{trip.duration} Days</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Compass className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        <span className="truncate">
                          {trip.distance} {trip.distanceUnit}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 select-none">
                        <span className="text-emerald-500 font-black text-[11px] shrink-0">₱</span>
                        <span className="text-emerald-400 font-bold italic">₱{totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#222]/60 mt-3 pt-3 gap-2">
                  <span className="text-[10px] text-zinc-600">
                    {deletingTripId === trip.id ? "Are you sure?" : `Saved ${formatDate(trip.savedAt)}`}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {deletingTripId === trip.id ? (
                      <>
                        <button
                          onClick={() => {
                            onDeleteTrip(trip.id);
                            setDeletingTripId(null);
                          }}
                          className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900 border border-red-900/50 hover:border-red-500 text-red-400 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer uppercase tracking-wider"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeletingTripId(null)}
                          className="px-2.5 py-1 bg-[#0A0A0A] hover:bg-[#151515] border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Compare */}
                        <button
                          onClick={() => onCompareTrip(trip)}
                          className="p-1.5 text-zinc-400 hover:text-white bg-[#0A0A0A] hover:bg-[#0F0F0F] border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs transition-all cursor-pointer"
                          title="Compare this saved budget side-by-side"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeletingTripId(trip.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 bg-[#0A0A0A] hover:bg-red-950/30 border border-zinc-800 hover:border-red-900/55 rounded-lg text-xs transition-all cursor-pointer"
                          title="Delete saved trip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Load */}
                        {!isActive && (
                          <button
                            onClick={() => onLoadTrip(trip)}
                            className="px-2.5 py-1 bg-[#0A0A0A] border border-zinc-800 hover:border-amber-500 hover:bg-amber-500 hover:text-black text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <FolderOpen className="w-3 h-3" />
                            Load
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

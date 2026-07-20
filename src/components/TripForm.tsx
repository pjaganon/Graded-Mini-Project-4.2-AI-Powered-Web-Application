/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { TripBudget, DistanceUnit, FuelEconomyUnit, FuelPriceUnit, PassengerMode, MOTORCYCLE_SUGGESTIONS, ROUTE_TYPES, RIDING_STYLES } from "../types";
import { Bike, Navigation, DollarSign, Calendar, Landmark, Settings, Sliders, ChevronRight, Save, Compass } from "lucide-react";

interface TripFormProps {
  activeTrip: TripBudget;
  onChangeTrip: (updated: TripBudget) => void;
  onSaveTrip: () => void;
}

export function calculateEstimatedFuel(
  distance: number,
  distanceUnit: DistanceUnit,
  fuelEconomy: number,
  fuelEconomyUnit: FuelEconomyUnit,
  fuelPrice: number,
  fuelPriceUnit: FuelPriceUnit
): number {
  if (!distance || !fuelEconomy || !fuelPrice) return 0;

  // Convert distance to Miles
  const dMiles = distanceUnit === "mi" ? distance : distance * 0.621371;

  // Calculate gallons burned
  let gallonsBurned = 0;
  if (fuelEconomyUnit === "mpg") {
    gallonsBurned = dMiles / fuelEconomy;
  } else if (fuelEconomyUnit === "km/l") {
    const mpg = fuelEconomy * 2.35215;
    gallonsBurned = dMiles / mpg;
  } else if (fuelEconomyUnit === "l/100km") {
    const mpg = fuelEconomy > 0 ? 235.215 / fuelEconomy : 0;
    gallonsBurned = mpg > 0 ? dMiles / mpg : 0;
  }

  // Convert fuel price to per gallon
  const pricePerGallon = fuelPriceUnit === "gal" ? fuelPrice : fuelPrice * 3.78541;

  return gallonsBurned * pricePerGallon;
}

export const TripForm: React.FC<TripFormProps> = ({ activeTrip, onChangeTrip, onSaveTrip }) => {
  const [activeTab, setActiveTab] = useState<"params" | "expenses">("params");
  const [autoCalculateFuel, setAutoCalculateFuel] = useState(true);

  // Auto-calculate fuel cost when parameters change
  useEffect(() => {
    if (autoCalculateFuel) {
      const estimatedFuel = calculateEstimatedFuel(
        activeTrip.distance,
        activeTrip.distanceUnit,
        activeTrip.fuelEconomy,
        activeTrip.fuelEconomyUnit,
        activeTrip.fuelPrice,
        activeTrip.fuelPriceUnit
      );

      // Check if it actually changed to prevent state cycles
      if (Math.abs(activeTrip.expenses.fuel - estimatedFuel) > 0.01) {
        onChangeTrip({
          ...activeTrip,
          expenses: {
            ...activeTrip.expenses,
            fuel: parseFloat(estimatedFuel.toFixed(2)),
          },
        });
      }
    }
  }, [
    activeTrip.distance,
    activeTrip.distanceUnit,
    activeTrip.fuelEconomy,
    activeTrip.fuelEconomyUnit,
    activeTrip.fuelPrice,
    activeTrip.fuelPriceUnit,
    autoCalculateFuel,
  ]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChangeTrip({
      ...activeTrip,
      [name]: value,
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numVal = parseFloat(value) || 0;
    onChangeTrip({
      ...activeTrip,
      [name]: numVal,
    });
  };

  const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numVal = parseFloat(value) || 0;

    if (name === "fuel") {
      setAutoCalculateFuel(false); // Manually overridden
    }

    onChangeTrip({
      ...activeTrip,
      expenses: {
        ...activeTrip.expenses,
        [name]: numVal,
      },
    });
  };

  const handlePresetSelect = (preset: typeof MOTORCYCLE_SUGGESTIONS[0]) => {
    onChangeTrip({
      ...activeTrip,
      motorcycleModel: preset.model,
      fuelEconomy: preset.economy,
      fuelEconomyUnit: preset.unit,
    });
  };

  const totalExpense = Object.values(activeTrip.expenses).reduce((a, b) => a + b, 0);

  return (
    <div id="trip-form-container" className="bg-[#151515] border border-[#222] p-6 rounded-2xl flex flex-col h-full">
      {/* Title block */}
      <div className="flex justify-between items-start mb-6">
        <div className="min-w-0">
          <input
            type="text"
            name="tripName"
            value={activeTrip.tripName}
            onChange={handleTextChange}
            placeholder="E.g., Marilaque Twisties or Cordillera Loop"
            className="text-xl font-black bg-transparent border-b border-dashed border-zinc-800 hover:border-zinc-700 focus:border-amber-500 text-white placeholder-zinc-600 py-1 focus:outline-none w-full font-sans tracking-tight"
          />
          <span className="text-[10px] text-zinc-500 mt-1 block uppercase tracking-wider">Click name to rename trip</span>
        </div>
        <button
          onClick={onSaveTrip}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10 cursor-pointer uppercase tracking-wider"
        >
          <Save className="w-3.5 h-3.5" />
          Save Trip
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#222] mb-6">
        <button
          onClick={() => setActiveTab("params")}
          className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "params"
              ? "border-amber-500 text-amber-500"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Sliders className="w-4 h-4" />
          1. Ride Parameters
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "expenses"
              ? "border-amber-500 text-amber-500"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          2. Trip Expenses
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto pr-1 max-h-[500px]">
        {activeTab === "params" ? (
          <div className="space-y-5">
            {/* Presets Dropdown */}
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                Quick Bike Presets
              </label>
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    const presetIdx = e.target.value;
                    if (presetIdx !== "") {
                      handlePresetSelect(MOTORCYCLE_SUGGESTIONS[parseInt(presetIdx)]);
                    }
                  }}
                  className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-300 focus:border-amber-500 outline-none cursor-pointer appearance-none pr-16"
                >
                  <option value="" disabled className="text-zinc-600 bg-[#0A0A0A]">
                    -- Select a motorcycle preset to auto-fill --
                  </option>
                  {MOTORCYCLE_SUGGESTIONS.map((preset, idx) => (
                    <option key={idx} value={idx} className="bg-[#0A0A0A] text-zinc-300">
                      {preset.model} ({preset.economy} {preset.unit})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none flex items-center gap-1.5">
                  <span className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold">Select</span>
                  <Bike className="w-3.5 h-3.5 text-amber-500" />
                </div>
              </div>
            </div>

            {/* General Bike Setup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Motorcycle Model
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="motorcycleModel"
                    value={activeTrip.motorcycleModel}
                    onChange={handleTextChange}
                    placeholder="Honda ADV 160 / Yamaha NMAX / CFMoto 450MT"
                    className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:border-amber-500 outline-none"
                  />
                  <Bike className="absolute right-3 top-2.5 w-4 h-4 text-zinc-600" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Trip Duration (Days)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="duration"
                    value={activeTrip.duration || ""}
                    onChange={handleNumberChange}
                    min="1"
                    className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                  />
                  <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-zinc-600" />
                </div>
              </div>
            </div>

            {/* Distance & Fuel Economy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Total Distance
                </label>
                <div className="flex rounded-lg overflow-hidden border border-zinc-800">
                  <input
                    type="number"
                    name="distance"
                    value={activeTrip.distance || ""}
                    onChange={handleNumberChange}
                    className="flex-1 min-w-0 bg-[#0A0A0A] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <select
                    name="distanceUnit"
                    value={activeTrip.distanceUnit}
                    onChange={handleTextChange}
                    className="bg-[#0F0F0F] text-xs text-zinc-400 px-2 py-2 border-l border-zinc-800 outline-none font-bold"
                  >
                    <option value="mi">Miles</option>
                    <option value="km">Km</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Fuel Economy
                </label>
                <div className="flex rounded-lg overflow-hidden border border-zinc-800">
                  <input
                    type="number"
                    name="fuelEconomy"
                    value={activeTrip.fuelEconomy || ""}
                    onChange={handleNumberChange}
                    className="flex-1 min-w-0 bg-[#0A0A0A] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <select
                    name="fuelEconomyUnit"
                    value={activeTrip.fuelEconomyUnit}
                    onChange={handleTextChange}
                    className="bg-[#0F0F0F] text-xs text-zinc-400 px-2 py-2 border-l border-zinc-800 outline-none font-bold"
                  >
                    <option value="mpg">MPG</option>
                    <option value="km/l">km/L</option>
                    <option value="l/100km">L/100km</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fuel Price & Passenger */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Avg Fuel Price
                </label>
                <div className="flex rounded-lg overflow-hidden border border-zinc-800">
                  <span className="bg-[#0F0F0F] px-2.5 py-2 text-xs text-zinc-400 border-r border-zinc-800 flex items-center font-bold">
                    ₱
                  </span>
                  <input
                    type="number"
                    name="fuelPrice"
                    value={activeTrip.fuelPrice || ""}
                    onChange={handleNumberChange}
                    step="0.01"
                    className="flex-1 min-w-0 bg-[#0A0A0A] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <select
                    name="fuelPriceUnit"
                    value={activeTrip.fuelPriceUnit}
                    onChange={handleTextChange}
                    className="bg-[#0F0F0F] text-xs text-zinc-400 px-2 py-2 border-l border-zinc-800 outline-none font-bold"
                  >
                    <option value="gal">/ Gallon</option>
                    <option value="liter">/ Liter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Rider Setup
                </label>
                <select
                  name="passenger"
                  value={activeTrip.passenger}
                  onChange={handleTextChange}
                  className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-bold"
                >
                  <option value="solo">Solo Rider</option>
                  <option value="two-up">Two-Up (With Passenger + Extra Load)</option>
                </select>
              </div>
            </div>

            {/* Route Type & Riding Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Terrain / Route Type
                </label>
                <select
                  name="routeType"
                  value={activeTrip.routeType}
                  onChange={handleTextChange}
                  className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-bold"
                >
                  {ROUTE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Riding Vibe
                </label>
                <select
                  name="ridingStyle"
                  value={activeTrip.ridingStyle}
                  onChange={handleTextChange}
                  className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-bold"
                >
                  {RIDING_STYLES.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Special Notes, Concerns, or Gear Focus
              </label>
              <textarea
                name="customNotes"
                value={activeTrip.customNotes}
                onChange={handleTextChange}
                placeholder="E.g., stopping at local carinderias, checking if bike is expressway-legal (400cc+), RFID sticker placement, or packing local kapote for monsoon showers..."
                rows={3}
                className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:border-amber-500 outline-none resize-none font-sans"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("expenses")}
                className="px-4 py-2 bg-[#0A0A0A] border border-zinc-800 hover:border-zinc-700 hover:bg-[#0F0F0F] text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider"
              >
                Continue to Expenses
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Expenses Setup */}
            <div className="p-3.5 bg-[#0A0A0A] rounded-xl border border-zinc-800 flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-zinc-200 block">Smart Fuel Calculation</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  Live calculated fuel based on distance and bike economy parameters.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-bold">{autoCalculateFuel ? "On" : "Override"}</span>
                <button
                  type="button"
                  onClick={() => setAutoCalculateFuel(!autoCalculateFuel)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoCalculateFuel ? "bg-amber-500" : "bg-zinc-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoCalculateFuel ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fuel Expense */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Fuel Expense
                </label>
                <div className="flex rounded-lg overflow-hidden border border-zinc-800">
                  <span className="bg-[#0F0F0F] px-2.5 py-2 text-xs text-zinc-400 border-r border-zinc-800 flex items-center font-bold">
                    ₱
                  </span>
                  <input
                    type="number"
                    name="fuel"
                    value={activeTrip.expenses.fuel || ""}
                    onChange={handleExpenseChange}
                    className={`flex-1 bg-[#0A0A0A] px-3 py-2 text-xs text-white focus:outline-none ${
                      autoCalculateFuel ? "text-amber-500 font-bold bg-[#0A0A0A]/50" : ""
                    }`}
                    disabled={autoCalculateFuel}
                  />
                </div>
              </div>

              {/* Food Expense */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Food & Drinks
                </label>
                <div className="flex rounded-lg overflow-hidden border border-zinc-800">
                  <span className="bg-[#0F0F0F] px-2.5 py-2 text-xs text-zinc-400 border-r border-zinc-800 flex items-center font-bold">
                    ₱
                  </span>
                  <input
                    type="number"
                    name="food"
                    value={activeTrip.expenses.food || ""}
                    onChange={handleExpenseChange}
                    className="flex-1 bg-[#0A0A0A] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Accommodation */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Lodging / Camping
                </label>
                <div className="flex rounded-lg overflow-hidden border border-zinc-800">
                  <span className="bg-[#0F0F0F] px-2.5 py-2 text-xs text-zinc-400 border-r border-zinc-800 flex items-center font-bold">
                    ₱
                  </span>
                  <input
                    type="number"
                    name="accommodation"
                    value={activeTrip.expenses.accommodation || ""}
                    onChange={handleExpenseChange}
                    className="flex-1 bg-[#0A0A0A] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Tolls */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Road Tolls
                </label>
                <div className="flex rounded-lg overflow-hidden border border-zinc-800">
                  <span className="bg-[#0F0F0F] px-2.5 py-2 text-xs text-zinc-400 border-r border-zinc-800 flex items-center font-bold">
                    ₱
                  </span>
                  <input
                    type="number"
                    name="toll"
                    value={activeTrip.expenses.toll || ""}
                    onChange={handleExpenseChange}
                    className="flex-1 bg-[#0A0A0A] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Parking */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Secure Moto Parking
                </label>
                <div className="flex rounded-lg overflow-hidden border border-zinc-800">
                  <span className="bg-[#0F0F0F] px-2.5 py-2 text-xs text-zinc-400 border-r border-zinc-800 flex items-center font-bold">
                    ₱
                  </span>
                  <input
                    type="number"
                    name="parking"
                    value={activeTrip.expenses.parking || ""}
                    onChange={handleExpenseChange}
                    className="flex-1 bg-[#0A0A0A] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Ferry Fees */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Ferry & Crossing Fees
                </label>
                <div className="flex rounded-lg overflow-hidden border border-zinc-800">
                  <span className="bg-[#0F0F0F] px-2.5 py-2 text-xs text-zinc-400 border-r border-zinc-800 flex items-center font-bold">
                    ₱
                  </span>
                  <input
                    type="number"
                    name="ferry"
                    value={activeTrip.expenses.ferry || ""}
                    onChange={handleExpenseChange}
                    className="flex-1 bg-[#0A0A0A] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Miscellaneous */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Misc (Chain Lube, Earplugs, Visor Cleaner)
                </label>
                <div className="flex rounded-lg overflow-hidden border border-zinc-800">
                  <span className="bg-[#0F0F0F] px-2.5 py-2 text-xs text-zinc-400 border-r border-zinc-800 flex items-center font-bold">
                    ₱
                  </span>
                  <input
                    type="number"
                    name="miscellaneous"
                    value={activeTrip.expenses.miscellaneous || ""}
                    onChange={handleExpenseChange}
                    className="flex-1 bg-[#0A0A0A] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Emergency Fund */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Moto Contingency / Emergency Fund
                </label>
                <div className="flex rounded-lg overflow-hidden border border-zinc-800">
                  <span className="bg-[#0F0F0F] px-2.5 py-2 text-xs text-zinc-400 border-r border-zinc-800 flex items-center font-bold">
                    ₱
                  </span>
                  <input
                    type="number"
                    name="emergency"
                    value={activeTrip.expenses.emergency || ""}
                    onChange={handleExpenseChange}
                    className="flex-1 bg-[#0A0A0A] px-3 py-2 text-xs text-white focus:outline-none border-dashed"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
              <div className="text-left">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Summed Total</span>
                <span className="text-lg font-black text-emerald-400 font-sans tracking-tight italic">
                  ₱{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("params")}
                className="px-4 py-2 bg-[#0A0A0A] border border-zinc-800 hover:border-zinc-700 hover:bg-[#0F0F0F] text-zinc-300 rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
              >
                Back to Parameters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

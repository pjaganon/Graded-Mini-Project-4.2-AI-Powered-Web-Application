/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { TripBudget } from "./types";
import { MAX_IMPORT_FILE_BYTES, parseImportedTrips } from "./validation";
import { TripForm } from "./components/TripForm";
import { BudgetChart } from "./components/BudgetChart";
import { SavedTrips } from "./components/SavedTrips";
import { AIAssistant } from "./components/AIAssistant";
import { TripComparer } from "./components/TripComparer";
import { Bike, ShieldAlert, Sparkles, Navigation, Calendar, DollarSign, Compass, Info } from "lucide-react";

// Pre-loaded sample trips for a polished, instant initial experience
const INITIAL_SAMPLE_TRIPS: TripBudget[] = [
  {
    id: "sample-marilaque-loop",
    tripName: "Marilaque Twisties Weekend Loop",
    motorcycleModel: "Honda ADV 160",
    distance: 180,
    distanceUnit: "km",
    fuelEconomy: 42,
    fuelEconomyUnit: "km/l",
    fuelPrice: 65.50,
    fuelPriceUnit: "liter",
    duration: 1,
    routeType: "scenic",
    ridingStyle: "relaxed",
    passenger: "solo",
    expenses: {
      fuel: 280.70,
      food: 800.00,
      accommodation: 0.00,
      toll: 0.00,
      parking: 50.00,
      ferry: 0.00,
      miscellaneous: 150.00,
      emergency: 500.00,
    },
    customNotes: "Quick weekend run along Marilaque (Manila-East Road). Stopping at popular biker cafes in Tanay. Checking if a ₱1,500 day-trip budget is enough.",
    savedAt: Date.now() - 86400000 * 2, // 2 days ago
    aiAnalysis: `# 🏍️ Marilaque Twisties Weekend Loop - Expert Route Analysis

Mabuhay, Rider! Planning a weekend run down the famous **Marilaque Highway (Manila-East Road)** on an adventure scooter like the **Honda ADV 160** is a classic Philippine motorcycling experience. Let's look over your estimated budget and route parameters.

### 1. Ride Cost & Fuel Review
Based on a distance of 180 km and an estimated fuel economy of 42 km/L, your planned fuel expense of **₱280.70** is mathematically spot-on and perfectly realistic for local conditions.

Your overall budget of **₱1,780.70** for a scenic day-trip is an excellent, realistic plan that allows for cozy cafe stops and a generous safety buffer.

### 2. Machine & Vibe Insights
The ADV 160 is practically built for local conditions. Its 165mm ground clearance and showa-like twin sub-tank rear suspension are perfect for handling Manila's potholes and Marilaque's occasional rough patches. At 42 km/L, its fuel efficiency is spectacular. However, bear in mind that the winding climb up to Tanay and Pranjetto can dip your economy slightly if you maintain high revs, but it's easily offset by gravity on the way back down.

### 3. Commonly Forgotten Expenses
As a local rider, make sure you account for:
- **Barangay / Municipal Environmental Fees**: Some specialized visual lookouts, falls, or clean-up stops in Tanay ask for a ₱20–₱50 registration/donation.
- **Microfiber visor cloth & spray**: Marilaque gets bug-heavy, especially near fruit plantations and forest canopies. A clean visor keeps you safe on the sharp bends.
- **Emergency Tire Plug Kit**: Although the ADV 160 runs tubeless tires, getting a puncture in remote Sierra Madre areas means you'll have to find a "vulcanizing shop", which might be closed or miles away. Having your own plug kit and a mini pump is a lifesaver.

### 4. Opportunities to Save
- **Local Carinderias**: While touristy biker cafes like Windmill Tanay, Sierra Madre Hotel, or Regina RICA offer beautiful views, eating at a roadside "carinderia" (local eatery) can easily cut your food budget in half while letting you enjoy hot Bulalo or Lomi.
- **Tolls**: Excellent choice setting tolls to ₱0.00! The ADV 160 is under 400cc, meaning you are barred from the expressways anyway, and the entire Marilaque route is toll-free!

### 5. Emergency Fund Audit
Your Emergency Fund of **₱500.00** is a very solid buffer for a day trip. It is more than enough for a local vulcanizing patch (usually ₱50–₱100), some extra GCash/cash buffer for water, and emergency fuel if you run low in the remote mountain areas. Take those corners with caution and watch out for counterflowing riders!`,
  },
  {
    id: "sample-cordillera-loop",
    tripName: "Cordillera Mountain Loop",
    motorcycleModel: "CFMoto 450MT (Expressway Adventure)",
    distance: 850,
    distanceUnit: "km",
    fuelEconomy: 25,
    fuelEconomyUnit: "km/l",
    fuelPrice: 68.00,
    fuelPriceUnit: "liter",
    duration: 4,
    routeType: "mountain-passes",
    ridingStyle: "touring",
    passenger: "solo",
    expenses: {
      fuel: 2312.00,
      food: 3200.00,
      accommodation: 4500.00,
      toll: 650.00,
      parking: 200.00,
      ferry: 0.00,
      miscellaneous: 1200.00,
      emergency: 2000.00,
    },
    customNotes: "Scenic 4-day loop through the Cordilleras. Taking NLEX/TPLEX to speed up the entry, then up to Baguio, Halsema Highway to Sagada, and back via Banaue.",
    savedAt: Date.now() - 86400000, // 1 day ago
    aiAnalysis: `# 🏔️ Cordillera Mountain Loop Expert Review

Ride safe, Adventurer! Bringing a highly-rated, expressway-legal twin cylinder like the **CFMoto 450MT** up the Halsema Highway is the ultimate Philippine mountain road pilgrimage. 

### 1. Ride Cost & Fuel Review
At 850 km and an estimated fuel economy of 25 km/L, your planned fuel expense of **₱2,312.00** is exceptionally accurate and matches the expected fuel requirement for this journey perfectly.

A total budget of **₱14,062.00** for 4 days (~₱3,500/day) is a very robust, secure, and comfortable budget for a premium adventure tour in Northern Luzon.

### 2. Machine & Technical Insights
The CFMoto 450MT has a registered displacement of 449.5cc, which makes it fully **Expressway-Legal**. This allows you to fly through **NLEX, SCTEX, and TPLEX** right up to Rosario, La Union, shaving hours off your travel time compared to national roads. The 450MT’s high torque is excellent for climbing the steep elevations of Kennon Road and Halsema Highway. Be prepared for high altitudes where temperatures drop significantly. 

### 3. Commonly Forgotten Expenses
- **RFID Tollway Load**: You will need both **Autosweep** (for TPLEX/Skyway) and **Easytrip** (for NLEX/SCTEX) active RFID stickers with at least ₱650 total load. Ensure your stickers are clean and properly placed on your windshield or headlight to avoid toll gate delays.
- **Environmental Fees**: Municipalities like Sagada require visiting tourists to register at the tourist office and pay an environmental fee (around ₱100) and hire local guides for cave or valley explorations.
- **Physical Cash (Emergency Pesos)**: While GCash is popular in Baguio, mobile signal is highly unstable or non-existent in deep valleys between Sagada, Bontoc, and Banaue. Carry at least ₱2,000 in physical paper bills (small denominations prefered) in your riding jacket.
- **Kapote (Heavy-duty Rain Gear)**: The mountain provinces (especially Benguet and Mt. Province) are notorious for sudden afternoon showers, heavy fog, and cold rain. Keep your rain suit accessible on top of your panniers.

### 4. Opportunities to Save
- **Baguio/Sagada Transient Homestays**: Swap high-end hotels for local homestays or transient houses. You can find beautiful, local-run rooms with hot water (essential!) for ₱500 to ₱1,000 per night.
- **Mountain Carinderias**: Try out the local red rice, mountain vegetables, and native chicken stews in provincial roadside eateries. It's incredibly cheap, fresh, and warm.

### 5. Emergency Buffer
Your emergency fund of **₱2,000.00** is outstanding. In the Cordilleras, common risks include landslides, tyre punctures on sharp shale rocks, and high engine brake heat on long descents. Keep an eye on your tyre pressures and engine coolant levels, and remember to use engine braking rather than riding your brakes to avoid brake fade! Ride safe!`,
  },
];

const createNewTripTemplate = (): TripBudget => ({
  id: "trip-" + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)),
  tripName: "New Philippine Ride",
  motorcycleModel: "Honda ADV 160",
  distance: 200,
  distanceUnit: "km",
  fuelEconomy: 42,
  fuelEconomyUnit: "km/l",
  fuelPrice: 65.00,
  fuelPriceUnit: "liter",
  duration: 2,
  routeType: "mixed",
  ridingStyle: "touring",
  passenger: "solo",
  expenses: {
    fuel: 310.00,
    food: 1000.00,
    accommodation: 1500.00,
    toll: 0.00,
    parking: 100.00,
    ferry: 0.00,
    miscellaneous: 300.00,
    emergency: 1000.00,
  },
  customNotes: "",
  savedAt: Date.now(),
});

export default function App() {
  const [savedTrips, setSavedTrips] = useState<TripBudget[]>([]);
  const [activeTrip, setActiveTrip] = useState<TripBudget | null>(null);
  const [compareTrip, setCompareTrip] = useState<TripBudget | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Load trips on mount
  useEffect(() => {
    const raw = localStorage.getItem("aistudio_moto_trips");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedTrips(parsed);
          setActiveTrip(parsed[0]);
        } else {
          loadDefaultSamples();
        }
      } catch (e) {
        loadDefaultSamples();
      }
    } else {
      loadDefaultSamples();
    }
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadDefaultSamples = () => {
    setSavedTrips(INITIAL_SAMPLE_TRIPS);
    setActiveTrip(INITIAL_SAMPLE_TRIPS[0]);
    localStorage.setItem("aistudio_moto_trips", JSON.stringify(INITIAL_SAMPLE_TRIPS));
  };

  const handleUpdateTrip = (updated: TripBudget) => {
    setActiveTrip(updated);
  };

  const handleSaveActiveTrip = () => {
    if (!activeTrip) return;

    const updatedTrip = {
      ...activeTrip,
      savedAt: Date.now(),
    };

    setSavedTrips((prev) => {
      // Check if it already exists to overwrite or append
      const exists = prev.some((t) => t.id === updatedTrip.id);
      let next;
      if (exists) {
        next = prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t));
      } else {
        next = [updatedTrip, ...prev];
      }
      localStorage.setItem("aistudio_moto_trips", JSON.stringify(next));
      return next;
    });

    setActiveTrip(updatedTrip);
    showToast(`Saved "${updatedTrip.tripName}" successfully!`);
  };

  const handleLoadTrip = (trip: TripBudget) => {
    setActiveTrip(trip);
    setCompareTrip(null);
    showToast(`Loaded "${trip.tripName}" into planner workspace.`, "info");
  };

  const handleDeleteTrip = (id: string) => {
    setSavedTrips((prev) => {
      const next = prev.filter((t) => t.id !== id);
      localStorage.setItem("aistudio_moto_trips", JSON.stringify(next));

      // Handle active deletion
      if (activeTrip && activeTrip.id === id) {
        if (next.length > 0) {
          setActiveTrip(next[0]);
        } else {
          const fresh = createNewTripTemplate();
          setActiveTrip(fresh);
        }
      }
      return next;
    });

    if (compareTrip && compareTrip.id === id) {
      setCompareTrip(null);
    }

    showToast("Trip budget removed.", "info");
  };

  const handleCompareTrip = (trip: TripBudget) => {
    if (!activeTrip) return;
    if (trip.id === activeTrip.id) {
      showToast("Cannot compare a trip budget with itself!", "error");
      return;
    }
    setCompareTrip(trip);
    showToast(`Loaded "${trip.tripName}" for comparison.`, "info");
  };

  const handleExportTrips = () => {
    const dataStr = JSON.stringify(savedTrips, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "motorcycle_trip_budgets.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    showToast("Backup exported successfully!");
  };

  const handleImportTrips = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMPORT_FILE_BYTES) {
      showToast("Backup file is too large (max 1 MB).", "error");
      e.target.value = "";
      return;
    }

    fileReader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        const validated = parseImportedTrips(imported);
        if (validated.length > 0) {
          setSavedTrips((prev) => {
            const merged = [...validated, ...prev.filter((pt) => !validated.find((v) => v.id === pt.id))];
            localStorage.setItem("aistudio_moto_trips", JSON.stringify(merged));
            return merged;
          });
          setActiveTrip(validated[0]);
          showToast(`Imported ${validated.length} trip budgets!`, "success");
        } else {
          showToast("No valid trip configurations found in the backup file.", "error");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to parse backup file.";
        showToast(message, "error");
      }
    };
    fileReader.readAsText(file);
    e.target.value = "";
  };

  const handleNewTrip = () => {
    const fresh = createNewTripTemplate();
    setActiveTrip(fresh);
    setCompareTrip(null);
    showToast("Created fresh trip budget template.", "info");
  };

  // Cache AI Analysis on active state and save to list
  const handleUpdateAnalysis = (analysisText: string) => {
    if (!activeTrip) return;
    const updated = {
      ...activeTrip,
      aiAnalysis: analysisText,
    };
    setActiveTrip(updated);

    // Save to list as well to maintain persistence
    setSavedTrips((prev) => {
      const next = prev.map((t) => (t.id === updated.id ? updated : t));
      localStorage.setItem("aistudio_moto_trips", JSON.stringify(next));
      return next;
    });
  };

  if (!activeTrip) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-zinc-400">
        <Bike className="w-8 h-8 animate-bounce text-amber-500" />
      </div>
    );
  }

  const activeTotalCost = Object.values(activeTrip.expenses).reduce((a, b) => a + b, 0);

  return (
    <div id="app-root" className="min-h-screen bg-[#0A0A0A] font-sans text-[#E0E0E0] py-6 px-4 md:px-8 selection:bg-amber-500/30 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-xl border shadow-2xl flex items-center gap-2.5 animate-slide-in text-xs font-semibold ${
            toast.type === "success"
              ? "bg-[#0F0F0F] border-emerald-800 text-emerald-400"
              : toast.type === "error"
              ? "bg-[#0F0F0F] border-red-800 text-red-400"
              : "bg-[#0F0F0F] border-[#222] text-[#E0E0E0]"
          }`}
        >
          <Info className="w-4 h-4 text-amber-500" />
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation / Brand Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0F0F0F] border border-[#222] p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-black font-black italic shadow-lg shadow-amber-500/10">
              MB
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
                MotoBudget
                <span className="text-amber-500 font-black">
                  AI
                </span>
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Calculate accurate fuel, tolls, and emergency buffers tailored to your motorcycle and riding style.
              </p>
            </div>
          </div>
          {/* Quick status board */}
          <div className="flex items-center gap-4 bg-[#0A0A0A] p-3 rounded-xl border border-[#222] self-stretch sm:self-auto justify-around">
            <div className="text-center px-2">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Total Cost</span>
              <span className="text-base font-black text-white mt-0.5 block italic tracking-tighter">₱{activeTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div className="text-center px-2">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Days</span>
              <span className="text-base font-black text-white mt-0.5 block">{activeTrip.duration}</span>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div className="text-center px-2">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Distance</span>
              <span className="text-base font-bold text-amber-500 mt-0.5 block truncate max-w-[80px]">
                {activeTrip.distance} {activeTrip.distanceUnit}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Comparison Panel (Overlays at the top when active) */}
        {compareTrip && (
          <TripComparer
            activeTrip={activeTrip}
            compareTrip={compareTrip}
            onClose={() => setCompareTrip(null)}
            onSetCompareAsActive={() => handleLoadTrip(compareTrip)}
          />
        )}

        {/* Primary Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Editor & Saved Trips list (8 cols on lg) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            <div className="flex-1">
              <TripForm
                activeTrip={activeTrip}
                onChangeTrip={handleUpdateTrip}
                onSaveTrip={handleSaveActiveTrip}
              />
            </div>
            <div className="h-fit">
              <SavedTrips
                savedTrips={savedTrips}
                currentTripId={activeTrip.id}
                onLoadTrip={handleLoadTrip}
                onDeleteTrip={handleDeleteTrip}
                onCompareTrip={handleCompareTrip}
                onExportTrips={handleExportTrips}
                onImportTrips={handleImportTrips}
                onNewTrip={handleNewTrip}
              />
            </div>
          </div>

          {/* Right Column: Visualization & AI Assistant (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col">
            <div className="flex-1">
              <AIAssistant
                activeTrip={activeTrip}
                onUpdateAnalysis={handleUpdateAnalysis}
              />
            </div>
            <div>
              <BudgetChart expenses={activeTrip.expenses} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

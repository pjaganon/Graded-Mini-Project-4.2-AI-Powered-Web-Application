/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DistanceUnit = "mi" | "km";
export type FuelEconomyUnit = "mpg" | "l/100km" | "km/l";
export type FuelPriceUnit = "gal" | "liter";
export type PassengerMode = "solo" | "two-up";

export interface ExpenseBreakdown {
  fuel: number;
  food: number;
  accommodation: number;
  toll: number;
  parking: number;
  ferry: number;
  miscellaneous: number;
  emergency: number;
}

export interface TripBudget {
  id: string;
  tripName: string;
  motorcycleModel: string;
  distance: number;
  distanceUnit: DistanceUnit;
  fuelEconomy: number;
  fuelEconomyUnit: FuelEconomyUnit;
  fuelPrice: number;
  fuelPriceUnit: FuelPriceUnit;
  duration: number;
  routeType: string;
  ridingStyle: string;
  passenger: PassengerMode;
  expenses: ExpenseBreakdown;
  customNotes: string;
  savedAt: number;
  aiAnalysis?: string;
}

export const ROUTE_TYPES = [
  { value: "mixed", label: "Mixed (Highways & Backroads)", desc: "A blend of scenic curves and fast arterial lanes." },
  { value: "scenic", label: "Scenic Backroads", desc: "Twisty, slow, visually engaging asphalt." },
  { value: "highway", label: "Highways & Freeways", desc: "Fast, straight, mileage-munching slabs." },
  { value: "mountain-passes", label: "Mountain Passes", desc: "Elevation changes, hairpins, and demanding terrain." },
  { value: "dirt-gravel", label: "Dirt & Gravel Trails", desc: "Dual-sport or ADV terrain, off the beaten path." },
];

export const RIDING_STYLES = [
  { value: "relaxed", label: "Relaxed Crusader", desc: "Moderate speeds, frequent stops, high fuel efficiency." },
  { value: "touring", label: "Efficient Tourer", desc: "Consistent speeds, optimized packing, steady mileage." },
  { value: "sporty", label: "Sporty & Aggressive", desc: "Higher revs, deep cornering, higher fuel consumption." },
  { value: "off-road", label: "Off-Road Explorer", desc: "Heavy throttle variations, slow technical speeds, high fuel drag." },
];

export const MOTORCYCLE_SUGGESTIONS = [
  { model: "Honda Click 125i (Commuter Scooter)", economy: 50, unit: "km/l" as FuelEconomyUnit },
  { model: "Yamaha NMAX 155 (Commuter Scooter)", economy: 40, unit: "km/l" as FuelEconomyUnit },
  { model: "Honda ADV 160 (Adventure Scooter)", economy: 42, unit: "km/l" as FuelEconomyUnit },
  { model: "CFMoto 450MT (Expressway Adventure)", economy: 25, unit: "km/l" as FuelEconomyUnit },
  { model: "Kawasaki Ninja 400 (Expressway Sport)", economy: 24, unit: "km/l" as FuelEconomyUnit },
  { model: "Honda CB500X / NX500 (Expressway Tourer)", economy: 27, unit: "km/l" as FuelEconomyUnit },
  { model: "KTM 390 Adventure (Expressway Dual)", economy: 28, unit: "km/l" as FuelEconomyUnit },
  { model: "Royal Enfield Himalayan 450", economy: 30, unit: "km/l" as FuelEconomyUnit },
  { model: "Kawasaki Versys 650 (Expressway ADV)", economy: 22, unit: "km/l" as FuelEconomyUnit },
  { model: "BMW R 1250 GS (Premium Boxer ADV)", economy: 18, unit: "km/l" as FuelEconomyUnit },
];

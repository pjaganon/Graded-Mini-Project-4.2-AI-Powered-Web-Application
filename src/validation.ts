/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from "zod";
import type { TripBudget } from "./types";

const expenseAmount = z.number().finite().min(0).max(10_000_000);

export const expenseBreakdownSchema = z.object({
  fuel: expenseAmount,
  food: expenseAmount,
  accommodation: expenseAmount,
  toll: expenseAmount,
  parking: expenseAmount,
  ferry: expenseAmount,
  miscellaneous: expenseAmount,
  emergency: expenseAmount,
});

export const analyzeRequestSchema = z.object({
  tripName: z.string().max(200),
  motorcycleModel: z.string().max(200),
  distance: z.number().finite().min(0).max(1_000_000),
  distanceUnit: z.enum(["mi", "km"]),
  fuelEconomy: z.number().finite().min(0).max(500),
  fuelEconomyUnit: z.enum(["mpg", "l/100km", "km/l"]),
  fuelPrice: z.number().finite().min(0).max(10_000),
  fuelPriceUnit: z.enum(["gal", "liter"]),
  duration: z.number().finite().min(1).max(365),
  expenses: expenseBreakdownSchema,
  ridingStyle: z.string().max(50),
  routeType: z.string().max(50),
  passenger: z.enum(["solo", "two-up"]),
  customNotes: z.string().max(2000).optional().default(""),
});

export const tripBudgetSchema = z.object({
  id: z.string().max(100),
  tripName: z.string().max(200),
  motorcycleModel: z.string().max(200),
  distance: z.number().finite().min(0).max(1_000_000),
  distanceUnit: z.enum(["mi", "km"]),
  fuelEconomy: z.number().finite().min(0).max(500),
  fuelEconomyUnit: z.enum(["mpg", "l/100km", "km/l"]),
  fuelPrice: z.number().finite().min(0).max(10_000),
  fuelPriceUnit: z.enum(["gal", "liter"]),
  duration: z.number().finite().min(1).max(365),
  routeType: z.string().max(50),
  ridingStyle: z.string().max(50),
  passenger: z.enum(["solo", "two-up"]),
  expenses: expenseBreakdownSchema,
  customNotes: z.string().max(2000),
  savedAt: z.number().finite(),
  aiAnalysis: z.string().max(50_000).optional(),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type ValidatedTripBudget = TripBudget;

/** Strip control characters and cap length before embedding in AI prompts. */
export function sanitizeForPrompt(text: string, maxLength = 500): string {
  return text
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

export const MAX_IMPORT_FILE_BYTES = 1_048_576; // 1 MB
export const MAX_IMPORT_TRIPS = 100;

export function parseImportedTrips(raw: unknown): TripBudget[] {
  if (!Array.isArray(raw)) {
    throw new Error("Invalid backup file format.");
  }
  if (raw.length > MAX_IMPORT_TRIPS) {
    throw new Error(`Backup contains too many trips (max ${MAX_IMPORT_TRIPS}).`);
  }

  const validated: TripBudget[] = [];
  for (const item of raw) {
    const result = tripBudgetSchema.safeParse(item);
    if (result.success) {
      validated.push(result.data as TripBudget);
    }
  }
  return validated;
}

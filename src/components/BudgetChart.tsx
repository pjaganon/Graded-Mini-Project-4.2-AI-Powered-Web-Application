/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ExpenseBreakdown } from "../types";
import { Fuel, Coffee, Bed, Landmark, ShieldAlert, CircleEllipsis, Navigation, HelpCircle } from "lucide-react";

interface BudgetChartProps {
  expenses: ExpenseBreakdown;
}

const CATEGORY_COLORS: Record<keyof ExpenseBreakdown, string> = {
  fuel: "#d97706", // Amber-600
  food: "#f59e0b", // Amber-500
  accommodation: "#fbbf24", // Amber-400
  toll: "#71717a", // Zinc-500
  parking: "#52525b", // Zinc-600
  ferry: "#3f3f46", // Zinc-700
  miscellaneous: "#27272a", // Zinc-800
  emergency: "#ffffff", // Pure elegant white
};

const CATEGORY_LABELS: Record<keyof ExpenseBreakdown, string> = {
  fuel: "Fuel",
  food: "Food & Drinks",
  accommodation: "Lodging",
  toll: "Tolls",
  parking: "Parking",
  ferry: "Ferry Fees",
  miscellaneous: "Miscellaneous",
  emergency: "Emergency Fund",
};

const CATEGORY_ICONS: Record<keyof ExpenseBreakdown, React.ReactNode> = {
  fuel: <Fuel className="w-4 h-4 text-amber-600" />,
  food: <Coffee className="w-4 h-4 text-amber-500" />,
  accommodation: <Bed className="w-4 h-4 text-amber-400" />,
  toll: <Landmark className="w-4 h-4 text-zinc-500" />,
  parking: <Navigation className="w-4 h-4 text-zinc-600" />,
  ferry: <HelpCircle className="w-4 h-4 text-zinc-700" />,
  miscellaneous: <CircleEllipsis className="w-4 h-4 text-zinc-800" />,
  emergency: <ShieldAlert className="w-4 h-4 text-white" />,
};

type ChartSlice = {
  name: string;
  value: number;
  color: string;
};

export const BudgetChart: React.FC<BudgetChartProps> = ({ expenses }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = Object.values(expenses).reduce((acc, curr) => acc + curr, 0);

  const chartData: ChartSlice[] = Object.entries(expenses)
    .map(([key, value]) => ({
      name: CATEGORY_LABELS[key as keyof ExpenseBreakdown],
      value: value,
      color: CATEGORY_COLORS[key as keyof ExpenseBreakdown],
    }))
    .filter((item) => item.value > 0);

  const formatPercentage = (value: number) => {
    if (total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const activeSlice = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <div id="budget-chart-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#151515] border border-[#222] p-6 rounded-2xl">
      {/* Visual Recharts Donut */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center min-h-[280px]">
        {chartData.length === 0 ? (
          <div className="text-center text-zinc-600 py-10">
            <p className="text-sm font-medium">No expenses logged yet</p>
            <p className="text-xs mt-1">Fill out the planner to see the visual breakdown</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="w-full h-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onClick={(_, index) => setActiveIndex(index)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                        stroke={activeIndex === index ? "#f59e0b" : "transparent"}
                        strokeWidth={activeIndex === index ? 2 : 0}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-zinc-500 font-sans tracking-wider uppercase font-semibold">Total Budget</span>
                <span className="text-xl sm:text-2xl font-black text-white font-sans mt-0.5 italic tracking-tight">
                  ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Detail panel lives outside the donut so it never covers the total */}
            <div className="w-full min-h-[72px]">
              {activeSlice ? (
                <div className="bg-[#0F0F0F] border border-[#222] px-4 py-3 rounded-xl shadow-xl text-xs font-sans text-center sm:text-left">
                  <p className="font-semibold text-white">{activeSlice.name}</p>
                  <p className="text-zinc-400 mt-1">
                    Amount:{" "}
                    <span className="text-white font-medium">
                      ₱{activeSlice.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </p>
                  <p className="text-zinc-500">
                    Share: <span className="text-white font-medium">{formatPercentage(activeSlice.value)}</span>
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-600 text-center py-2">
                  Hover or tap a slice to see category details
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Structured Bento Progress Indicators */}
      <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Category Allocations</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(expenses).map(([key, value]) => {
            const catKey = key as keyof ExpenseBreakdown;
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const color = CATEGORY_COLORS[catKey];
            const icon = CATEGORY_ICONS[catKey];
            const label = CATEGORY_LABELS[catKey];

            return (
              <div
                key={key}
                className="p-3 rounded-xl border border-zinc-800/80 bg-[#0F0F0F]/60 hover:bg-[#0F0F0F]/90 transition-all duration-200 overflow-hidden"
              >
                <div className="flex items-start gap-2 mb-2 min-w-0">
                  <div className="p-1 rounded bg-[#0A0A0A]/80 shrink-0 mt-0.5">{icon}</div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-zinc-400 block truncate">{label}</span>
                    <span className="text-xs font-bold text-white block mt-0.5 break-all">
                      ₱{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[#222] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-zinc-600">{percentage.toFixed(1)}% of total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

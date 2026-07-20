/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
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

export const BudgetChart: React.FC<BudgetChartProps> = ({ expenses }) => {
  const total = Object.values(expenses).reduce((acc, curr) => acc + curr, 0);

  // Filter out $0 categories for the Recharts data
  const chartData = Object.entries(expenses)
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0F0F0F] border border-[#222] p-3 rounded-lg shadow-xl text-xs font-sans">
          <p className="font-semibold text-white">{data.name}</p>
          <p className="text-zinc-400 mt-1">
            Amount: <span className="text-white font-medium">₱{data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
          <p className="text-zinc-500">
            Share: <span className="text-white font-medium">{formatPercentage(data.value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="budget-chart-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#151515] border border-[#222] p-6 rounded-2xl">
      {/* Visual Recharts Donut */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center min-h-[240px]">
        {chartData.length === 0 ? (
          <div className="text-center text-zinc-600 py-10">
            <p className="text-sm font-medium">No expenses logged yet</p>
            <p className="text-xs mt-1">Fill out the planner to see the visual breakdown</p>
          </div>
        ) : (
          <div className="w-full h-[240px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-zinc-500 font-sans tracking-wider uppercase font-semibold">Total Budget</span>
              <span className="text-2xl font-black text-white font-sans mt-0.5 italic tracking-tight">₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                className="p-3 rounded-xl border border-zinc-800/80 bg-[#0F0F0F]/60 hover:bg-[#0F0F0F]/90 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-[#0A0A0A]/80">{icon}</div>
                    <span className="text-xs font-medium text-zinc-400">{label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">₱{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="w-full bg-[#222] rounded-full h-1.5 overflow-hidden mt-2">
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

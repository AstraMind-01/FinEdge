"use client";

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategorySpending } from './monthlyFinanceData';
import { 
  PieChart as PieIcon, Home, ShoppingCart, Utensils, 
  Zap, ShoppingBag, Fuel, HeartPulse, AlertCircle 
} from 'lucide-react';

interface CategorySpendingBreakdownProps {
  categories: CategorySpending[];
  totalSpending: number;
}

const ICON_MAP: Record<string, any> = {
  Home,
  ShoppingCart,
  Utensils,
  Zap,
  ShoppingBag,
  Fuel,
  HeartPulse,
};

export default function CategorySpendingBreakdown({
  categories,
  totalSpending,
}: CategorySpendingBreakdownProps) {
  const chartData = categories.map(cat => ({
    name: cat.name,
    value: cat.amount,
    color: cat.color,
  }));

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-surface-container border border-white/10 p-2.5 rounded-xl shadow-2xl text-[12px] backdrop-blur-md">
          <p className="font-semibold text-on-surface">{data.name}</p>
          <p className="text-primary font-medium mt-0.5">
            ₹{data.value.toLocaleString('en-IN')} ({Math.round((data.value / totalSpending) * 100)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-2xl bg-surface-container-low border border-white/10 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[16px] font-bold text-on-surface flex items-center gap-2">
            <PieIcon size={18} className="text-primary" />
            Category-wise Outflow
          </h3>
          <p className="text-[12px] text-on-surface-variant">
            Spending distribution against target budgets
          </p>
        </div>
        <span className="text-[12px] px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant border border-white/5 font-medium">
          7 Categories
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Donut Chart */}
        <div className="md:col-span-5 relative flex items-center justify-center h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={chartData}
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] text-on-surface-variant font-medium">Total Spent</span>
            <span className="text-[16px] font-bold text-on-surface">
              ₹{totalSpending.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Detailed Category Bars */}
        <div className="md:col-span-7 flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.iconName] || ShoppingBag;
            const pctOfBudget = Math.round((cat.amount / cat.budget) * 100);
            const isNearLimit = pctOfBudget >= 90;

            return (
              <div key={cat.id} className="p-2 rounded-xl bg-surface-container/60 border border-white/5 hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" 
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <Icon size={13} />
                    </div>
                    <span className="font-medium text-on-surface">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-on-surface">₹{cat.amount.toLocaleString('en-IN')}</span>
                    <span className="text-on-surface-variant text-[11px]">/ ₹{cat.budget.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-1.5 w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden flex">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, pctOfBudget)}%`, 
                      backgroundColor: isNearLimit ? '#f43f5e' : cat.color 
                    }}
                  />
                </div>

                {isNearLimit && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-rose-400">
                    <AlertCircle size={10} />
                    <span>Reached {pctOfBudget}% of planned monthly limit</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { PortfolioDataPoint } from "../../types";
import { COLORS } from "./investmentData";

interface PortfolioChartSectionProps {
  portfolioData: PortfolioDataPoint[];
  selectedRange: string;
  onRangeChange: (range: string) => void;
  allocationData: { name: string; value: number; color: string }[];
  totalCurrent: number;
}

export default function PortfolioChartSection({
  portfolioData,
  selectedRange,
  onRangeChange,
  allocationData,
  totalCurrent
}: PortfolioChartSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Portfolio Performance Chart */}
      <div className="bg-surface-container-low rounded-2xl p-6 border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-on-surface">Portfolio Performance</h3>
          <div className="flex gap-1 bg-surface-container p-1 rounded-xl border border-white/5">
            {["1M", "3M", "6M", "1Y", "All"].map((range) => (
              <button 
                key={range} 
                type="button"
                onClick={() => onRangeChange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedRange === range ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioData}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F0B429" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F0B429" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                formatter={(value: any) => [`₹${Number(value || 0).toLocaleString('en-IN')}`, 'Value']}
              />
              <Area type="monotone" dataKey="value" stroke="#F0B429" strokeWidth={2.5} fill="url(#goldGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Allocation Donut */}
      <div className="bg-surface-container-low rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-bold text-on-surface mb-4">Asset Allocation</h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-[200px] h-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocationData} innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                  {allocationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3 w-full">
            {allocationData.map((item, i) => {
              const pct = ((item.value / (totalCurrent || 1)) * 100).toFixed(1);
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-on-surface text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-on-surface-variant text-sm font-mono">₹{item.value.toLocaleString('en-IN')}</span>
                    <span className="text-on-surface font-bold text-sm w-12 text-right font-mono">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

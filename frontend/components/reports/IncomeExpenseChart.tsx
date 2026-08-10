"use client";

import React, { useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const DATA_BY_RANGE: Record<string, { name: string; income: number; expense: number }[]> = {
  Weekly: [
    { name: 'Mon', income: 8200, expense: 5100 },
    { name: 'Tue', income: 6400, expense: 4800 },
    { name: 'Wed', income: 9100, expense: 6200 },
    { name: 'Thu', income: 7800, expense: 5600 },
    { name: 'Fri', income: 11200, expense: 7900 },
    { name: 'Sat', income: 5400, expense: 3200 },
    { name: 'Sun', income: 3100, expense: 1800 },
  ],
  Monthly: [
    { name: 'Jan', income: 68000, expense: 42000 },
    { name: 'Feb', income: 72000, expense: 38000 },
    { name: 'Mar', income: 65000, expense: 45000 },
    { name: 'Apr', income: 80000, expense: 51000 },
    { name: 'May', income: 76000, expense: 47000 },
    { name: 'Jun', income: 84000, expense: 44000 },
    { name: 'Jul', income: 86500, expense: 48650 },
  ],
  Quarterly: [
    { name: 'Q1 23', income: 205000, expense: 125000 },
    { name: 'Q2 23', income: 240000, expense: 142000 },
    { name: 'Q3 23', income: 228000, expense: 138000 },
    { name: 'Q4 23', income: 260000, expense: 156000 },
    { name: 'Q1 24', income: 245000, expense: 148000 },
    { name: 'Q2 24', income: 270000, expense: 160000 },
    { name: 'Q3 24', income: 256500, expense: 145650 },
  ],
  Yearly: [
    { name: '2020', income: 720000, expense: 520000 },
    { name: '2021', income: 820000, expense: 560000 },
    { name: '2022', income: 940000, expense: 620000 },
    { name: '2023', income: 933000, expense: 561000 },
    { name: '2024', income: 1038000, expense: 583800 },
  ],
};

const RANGES = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-highest border border-primary/30 rounded-xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-[fadeIn_150ms_ease-out]">
        <p className="text-[12px] text-on-surface-variant mb-2 font-medium">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[13px] font-semibold text-on-surface">
              ₹{p.value.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-on-surface-variant capitalize">{p.name}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function IncomeExpenseChart() {
  const [range, setRange] = useState<keyof typeof DATA_BY_RANGE>('Monthly');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const data = DATA_BY_RANGE[range];

  return (
    <div className="bg-surface-container-low border border-white/5 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-[17px] font-headline-lg font-semibold text-on-surface">Income vs Expense Trend</h3>
          <p className="text-[13px] text-on-surface-variant mt-0.5">Track your financial flow over time</p>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container-high rounded-lg p-1 self-start">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-300 ${
                range === r
                  ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(240,180,41,0.3)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-5 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary/80" />
          <span className="text-[12px] text-on-surface-variant">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-error/80 rounded-full" />
          <span className="text-[12px] text-on-surface-variant">Expenses</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
          onMouseLeave={() => setHoveredBar(null)}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd481" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#ffd481" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#d4c5ad', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#d4c5ad', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,212,129,0.05)' }} />
          <Bar dataKey="income" radius={[6, 6, 0, 0]} maxBarSize={48} fill="url(#incomeGrad)"
            onMouseEnter={(_, i) => setHoveredBar(i)}
            isAnimationActive={true} animationDuration={800} animationEasing="ease-out">
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={hoveredBar === i ? '#fabd32' : 'url(#incomeGrad)'}
                opacity={hoveredBar !== null && hoveredBar !== i ? 0.6 : 1}
                style={{ filter: hoveredBar === i ? 'drop-shadow(0 0 8px rgba(255,212,129,0.6))' : 'none',
                         transform: hoveredBar === i ? 'scaleY(1.03)' : 'none', transformOrigin: 'bottom' }}
              />
            ))}
          </Bar>
          <Line dataKey="expense" type="monotone" stroke="#ffb4ab" strokeWidth={2.5}
            dot={{ fill: '#ffb4ab', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#ffb4ab', stroke: '#191f2f', strokeWidth: 2 }}
            isAnimationActive={true} animationDuration={1000} animationEasing="ease-out" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

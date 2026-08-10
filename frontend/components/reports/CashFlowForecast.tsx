"use client";

import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const SCENARIOS = {
  Optimistic: {
    color: '#57f1db',
    data: [
      { month: 'Apr', actual: 38200 },
      { month: 'May', actual: 36800 },
      { month: 'Jun', actual: 39100 },
      { month: 'Jul', actual: 37850 },
      { month: 'Aug', forecast: 40500, low: 38000, high: 43000 },
      { month: 'Sep', forecast: 43200, low: 40000, high: 47000 },
      { month: 'Oct', forecast: 46000, low: 42000, high: 51000 },
    ],
  },
  Expected: {
    color: '#ffd481',
    data: [
      { month: 'Apr', actual: 38200 },
      { month: 'May', actual: 36800 },
      { month: 'Jun', actual: 39100 },
      { month: 'Jul', actual: 37850 },
      { month: 'Aug', forecast: 38500, low: 36000, high: 41000 },
      { month: 'Sep', forecast: 39200, low: 36500, high: 42000 },
      { month: 'Oct', forecast: 41000, low: 38000, high: 44500 },
    ],
  },
  Conservative: {
    color: '#ffb4ab',
    data: [
      { month: 'Apr', actual: 38200 },
      { month: 'May', actual: 36800 },
      { month: 'Jun', actual: 39100 },
      { month: 'Jul', actual: 37850 },
      { month: 'Aug', forecast: 35500, low: 33000, high: 38000 },
      { month: 'Sep', forecast: 34200, low: 31500, high: 37000 },
      { month: 'Oct', forecast: 35000, low: 32000, high: 38500 },
    ],
  },
};

type ScenarioKey = keyof typeof SCENARIOS;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-highest border border-white/10 rounded-xl p-3 shadow-xl text-[13px]">
        <p className="font-semibold text-on-surface mb-1">{label}</p>
        {payload.map((p: any) => p.value != null && (
          <p key={p.dataKey} className="text-on-surface-variant">
            {p.name}: <span className="font-semibold text-on-surface">₹{p.value.toLocaleString('en-IN')}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CashFlowForecast() {
  const [scenario, setScenario] = useState<ScenarioKey>('Expected');
  const { color, data } = SCENARIOS[scenario];

  return (
    <div className="bg-surface-container-low border border-white/5 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-[17px] font-headline-lg font-semibold text-on-surface">Cash Flow Forecast</h3>
          <p className="text-[13px] text-on-surface-variant mt-0.5">Projected savings for next 3 months</p>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container-high rounded-lg p-1 self-start">
          {(Object.keys(SCENARIOS) as ScenarioKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setScenario(s)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-300 ${
                scenario === s
                  ? 'text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              style={scenario === s ? { backgroundColor: color, boxShadow: `0 0 12px ${color}50` } : {}}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.12} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#d4c5ad', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#d4c5ad', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x="Jul" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 2" label={{ value: 'Today', position: 'top', fill: '#d4c5ad', fontSize: 11 }} />
          <Area dataKey="high" fill="url(#bandGrad)" stroke="none" isAnimationActive animationDuration={600} />
          <Area dataKey="actual" type="monotone" stroke={color} strokeWidth={2.5}
            fill="url(#forecastGrad)" dot={{ fill: color, r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: color, stroke: '#191f2f', strokeWidth: 2 }}
            isAnimationActive animationDuration={800} animationEasing="ease-out" />
          <Area dataKey="forecast" type="monotone" stroke={color} strokeWidth={2.5} strokeDasharray="6 3"
            fill="url(#forecastGrad)" dot={{ fill: color, r: 4, strokeWidth: 0 }}
            isAnimationActive animationDuration={1000} animationEasing="ease-out" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

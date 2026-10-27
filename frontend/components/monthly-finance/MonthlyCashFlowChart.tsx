"use client";

import React, { useState } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, AreaChart, Area 
} from 'recharts';
import { MonthlyCashFlowPoint } from './monthlyFinanceData';
import { BarChart3, TrendingUp } from 'lucide-react';

interface MonthlyCashFlowChartProps {
  cashFlow: MonthlyCashFlowPoint[];
  monthLabel: string;
}

export default function MonthlyCashFlowChart({ cashFlow, monthLabel }: MonthlyCashFlowChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container border border-white/10 p-3 rounded-xl shadow-2xl text-[12px] space-y-1 backdrop-blur-md">
          <p className="font-semibold text-on-surface">{label}</p>
          <div className="flex items-center justify-between gap-4 text-emerald-400">
            <span>Income:</span>
            <span className="font-medium">₹{payload[0]?.value?.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-rose-400">
            <span>Spending:</span>
            <span className="font-medium">₹{payload[1]?.value?.toLocaleString('en-IN')}</span>
          </div>
          {payload[2] && (
            <div className="flex items-center justify-between gap-4 text-primary border-t border-white/5 pt-1 mt-1">
              <span>Savings:</span>
              <span className="font-medium">₹{payload[2]?.value?.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-2xl bg-surface-container-low border border-white/10 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-[16px] font-bold text-on-surface flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            Income vs Outflow Timeline
          </h3>
          <p className="text-[12px] text-on-surface-variant">
            Daily and weekly cash velocity for {monthLabel}
          </p>
        </div>

        <div className="flex items-center bg-surface-container border border-white/10 rounded-xl p-0.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition-all ${
              chartType === 'bar'
                ? 'bg-primary text-on-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <BarChart3 size={13} />
            <span>Bars</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('area')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition-all ${
              chartType === 'area'
                ? 'bg-primary text-on-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <TrendingUp size={13} />
            <span>Area</span>
          </button>
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={cashFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a334a" vertical={false} opacity={0.4} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
              />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="spending" name="Spending" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          ) : (
            <AreaChart data={cashFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a334a" vertical={false} opacity={0.4} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 10, fontSize: 11 }} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fillOpacity={1} fill="url(#incomeGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="spending" name="Spending" stroke="#f43f5e" fillOpacity={1} fill="url(#spendGradient)" strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

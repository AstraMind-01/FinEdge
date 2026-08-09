"use client";
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Holding, SIP, InvestmentGoal, PortfolioDataPoint } from '../../types';
import { MockApi } from '../../lib/mockApi';
import { Plus, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, BarChart3, Target, Eye, PlusCircle, Pause, Edit3, ChevronUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function InvestmentsPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [sips, setSips] = useState<SIP[]>([]);
  const [goals, setGoals] = useState<InvestmentGoal[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [h, s, g, p] = await Promise.all([
          MockApi.getHoldings(),
          MockApi.getSIPs(),
          MockApi.getInvestmentGoals(),
          MockApi.getPortfolioData()
        ]);
        setHoldings(h);
        setSips(s);
        setGoals(g);
        setPortfolioData(p);
      } catch (error) {
        console.error("Error fetching investment data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 lg:ml-[230px] flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalInvested = holdings.reduce((s, h) => s + h.investedAmount, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalReturn = totalCurrent - totalInvested;
  const totalReturnPct = ((totalReturn / totalInvested) * 100).toFixed(2);
  const todayChange = 3450;
  const todayChangePct = 0.35;

  // Asset allocation for donut chart
  const allocationMap: Record<string, number> = {};
  holdings.forEach(h => {
    allocationMap[h.category] = (allocationMap[h.category] || 0) + h.currentValue;
  });
  const allocationData = Object.entries(allocationMap).map(([name, value]) => ({ name, value }));
  const COLORS = ['#F0B429', '#6366f1', '#14b8a6', '#f97316', '#ef4444'];

  const categoryColors: Record<string, string> = {
    Equity: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Debt: "bg-green-500/10 text-green-400 border-green-500/20",
    Hybrid: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Gold: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Bond: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  };

  const summaryCards = [
    { title: "Portfolio Value", value: `₹${totalCurrent.toLocaleString('en-IN')}`, icon: <Wallet size={20} />, iconBg: "bg-primary/10 text-primary" },
    { title: "Total Invested", value: `₹${totalInvested.toLocaleString('en-IN')}`, icon: <BarChart3 size={20} />, iconBg: "bg-blue-500/10 text-blue-400" },
    { title: "Total Returns", value: `₹${totalReturn.toLocaleString('en-IN')}`, subtitle: `+${totalReturnPct}%`, icon: <TrendingUp size={20} />, iconBg: "bg-green-500/10 text-green-400", valueColor: "text-green-400" },
    { title: "Today's Change", value: `+₹${todayChange.toLocaleString('en-IN')}`, subtitle: `+${todayChangePct}%`, icon: <ArrowUpRight size={20} />, iconBg: "bg-green-500/10 text-green-400", valueColor: "text-green-400" },
  ];

  // Top performers
  const topPerformers = [...holdings].filter(h => h.returnPercent > 0).sort((a, b) => b.returnPercent - a.returnPercent).slice(0, 3);

  // Watchlist (fake entries)
  const watchlist = [
    { name: "Tata Motors", price: "₹812.40", change: "+2.3%" },
    { name: "HDFC Flexi Cap Fund", price: "NAV ₹42.15", change: "+1.1%" },
    { name: "Infosys", price: "₹1,542.60", change: "-0.4%" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <div className="flex-1 lg:ml-[230px] flex flex-col min-h-screen transition-all duration-300">
        <Header />
        <main className="flex-1 p-4 md:p-8 mt-[72px] overflow-y-auto max-w-[1400px] mx-auto w-full">
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">My Investments</h1>
              <p className="text-on-surface-variant text-[15px]">Grow your wealth with smart investment options</p>
            </div>
            <button className="flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-medium hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all">
              <Plus size={18} /> New Investment
            </button>
          </div>

          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryCards.map((card, i) => (
              <div key={i} className="bg-surface-container-low rounded-2xl p-5 border border-white/5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>{card.icon}</div>
                <div className="min-w-0">
                  <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-1 truncate">{card.title}</p>
                  <p className={`font-bold text-lg truncate ${card.valueColor || 'text-on-surface'}`}>{card.value}</p>
                  {card.subtitle && <p className="text-green-400 text-[11px] mt-0.5 flex items-center gap-0.5"><ArrowUpRight size={10} />{card.subtitle}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-8">

            {/* LEFT COLUMN */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">

              {/* Portfolio Performance Chart */}
              <div className="bg-surface-container-low rounded-2xl p-6 border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-on-surface">Portfolio Performance</h3>
                  <div className="flex gap-1">
                    {["1M", "3M", "6M", "1Y", "All"].map((range, i) => (
                      <button key={range} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${i === 3 ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>{range}</button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={portfolioData}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F0B429" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#F0B429" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Value']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#F0B429" strokeWidth={2.5} fill="url(#goldGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
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
                      const pct = ((item.value / totalCurrent) * 100).toFixed(1);
                      return (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                            <span className="text-on-surface text-sm font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-on-surface-variant text-sm">₹{item.value.toLocaleString('en-IN')}</span>
                            <span className="text-on-surface font-bold text-sm w-12 text-right">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* My Holdings Table */}
              <div className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 pb-4">
                  <h3 className="text-lg font-bold text-on-surface">My Holdings</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-container text-on-surface-variant text-[11px] uppercase tracking-wider">
                        <th className="text-left px-6 py-3 font-medium">Fund / Stock</th>
                        <th className="text-center px-4 py-3 font-medium">Category</th>
                        <th className="text-right px-4 py-3 font-medium">Invested</th>
                        <th className="text-right px-4 py-3 font-medium">Current Value</th>
                        <th className="text-right px-4 py-3 font-medium">Returns</th>
                        <th className="text-center px-6 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((h, i) => {
                        const isProfit = h.returnAmount >= 0;
                        return (
                          <tr key={h.id} className={`border-t border-white/5 ${i % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface-container/30'} hover:bg-surface-container/50 transition-colors`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${categoryColors[h.category] || 'bg-primary/10 text-primary'}`}>
                                  {h.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                                </div>
                                <div>
                                  <p className="text-on-surface font-medium">{h.name}</p>
                                  <p className="text-on-surface-variant text-[11px]">{h.type.replace('_', ' ')}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${categoryColors[h.category]}`}>{h.category}</span>
                            </td>
                            <td className="px-4 py-4 text-right text-on-surface">₹{h.investedAmount.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-4 text-right font-bold text-on-surface">₹{h.currentValue.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-4 text-right">
                              <div className={`flex items-center justify-end gap-1 font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                {isProfit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {isProfit ? '+' : ''}{h.returnPercent}%
                              </div>
                              <p className={`text-[11px] ${isProfit ? 'text-green-400/70' : 'text-red-400/70'}`}>
                                {isProfit ? '+' : ''}₹{h.returnAmount.toLocaleString('en-IN')}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button className="px-3 py-1 bg-primary/10 text-primary rounded-md text-[11px] font-medium hover:bg-primary/20 transition-colors">Buy More</button>
                                <button className="px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-md text-[11px] font-medium hover:text-on-surface transition-colors">Redeem</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">

              {/* SIP Overview */}
              <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
                <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
                  <BarChart3 size={16} className="text-primary" /> SIP Overview
                </h3>
                <div className="space-y-3">
                  {sips.map(sip => (
                    <div key={sip.id} className="p-3 rounded-xl bg-surface-container border border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-on-surface text-sm font-medium truncate pr-2">{sip.fundName}</p>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${sip.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>{sip.status}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-on-surface font-bold text-sm">₹{sip.monthlyAmount.toLocaleString('en-IN')}<span className="text-on-surface-variant font-normal text-[11px]">/mo</span></p>
                          <p className="text-on-surface-variant text-[11px]">Next: {sip.nextDebitDate}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-on-surface-variant hover:text-primary transition-colors"><Pause size={14} /></button>
                          <button className="text-on-surface-variant hover:text-primary transition-colors"><Edit3 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
                <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
                  <ChevronUp size={16} className="text-green-400" /> Top Performers
                </h3>
                <div className="space-y-3">
                  {topPerformers.map(h => (
                    <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-white/5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${categoryColors[h.category]}`}>
                        {h.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-on-surface text-sm font-medium truncate">{h.name}</p>
                      </div>
                      <span className="text-green-400 font-bold text-sm flex items-center gap-0.5 shrink-0">
                        <ArrowUpRight size={12} />+{h.returnPercent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Watchlist */}
              <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <Eye size={16} className="text-primary" /> Watchlist
                  </h3>
                  <button className="text-xs text-primary hover:underline">Edit</button>
                </div>
                <div className="space-y-3">
                  {watchlist.map((w, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-white/5">
                      <div className="flex-1 min-w-0">
                        <p className="text-on-surface text-sm font-medium">{w.name}</p>
                        <p className="text-on-surface-variant text-[11px]">{w.price}</p>
                      </div>
                      <span className={`text-sm font-medium ${w.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{w.change}</span>
                      <button className="text-primary hover:scale-110 transition-transform"><PlusCircle size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investment Goals */}
              <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <Target size={16} className="text-primary" /> Investment Goals
                  </h3>
                  <button className="text-xs text-primary hover:underline">+ Add Goal</button>
                </div>
                <div className="space-y-4">
                  {goals.map(goal => (
                    <div key={goal.id}>
                      <div className="flex justify-between items-end mb-1.5">
                        <p className="text-on-surface text-sm font-medium">{goal.name}</p>
                        <span className="text-primary text-sm font-bold">{goal.percentAchieved}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden mb-1">
                        <div className={`h-full rounded-full ${goal.percentAchieved >= 75 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${goal.percentAchieved}%` }}></div>
                      </div>
                      <p className="text-on-surface-variant text-[11px]">₹{goal.currentAmount.toLocaleString('en-IN')} of ₹{goal.targetAmount.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Explore Investment Options */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-on-surface mb-4">Explore Investment Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { title: "Mutual Funds", desc: "SIPs from ₹500/month with expert-managed portfolios", icon: <BarChart3 size={24} className="text-primary" />, bg: "from-amber-900/20", border: "border-amber-800/40" },
                { title: "Stocks & IPOs", desc: "Direct equity investment with zero brokerage on delivery", icon: <TrendingUp size={24} className="text-blue-400" />, bg: "from-blue-900/30", border: "border-blue-800/40" },
                { title: "Fixed Deposits", desc: "Guaranteed returns up to 8.5% with flexible tenures", icon: <Wallet size={24} className="text-green-400" />, bg: "from-green-900/30", border: "border-green-800/40" },
                { title: "Gold Investment", desc: "Digital gold, ETFs, and sovereign gold bonds", icon: <Target size={24} className="text-amber-400" />, bg: "from-yellow-900/20", border: "border-yellow-800/40" },
                { title: "Bonds", desc: "Corporate and government bonds with stable yields", icon: <BarChart3 size={24} className="text-purple-400" />, bg: "from-purple-900/30", border: "border-purple-800/40" },
              ].map((opt, i) => (
                <div key={i} className={`bg-gradient-to-br ${opt.bg} to-transparent rounded-2xl p-5 border ${opt.border} hover:border-primary/50 transition-colors group cursor-pointer`}>
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">{opt.icon}</div>
                  <h4 className="text-on-surface font-bold mb-2 text-sm">{opt.title}</h4>
                  <p className="text-[12px] text-on-surface-variant mb-3 leading-relaxed">{opt.desc}</p>
                  <a href="#" className="text-primary text-[12px] font-medium hover:underline group-hover:translate-x-1 transition-transform inline-block">Explore →</a>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

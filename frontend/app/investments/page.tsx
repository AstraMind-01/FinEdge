"use client";

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Holding, SIP, InvestmentGoal, PortfolioDataPoint } from '../../types';
import { MockApi } from '../../lib/mockApi';
import { Plus, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, BarChart3, Target, Eye, PlusCircle, Pause, Play, Edit3, ChevronUp, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AccountProvider } from '../../context/AccountContext';
import FullInvestmentModal from '../../components/modals/FullInvestmentModal';

const portfolioRangeData: Record<string, PortfolioDataPoint[]> = {
  "1M": [
    { month: "Week 1", value: 415000 },
    { month: "Week 2", value: 420000 },
    { month: "Week 3", value: 422000 },
    { month: "Week 4", value: 427450 }
  ],
  "3M": [
    { month: "Jun", value: 395000 },
    { month: "Jul", value: 410000 },
    { month: "Aug", value: 427450 }
  ],
  "6M": [
    { month: "Mar", value: 340000 },
    { month: "Apr", value: 355000 },
    { month: "May", value: 370000 },
    { month: "Jun", value: 395000 },
    { month: "Jul", value: 410000 },
    { month: "Aug", value: 427450 }
  ],
  "1Y": [
    { month: "Sep", value: 290000 },
    { month: "Nov", value: 305000 },
    { month: "Jan", value: 310000 },
    { month: "Mar", value: 340000 },
    { month: "May", value: 370000 },
    { month: "Jul", value: 410000 },
    { month: "Aug", value: 427450 }
  ],
  "All": [
    { month: "2023", value: 180000 },
    { month: "2024", value: 260000 },
    { month: "2025", value: 350000 },
    { month: "2026", value: 427450 }
  ]
};

export default function InvestmentsPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [sips, setSips] = useState<SIP[]>([]);
  const [goals, setGoals] = useState<InvestmentGoal[]>([]);
  const [selectedRange, setSelectedRange] = useState<string>("1Y");
  const [portfolioData, setPortfolioData] = useState<PortfolioDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [newInvestModalOpen, setNewInvestModalOpen] = useState(false);
  const [buyRedeemModalOpen, setBuyRedeemModalOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [modalActionType, setModalActionType] = useState<'BUY' | 'REDEEM'>('BUY');
  const [editSipModalOpen, setEditSipModalOpen] = useState(false);
  const [selectedSip, setSelectedSip] = useState<SIP | null>(null);
  const [newGoalModalOpen, setNewGoalModalOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Form States
  const [investCategory, setInvestCategory] = useState("Mutual Funds");
  const [investAmount, setInvestAmount] = useState("5000");
  const [investType, setInvestType] = useState("SIP");
  const [actionAmount, setActionAmount] = useState("10000");
  const [sipAmountInput, setSipAmountInput] = useState("5000");
  const [selectedDebitDate, setSelectedDebitDate] = useState<number>(10);
  const [stepUpEnabled, setStepUpEnabled] = useState<boolean>(true);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("1000000");

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

  const triggerToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 3000);
  };

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    if (portfolioRangeData[range]) {
      setPortfolioData(portfolioRangeData[range]);
    }
  };

  const handleToggleSipStatus = (sipId: string) => {
    setSips(prev => prev.map(s => {
      if (s.id === sipId) {
        const nextStatus = s.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
        triggerToast(`SIP "${s.fundName}" is now ${nextStatus}`);
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const handleOpenBuyRedeem = (holding: Holding, type: 'BUY' | 'REDEEM') => {
    setSelectedHolding(holding);
    setModalActionType(type);
    setActionAmount(type === 'BUY' ? '10000' : Math.round(holding.currentValue * 0.5).toString());
    setBuyRedeemModalOpen(true);
  };

  const handleConfirmBuyRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHolding) return;
    const amount = Number(actionAmount);
    if (modalActionType === 'BUY') {
      setHoldings(prev => prev.map(h => h.id === selectedHolding.id ? { ...h, investedAmount: h.investedAmount + amount, currentValue: h.currentValue + amount } : h));
      triggerToast(`Successfully bought ₹${amount.toLocaleString('en-IN')} units of ${selectedHolding.name}`);
    } else {
      setHoldings(prev => prev.map(h => h.id === selectedHolding.id ? { ...h, currentValue: Math.max(0, h.currentValue - amount) } : h));
      triggerToast(`Redemption request of ₹${amount.toLocaleString('en-IN')} submitted for ${selectedHolding.name}`);
    }
    setBuyRedeemModalOpen(false);
  };

  const handleOpenEditSip = (sip: SIP) => {
    setSelectedSip(sip);
    setSipAmountInput((sip.monthlyAmount || sip.amount).toString());
    setEditSipModalOpen(true);
  };

  const handleConfirmEditSip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSip) return;
    const newAmt = Number(sipAmountInput);
    setSips(prev => prev.map(s => s.id === selectedSip.id ? { ...s, amount: newAmt, monthlyAmount: newAmt } : s));
    triggerToast(`SIP amount for "${selectedSip.fundName}" updated to ₹${newAmt.toLocaleString('en-IN')}/mo`);
    setEditSipModalOpen(false);
  };

  const handleConfirmNewInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(investAmount);
    triggerToast(`New ${investType} Investment of ₹${amt.toLocaleString('en-IN')} in ${investCategory} submitted!`);
    setNewInvestModalOpen(false);
  };

  const handleConfirmNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle) return;
    const target = Number(goalTarget);
    const newG: InvestmentGoal = {
      id: `GOL-${Date.now()}`,
      name: goalTitle,
      targetAmount: target,
      currentAmount: 0,
      targetDate: "Dec 2028",
      percentAchieved: 0
    };
    setGoals(prev => [...prev, newG]);
    triggerToast(`Goal "${goalTitle}" created successfully!`);
    setNewGoalModalOpen(false);
    setGoalTitle("");
  };

  if (loading) {
    return (
      <AccountProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex-1 lg:ml-[230px] flex flex-col min-h-screen">
            <Header />
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </AccountProvider>
    );
  }

  const totalInvested = holdings.reduce((s, h) => s + h.investedAmount, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalReturn = totalCurrent - totalInvested;
  const totalReturnPct = ((totalReturn / (totalInvested || 1)) * 100).toFixed(2);
  const todayChange = 3450;
  const todayChangePct = 0.35;

  // Asset allocation for donut chart
  const allocationMap: Record<string, number> = {};
  holdings.forEach(h => {
    allocationMap[h.category] = (allocationMap[h.category] || 0) + h.currentValue;
  });
  const COLORS = ['#F0B429', '#6366f1', '#14b8a6', '#f97316', '#ef4444'];
  const allocationData = Object.entries(allocationMap).map(([name, value], i) => ({ 
    name, 
    value, 
    color: COLORS[i % COLORS.length] 
  }));

  const categoryColors: Record<string, string> = {
    "Large Cap Mutual Fund": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Small Cap Mutual Fund": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "Flexi Cap Mutual Fund": "bg-teal-500/10 text-teal-400 border-teal-500/20",
    "Equity Stock": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  const summaryCards = [
    { title: "Portfolio Value", value: `₹${totalCurrent.toLocaleString('en-IN')}`, icon: <Wallet size={20} />, iconBg: "bg-primary/10 text-primary" },
    { title: "Total Invested", value: `₹${totalInvested.toLocaleString('en-IN')}`, icon: <BarChart3 size={20} />, iconBg: "bg-blue-500/10 text-blue-400" },
    { title: "Total Returns", value: `₹${totalReturn.toLocaleString('en-IN')}`, subtitle: `+${totalReturnPct}%`, icon: <TrendingUp size={20} />, iconBg: "bg-green-500/10 text-green-400", valueColor: "text-green-400" },
    { title: "Today's Change", value: `+₹${todayChange.toLocaleString('en-IN')}`, subtitle: `+${todayChangePct}%`, icon: <ArrowUpRight size={20} />, iconBg: "bg-green-500/10 text-green-400", valueColor: "text-green-400" },
  ];

  // Top performers
  const topPerformers = [...holdings]
    .filter(h => (h.returnPercent ?? ((h.currentValue - h.investedAmount) / (h.investedAmount || 1) * 100)) > 0)
    .sort((a, b) => (b.returnPercent ?? (b.currentValue - b.investedAmount)) - (a.returnPercent ?? (a.currentValue - a.investedAmount)))
    .slice(0, 3);

  // Watchlist
  const watchlist = [
    { name: "Tata Motors", price: "₹812.40", change: "+2.3%" },
    { name: "HDFC Flexi Cap Fund", price: "NAV ₹42.15", change: "+1.1%" },
    { name: "Infosys", price: "₹1,542.60", change: "-0.4%" },
  ];

  return (
    <AccountProvider>
      <div className="flex min-h-screen bg-background text-on-surface relative">
        <Sidebar />
        <div className="flex-1 lg:ml-[230px] flex flex-col min-h-screen transition-all duration-300">
          <Header />
          
          <main className="flex-1 p-4 md:p-8 mt-[72px] overflow-y-auto max-w-[1400px] mx-auto w-full">
            
            {/* Toast Notification */}
            {actionSuccessMsg && (
              <div className="fixed top-20 right-6 z-[10000] bg-surface-container border border-primary/40 text-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
                <CheckCircle2 size={18} className="text-primary shrink-0" />
                <span className="text-xs font-bold">{actionSuccessMsg}</span>
              </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">My Investments</h1>
                <p className="text-on-surface-variant text-[15px]">Grow your wealth with smart investment options</p>
              </div>
              <button 
                type="button"
                onClick={() => setNewInvestModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all"
              >
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
                    <div className="flex gap-1 bg-surface-container p-1 rounded-xl border border-white/5">
                      {["1M", "3M", "6M", "1Y", "All"].map((range) => (
                        <button 
                          key={range} 
                          type="button"
                          onClick={() => handleRangeChange(range)}
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

                {/* My Holdings Table */}
                <div className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden">
                  <div className="p-6 pb-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-on-surface">My Holdings</h3>
                    <span className="text-xs text-on-surface-variant">{holdings.length} Assets</span>
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
                          const retAmt = h.returnAmount ?? (h.currentValue - h.investedAmount);
                          const retPct = h.returnPercent ?? Number(((retAmt / (h.investedAmount || 1)) * 100).toFixed(2));
                          const isProfit = retAmt >= 0;
                          const hType = h.type ? h.type.replace('_', ' ') : 'Mutual Fund';
                          return (
                            <tr key={h.id} className={`border-t border-white/5 ${i % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface-container/30'} hover:bg-surface-container/50 transition-colors`}>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${categoryColors[h.category] || 'bg-primary/10 text-primary'}`}>
                                    {h.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                                  </div>
                                  <div>
                                    <p className="text-on-surface font-bold text-xs">{h.name}</p>
                                    <p className="text-on-surface-variant text-[11px]">{hType}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${categoryColors[h.category] || 'border-white/10 text-on-surface'}`}>{h.category}</span>
                              </td>
                              <td className="px-4 py-4 text-right text-on-surface font-mono">₹{h.investedAmount.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-4 text-right font-bold text-on-surface font-mono">₹{h.currentValue.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-4 text-right font-mono">
                                <div className={`flex items-center justify-end gap-1 font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                  {isProfit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                  {isProfit ? '+' : ''}{retPct}%
                                </div>
                                <p className={`text-[11px] ${isProfit ? 'text-green-400/70' : 'text-red-400/70'}`}>
                                  {isProfit ? '+' : ''}₹{retAmt.toLocaleString('en-IN')}
                                </p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex justify-center gap-2">
                                  <button 
                                    type="button"
                                    onClick={() => handleOpenBuyRedeem(h, 'BUY')}
                                    className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[11px] font-bold hover:bg-primary/20 transition-colors"
                                  >
                                    Buy More
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleOpenBuyRedeem(h, 'REDEEM')}
                                    className="px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-lg text-[11px] font-bold hover:text-on-surface transition-colors border border-white/5"
                                  >
                                    Redeem
                                  </button>
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
                    {sips.map(sip => {
                      const sipStatus = sip.status || 'ACTIVE';
                      const sipMonthly = sip.monthlyAmount || sip.amount;
                      const isPaused = sipStatus === 'PAUSED';
                      return (
                        <div key={sip.id} className="p-3.5 rounded-xl bg-surface-container border border-white/5">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-on-surface text-xs font-bold truncate pr-2">{sip.fundName}</p>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border ${isPaused ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>{sipStatus}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <div>
                              <p className="text-on-surface font-bold text-xs font-mono">₹{sipMonthly.toLocaleString('en-IN')}<span className="text-on-surface-variant font-normal text-[11px]">/mo</span></p>
                              <p className="text-on-surface-variant text-[11px] mt-0.5">Next: {sip.nextDebitDate}</p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                type="button"
                                title={isPaused ? "Resume SIP" : "Pause SIP"}
                                onClick={() => handleToggleSipStatus(sip.id)}
                                className="w-7 h-7 rounded-lg bg-surface-container-high border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all"
                              >
                                {isPaused ? <Play size={13} className="text-tertiary" /> : <Pause size={13} />}
                              </button>
                              <button 
                                type="button"
                                title="Edit SIP Amount"
                                onClick={() => handleOpenEditSip(sip)}
                                className="w-7 h-7 rounded-lg bg-surface-container-high border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all"
                              >
                                <Edit3 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${categoryColors[h.category] || 'bg-primary/10 text-primary'}`}>
                          {h.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-on-surface text-xs font-bold truncate">{h.name}</p>
                        </div>
                        <span className="text-green-400 font-bold text-xs flex items-center gap-0.5 shrink-0 font-mono">
                          <ArrowUpRight size={12} />+{(h.returnPercent || 24.5)}%
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
                    <button type="button" onClick={() => triggerToast("Watchlist editor opened")} className="text-xs text-primary font-semibold hover:underline">Edit</button>
                  </div>
                  <div className="space-y-3">
                    {watchlist.map((w, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-white/5">
                        <div className="flex-1 min-w-0">
                          <p className="text-on-surface text-xs font-bold">{w.name}</p>
                          <p className="text-on-surface-variant text-[11px] font-mono">{w.price}</p>
                        </div>
                        <span className={`text-xs font-bold font-mono ${w.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{w.change}</span>
                        <button type="button" onClick={() => triggerToast(`Added ${w.name} to watch alert`)} className="text-primary hover:scale-110 transition-transform"><PlusCircle size={16} /></button>
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
                    <button 
                      type="button"
                      onClick={() => setNewGoalModalOpen(true)}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      + Add Goal
                    </button>
                  </div>
                  <div className="space-y-4">
                    {goals.map(goal => (
                      <div key={goal.id}>
                        <div className="flex justify-between items-end mb-1.5">
                          <p className="text-on-surface text-xs font-bold">{goal.name}</p>
                          <span className="text-primary text-xs font-mono font-bold">{goal.percentAchieved}%</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden mb-1">
                          <div className={`h-full rounded-full ${goal.percentAchieved >= 75 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${goal.percentAchieved}%` }}></div>
                        </div>
                        <p className="text-on-surface-variant text-[11px] font-mono">₹{goal.currentAmount.toLocaleString('en-IN')} of ₹{goal.targetAmount.toLocaleString('en-IN')}</p>
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
                  <div 
                    key={i} 
                    onClick={() => { setInvestCategory(opt.title); setNewInvestModalOpen(true); }}
                    className={`bg-gradient-to-br ${opt.bg} to-transparent rounded-2xl p-5 border ${opt.border} hover:border-primary/50 transition-all group cursor-pointer flex flex-col justify-between`}
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">{opt.icon}</div>
                      <h4 className="text-on-surface font-bold mb-2 text-sm">{opt.title}</h4>
                      <p className="text-[12px] text-on-surface-variant mb-3 leading-relaxed">{opt.desc}</p>
                    </div>
                    <button type="button" className="text-primary text-[12px] font-bold hover:underline group-hover:translate-x-1 transition-transform inline-block self-start mt-auto">Explore →</button>
                  </div>
                ))}
              </div>
            </div>

          </main>
        </div>

        {/* Full Investment Application Modal */}
        <FullInvestmentModal 
          isOpen={newInvestModalOpen}
          onClose={() => setNewInvestModalOpen(false)}
          category={investCategory}
          onInvestmentSuccess={async ({ holding, sip, newBalance }) => {
            if (holding) {
              setHoldings(prev => [holding, ...prev]);
            }
            if (sip) {
              setSips(prev => [sip, ...prev]);
            }
            triggerToast(`Investment executed! ACC-001 balance updated to ₹${newBalance.toLocaleString('en-IN')}`);
          }}
        />

        {/* Buy / Redeem Modal */}
        {buyRedeemModalOpen && selectedHolding && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
            <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <TrendingUp size={20} className="text-primary" />
                  <h3 className="text-base font-bold text-on-surface">{modalActionType === 'BUY' ? 'Buy Additional Units' : 'Redeem Units'}</h3>
                </div>
                <button onClick={() => setBuyRedeemModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmBuyRedeem} className="space-y-4 text-xs">
                <div className="p-3.5 bg-surface rounded-xl border border-white/5">
                  <p className="text-xs font-bold text-on-surface">{selectedHolding.name}</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Current Value: ₹{selectedHolding.currentValue.toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1.5">{modalActionType === 'BUY' ? 'Purchase Amount (₹)' : 'Redemption Amount (₹)'}</label>
                  <input 
                    type="number"
                    value={actionAmount}
                    onChange={e => setActionAmount(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setBuyRedeemModalOpen(false)} className="flex-1 py-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]">
                    {modalActionType === 'BUY' ? 'Confirm Buy' : 'Confirm Redeem'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SIP & Mutual Fund Details Dashboard Modal */}
        {editSipModalOpen && selectedSip && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4 overflow-y-auto py-6">
            <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-[10000] my-auto">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/30">
                      {selectedSip.category || 'Large Cap Equity'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20">
                      5★ Rated Fund
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20">
                      {selectedSip.riskGrade || 'Very High Risk'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-on-surface">{selectedSip.fundName}</h3>
                  <p className="text-[11px] text-on-surface-variant">{selectedSip.fundHouse || 'Axis Mutual Fund'} • Folio: {selectedSip.folioNumber || 'FOL-992184-AX'}</p>
                </div>
                <button onClick={() => setEditSipModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                  <X size={18} />
                </button>
              </div>

              {/* Fund Metrics Strip */}
              <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-surface rounded-xl border border-white/5 text-center">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Current NAV</span>
                  <span className="text-sm font-bold text-on-surface font-mono">₹{selectedSip.nav || 54.80}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">3Y CAGR Return</span>
                  <span className="text-sm font-bold text-green-400 font-mono">+{selectedSip.returns3Y || 18.4}% p.a.</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Installments</span>
                  <span className="text-sm font-bold text-primary font-mono">{selectedSip.installmentsPaid || 12} Paid</span>
                </div>
              </div>

              {/* Wealth Projection Banner */}
              <div className="p-3.5 mb-4 bg-gradient-to-r from-primary/10 via-surface to-surface rounded-xl border border-primary/20 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-on-surface-variant uppercase font-semibold">Wealth Projection (at 15% CAGR)</p>
                  <p className="text-xs text-on-surface mt-0.5">
                    Investing <strong className="text-primary">₹{Number(sipAmountInput || 5000).toLocaleString('en-IN')}/mo</strong> grows to:
                  </p>
                </div>
                <div className="text-right font-mono">
                  <p className="text-xs font-bold text-primary">5Y: ~₹{Math.round(Number(sipAmountInput || 5000) * 89.6).toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-tertiary font-bold">10Y: ~₹{Math.round(Number(sipAmountInput || 5000) * 278.6).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <form onSubmit={handleConfirmEditSip} className="space-y-4 text-xs">
                
                {/* Monthly Amount Input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-semibold text-on-surface-variant">Monthly SIP Contribution (₹)</label>
                    <span className="text-[11px] text-on-surface-variant font-mono">Min ₹500</span>
                  </div>
                  <input 
                    type="number"
                    value={sipAmountInput}
                    onChange={e => setSipAmountInput(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono font-bold text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Monthly Debit Date Selector */}
                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1.5">Monthly Auto-Debit Date</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 25].map(d => (
                      <button 
                        key={d} 
                        type="button"
                        onClick={() => setSelectedDebitDate(d)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${selectedDebitDate === d ? 'bg-primary text-on-primary border-primary shadow-md' : 'bg-surface border-white/10 text-on-surface-variant hover:text-on-surface'}`}
                      >
                        {d}th of month
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step-Up SIP Auto-Increase Toggle */}
                <div className="p-3 bg-surface rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-on-surface text-xs">Annual Step-Up SIP (+10%)</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">Auto-increase SIP amount by 10% every year to fight inflation.</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={stepUpEnabled}
                    onChange={e => setStepUpEnabled(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer shrink-0 ml-3"
                  />
                </div>

                {/* Mandate Info */}
                <div className="p-3 bg-surface-container-high rounded-xl border border-white/5 text-[11px] text-on-surface-variant flex items-center gap-2">
                  <ShieldCheck size={16} className="text-tertiary shrink-0" />
                  <span>Linked Auto-Debit Account: <strong>{selectedSip.linkedAccount || 'Primary Savings ACC-001 •••• 8812'}</strong></span>
                </div>

                {/* Action Controls */}
                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      triggerToast(`Skipped next installment for ${selectedSip.fundName}`);
                      setEditSipModalOpen(false);
                    }}
                    className="py-2.5 px-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest text-xs border border-white/10"
                  >
                    Skip Next
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      handleToggleSipStatus(selectedSip.id);
                      setEditSipModalOpen(false);
                    }}
                    className="py-2.5 px-3 bg-surface-high text-amber-400 font-semibold rounded-xl hover:bg-surface-highest text-xs border border-amber-500/20"
                  >
                    {selectedSip.status === 'PAUSED' ? 'Resume' : 'Pause'}
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] text-xs"
                  >
                    Save &amp; Update Mandate
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* New Goal Modal */}
        {newGoalModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
            <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl z-[10000]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-on-surface">Create Financial Goal</h3>
                <button onClick={() => setNewGoalModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmNewGoal} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1.5">Goal Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Dream House, Retirement"
                    value={goalTitle}
                    onChange={e => setGoalTitle(e.target.value)}
                    required
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1.5">Target Amount (₹)</label>
                  <input 
                    type="number"
                    value={goalTarget}
                    onChange={e => setGoalTarget(e.target.value)}
                    required
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setNewGoalModalOpen(false)} className="flex-1 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]">Create Goal</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AccountProvider>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Holding, SIP, InvestmentGoal, PortfolioDataPoint } from '../../types';
import { MockApi } from '../../lib/mockApi';
import { Plus, ChevronUp, Eye, PlusCircle, BarChart3, TrendingUp, Wallet, Target } from 'lucide-react';
import { AccountProvider } from '../../context/AccountContext';
import { WatchlistProvider, useWatchlist } from '../../context/WatchlistContext';
import FullInvestmentModal from '../../components/modals/FullInvestmentModal';
import EditWatchlistModal from '../../components/modals/EditWatchlistModal';
import { portfolioRangeData, COLORS, categoryColors } from '../../components/investments/investmentData';
import InvestmentSummaryCards from '../../components/investments/InvestmentSummaryCards';
import PortfolioChartSection from '../../components/investments/PortfolioChartSection';
import HoldingsTable from '../../components/investments/HoldingsTable';
import SipsSection from '../../components/investments/SipsSection';
import InvestmentGoalsSection from '../../components/investments/InvestmentGoalsSection';
import { BuyRedeemModal, EditSipModal, NewGoalModal } from '../../components/investments/InvestmentModals';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';

function InvestmentsContent() {
  const { watchlistItems, toggleWatchlist, isEditModalOpen, setIsEditModalOpen } = useWatchlist();
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
        const newStatus = s.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
        triggerToast(`SIP for ${s.fundName} has been ${newStatus === 'ACTIVE' ? 'resumed' : 'paused'}.`);
        return { ...s, status: newStatus as any };
      }
      return s;
    }));
  };

  const handleOpenBuyRedeem = (holding: Holding, type: 'BUY' | 'REDEEM') => {
    setSelectedHolding(holding);
    setModalActionType(type);
    setActionAmount(type === 'BUY' ? "10000" : String(Math.min(10000, holding.currentValue)));
    setBuyRedeemModalOpen(true);
  };

  const handleConfirmBuyRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHolding) return;
    const amount = Number(actionAmount);
    if (modalActionType === 'BUY') {
      setHoldings(prev => prev.map(h => {
        if (h.id === selectedHolding.id) {
          return {
            ...h,
            investedAmount: h.investedAmount + amount,
            currentValue: h.currentValue + amount,
          };
        }
        return h;
      }));
      triggerToast(`Successfully purchased additional units of ${selectedHolding.name} for ₹${amount.toLocaleString('en-IN')}`);
    } else {
      setHoldings(prev => prev.map(h => {
        if (h.id === selectedHolding.id) {
          const newCurrent = Math.max(0, h.currentValue - amount);
          return {
            ...h,
            currentValue: newCurrent,
            investedAmount: Math.max(0, h.investedAmount - amount)
          };
        }
        return h;
      }));
      triggerToast(`Redemption request of ₹${amount.toLocaleString('en-IN')} for ${selectedHolding.name} submitted!`);
    }
    setBuyRedeemModalOpen(false);
  };

  const handleOpenEditSip = (sip: SIP) => {
    setSelectedSip(sip);
    setSipAmountInput(String(sip.monthlyAmount || sip.amount || 5000));
    setSelectedDebitDate(sip.debitDate || 10);
    setStepUpEnabled(sip.stepUpPercent ? sip.stepUpPercent > 0 : true);
    setEditSipModalOpen(true);
  };

  const handleConfirmEditSip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSip) return;
    const newAmt = Number(sipAmountInput);
    setSips(prev => prev.map(s => {
      if (s.id === selectedSip.id) {
        return {
          ...s,
          amount: newAmt,
          monthlyAmount: newAmt,
          debitDate: selectedDebitDate,
          frequency: `Monthly (${selectedDebitDate}th)`,
          stepUpPercent: stepUpEnabled ? 10 : 0
        };
      }
      return s;
    }));
    triggerToast(`SIP for ${selectedSip.fundName} updated to ₹${newAmt.toLocaleString('en-IN')}/month`);
    setEditSipModalOpen(false);
  };

  const handleConfirmNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    const newG: InvestmentGoal = {
      id: `GOAL-${Date.now()}`,
      name: goalTitle,
      targetAmount: Number(goalTarget),
      currentAmount: 0,
      percentAchieved: 0,
      targetDate: "2030-12-31"
    };
    setGoals(prev => [...prev, newG]);
    setGoalTitle("");
    setGoalTarget("1000000");
    setNewGoalModalOpen(false);
    triggerToast(`Goal "${newG.name}" created!`);
  };

  if (loading) {
    return (
      <AccountProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex-1 lg:pl-[230px] w-full min-w-0 flex flex-col min-h-screen">
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

  const allocationMap: Record<string, number> = {};
  holdings.forEach(h => {
    allocationMap[h.category] = (allocationMap[h.category] || 0) + h.currentValue;
  });
  const allocationData = Object.entries(allocationMap).map(([name, value], i) => ({ 
    name, 
    value, 
    color: COLORS[i % COLORS.length] 
  }));

  const topPerformers = [...holdings]
    .filter(h => (h.returnPercent ?? ((h.currentValue - h.investedAmount) / (h.investedAmount || 1) * 100)) > 0)
    .sort((a, b) => (b.returnPercent ?? (b.currentValue - b.investedAmount)) - (a.returnPercent ?? (a.currentValue - a.investedAmount)))
    .slice(0, 3);

  return (
    <AccountProvider>
      <div className="flex min-h-screen bg-background text-on-surface relative">
        <Sidebar />
        <div className="flex-1 lg:pl-[230px] w-full min-w-0 max-w-full flex flex-col min-h-screen transition-all duration-300 overflow-x-hidden">
          <Header />
          
          <main className="flex-1 p-4 md:p-8 mt-[72px] overflow-y-auto max-w-[1400px] mx-auto w-full">
            {actionSuccessMsg && (
              <div className="fixed top-20 right-6 z-[10000] bg-surface-container border border-primary/40 text-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
                <CheckCircle2 size={18} className="text-primary shrink-0" />
                <span className="text-xs font-bold">{actionSuccessMsg}</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">My Investments</h1>
                <p className="text-on-surface-variant text-[15px]">Grow your wealth with smart investment options</p>
              </div>
              <button 
                type="button"
                onClick={() => setNewInvestModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer"
              >
                <Plus size={18} /> New Investment
              </button>
            </div>

            <InvestmentSummaryCards
              totalCurrent={totalCurrent}
              totalInvested={totalInvested}
              totalReturn={totalReturn}
              totalReturnPct={totalReturnPct}
              todayChange={todayChange}
              todayChangePct={todayChangePct}
            />

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 flex flex-col gap-6 min-w-0">
                <PortfolioChartSection
                  portfolioData={portfolioData}
                  selectedRange={selectedRange}
                  onRangeChange={handleRangeChange}
                  allocationData={allocationData}
                  totalCurrent={totalCurrent}
                />

                <HoldingsTable
                  holdings={holdings}
                  onOpenBuyRedeem={handleOpenBuyRedeem}
                />
              </div>

              <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
                <SipsSection
                  sips={sips}
                  onToggleStatus={handleToggleSipStatus}
                  onOpenEdit={handleOpenEditSip}
                />

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

                <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                      <Eye size={16} className="text-primary" /> Watchlist
                    </h3>
                    <button type="button" onClick={() => setIsEditModalOpen(true)} className="text-xs text-primary font-semibold hover:underline cursor-pointer">Edit</button>
                  </div>
                  <div className="space-y-3">
                    {watchlistItems.map((w, i) => {
                      const priceStr = w.marketData?.formattedPrice || w.price || "₹500.00";
                      const changeStr = w.marketData?.formattedChange || w.change || "+0.0%";
                      const isPos = w.marketData?.isPositive ?? !changeStr.startsWith("-");

                      return (
                        <div key={w.instrumentId || i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-white/5">
                          <div className="flex-1 min-w-0">
                            <p className="text-on-surface text-xs font-bold">{w.instrumentName}</p>
                            <p className="text-on-surface-variant text-[11px] font-mono">{priceStr}</p>
                          </div>
                          <span className={`text-xs font-bold font-mono ${isPos ? 'text-green-400' : 'text-red-400'}`}>{changeStr}</span>
                          <button 
                            type="button" 
                            onClick={async () => {
                              await toggleWatchlist(w);
                              triggerToast(`Updated ${w.instrumentName} in watchlist`);
                            }} 
                            className="text-primary hover:scale-110 transition-transform cursor-pointer"
                            title="Toggle Watchlist"
                          >
                            <PlusCircle size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <InvestmentGoalsSection
                  goals={goals}
                  onOpenNewGoal={() => setNewGoalModalOpen(true)}
                />
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

        <BuyRedeemModal
          isOpen={buyRedeemModalOpen}
          onClose={() => setBuyRedeemModalOpen(false)}
          selectedHolding={selectedHolding}
          modalActionType={modalActionType}
          actionAmount={actionAmount}
          setActionAmount={setActionAmount}
          onConfirm={handleConfirmBuyRedeem}
        />

        <EditSipModal
          isOpen={editSipModalOpen}
          onClose={() => setEditSipModalOpen(false)}
          selectedSip={selectedSip}
          sipAmountInput={sipAmountInput}
          setSipAmountInput={setSipAmountInput}
          selectedDebitDate={selectedDebitDate}
          setSelectedDebitDate={setSelectedDebitDate}
          stepUpEnabled={stepUpEnabled}
          setStepUpEnabled={setStepUpEnabled}
          onConfirm={handleConfirmEditSip}
          onSkipNext={() => {
            if (selectedSip) triggerToast(`Skipped next installment for ${selectedSip.fundName}`);
            setEditSipModalOpen(false);
          }}
          onToggleStatus={(id) => {
            handleToggleSipStatus(id);
            setEditSipModalOpen(false);
          }}
        />

        <NewGoalModal
          isOpen={newGoalModalOpen}
          onClose={() => setNewGoalModalOpen(false)}
          goalTitle={goalTitle}
          setGoalTitle={setGoalTitle}
          goalTarget={goalTarget}
          setGoalTarget={setGoalTarget}
          onConfirm={handleConfirmNewGoal}
        />

        <EditWatchlistModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      </div>
    </AccountProvider>
  );
}

export default function InvestmentsPage() {
  return (
    <WatchlistProvider>
      <InvestmentsContent />
    </WatchlistProvider>
  );
}

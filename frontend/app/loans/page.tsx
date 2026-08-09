"use client";

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import LoansHeader from '../../components/loans/LoansHeader';
import LoanSummaryStrip from '../../components/loans/LoanSummaryStrip';
import LoanCard from '../../components/loans/LoanCard';
import LoansRightSidebar from '../../components/loans/LoansRightSidebar';
import ExploreLoanProducts from '../../components/loans/ExploreLoanProducts';
import { Loan, LoanApplication } from '../../types';
import { MockApi } from '../../lib/mockApi';
import { AccountProvider } from '../../context/AccountContext';
import { X, CheckCircle2, ShieldCheck, CreditCard, Sparkles, ArrowRight, DollarSign, Calculator } from 'lucide-react';
import FullLoanApplicationModal from '../../components/modals/FullLoanApplicationModal';

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [payEmiModalOpen, setPayEmiModalOpen] = useState(false);
  const [prepayModalOpen, setPrepayModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState(false);
  const [fullCalcModalOpen, setFullCalcModalOpen] = useState(false);
  const [calcPrepayAmount, setCalcPrepayAmount] = useState<number>(115000);

  // Active Selected States
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disbursalSuccess, setDisbursalSuccess] = useState(false);

  // Form Inputs
  const [selectedAccount, setSelectedAccount] = useState("ACC-001");
  const [prepayAmountInput, setPrepayAmountInput] = useState("50000");
  const [applyLoanType, setApplyLoanType] = useState("Personal Loan");
  const [applyAmountInput, setApplyAmountInput] = useState("500000");
  const [applyTenureInput, setApplyTenureInput] = useState("36");
  const [applyInterestRate, setApplyInterestRate] = useState("10.25");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedLoans = await MockApi.getLoans();
        setLoans(fetchedLoans);
      } catch (error) {
        console.error("Error fetching loans data", error);
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

  const handleOpenPayEmi = (loan: Loan) => {
    setSelectedLoan(loan);
    setPayEmiModalOpen(true);
  };

  const handleConfirmPayEmi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const emiAmt = selectedLoan.nextEmiAmount;
      setLoans(prev => prev.map(l => {
        if (l.id === selectedLoan.id) {
          const newPaidCount = l.emiPaid + 1;
          const newBalance = Math.max(0, l.outstandingBalance - (l.monthlyEmi * 0.6));
          const updatedSchedule = l.emiSchedule.map((item, i) => i === 0 ? { ...item, status: 'PAID' as const } : item);
          return {
            ...l,
            emiPaid: newPaidCount,
            outstandingBalance: newBalance,
            emiSchedule: updatedSchedule
          };
        }
        return l;
      }));

      setIsSubmitting(false);
      triggerToast(`EMI Payment of ₹${emiAmt.toLocaleString('en-IN')} for ${selectedLoan.name} processed successfully!`);
      setPayEmiModalOpen(false);
    }, 1000);
  };

  const handleOpenPrepay = (loan: Loan) => {
    setSelectedLoan(loan);
    setPrepayAmountInput("50000");
    setPrepayModalOpen(true);
  };

  const handleConfirmPrepay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const prepayAmt = Number(prepayAmountInput);
      setLoans(prev => prev.map(l => {
        if (l.id === selectedLoan.id) {
          return {
            ...l,
            outstandingBalance: Math.max(0, l.outstandingBalance - prepayAmt)
          };
        }
        return l;
      }));

      setIsSubmitting(false);
      triggerToast(`Prepayment of ₹${prepayAmt.toLocaleString('en-IN')} applied to ${selectedLoan.name}!`);
      setPrepayModalOpen(false);
    }, 1000);
  };

  const handleOpenApplyModal = (productTitle?: string) => {
    if (productTitle) {
      setApplyLoanType(productTitle);
    }
    setApplyModalOpen(true);
  };

  const handleConfirmApplyLoan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const amt = Number(applyAmountInput);
      const tenure = Number(applyTenureInput);
      const rate = Number(applyInterestRate);
      const monthlyEmi = Math.round((amt * (1 + (rate / 100) * (tenure / 12))) / tenure);

      const newL: Loan = {
        id: `LOAN-${Date.now()}`,
        name: `FinEdge ${applyLoanType}`,
        accountNumber: `FL-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        type: applyLoanType.toUpperCase().includes('HOME') ? 'HOME' : applyLoanType.toUpperCase().includes('CAR') ? 'CAR' : applyLoanType.toUpperCase().includes('EDU') ? 'EDUCATION' : 'PERSONAL',
        status: 'ACTIVE',
        originalAmount: amt,
        outstandingBalance: amt,
        interestRate: rate,
        totalTenure: tenure,
        emiPaid: 0,
        nextEmiAmount: monthlyEmi,
        nextEmiDate: "10 Sep 2026",
        disbursementDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        monthlyEmi: monthlyEmi,
        interestPaidThisYear: 0,
        emiSchedule: [
          { month: "Sep 2026", dueDate: "10 Sep 2026", amount: monthlyEmi, principal: Math.round(monthlyEmi * 0.7), interest: Math.round(monthlyEmi * 0.3), status: "PENDING" }
        ]
      };

      setLoans(prev => [...prev, newL]);
      setIsSubmitting(false);
      triggerToast(`Congratulations! Your ${applyLoanType} of ₹${amt.toLocaleString('en-IN')} has been approved and disbursed.`);
      setApplyModalOpen(false);
    }, 1200);
  };

  const handleConfirmDisbursal = () => {
    setDisbursalSuccess(true);
    setTimeout(() => {
      const newL: Loan = {
        id: `LOAN-${Date.now()}`,
        name: "FinEdge Instant Express Loan",
        accountNumber: `EX-${Math.floor(1000 + Math.random() * 9000)}-9901`,
        type: 'PERSONAL',
        status: 'ACTIVE',
        originalAmount: 500000,
        outstandingBalance: 500000,
        interestRate: 10.5,
        totalTenure: 36,
        emiPaid: 0,
        nextEmiAmount: 16250,
        nextEmiDate: "15 Sep 2026",
        disbursementDate: "Today",
        monthlyEmi: 16250,
        interestPaidThisYear: 0,
        emiSchedule: [
          { month: "Sep 2026", dueDate: "15 Sep 2026", amount: 16250, principal: 11900, interest: 4350, status: "PENDING" }
        ]
      };
      setLoans(prev => [...prev, newL]);
      setDisbursalSuccess(false);
      setEligibilityModalOpen(false);
      triggerToast("₹5,00,000 pre-approved loan credited to Primary Savings ACC-001!");
    }, 1500);
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

            <LoansHeader onApplyClick={() => handleOpenApplyModal()} />
            <LoanSummaryStrip loans={loans} />

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content — Loan Cards */}
              <div className="flex-1 flex flex-col gap-6 min-w-0">
                {loans.map(loan => (
                  <LoanCard 
                    key={loan.id} 
                    loan={loan} 
                    onPayEmi={handleOpenPayEmi}
                    onPrepay={handleOpenPrepay}
                  />
                ))}
              </div>

              {/* Right Sidebar */}
              <LoansRightSidebar 
                loans={loans} 
                onCheckEligibility={() => setEligibilityModalOpen(true)}
                onApplyOffer={(title) => handleOpenApplyModal(title)}
                onOpenFullCalculator={() => setFullCalcModalOpen(true)}
              />
            </div>

            <ExploreLoanProducts onApplyClick={handleOpenApplyModal} />
          </main>
        </div>

        {/* Pay EMI Modal */}
        {payEmiModalOpen && selectedLoan && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
            <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000]">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">Pay Monthly EMI</h3>
                    <p className="text-[11px] text-on-surface-variant">{selectedLoan.name} • {selectedLoan.accountNumber}</p>
                  </div>
                </div>
                <button onClick={() => setPayEmiModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmPayEmi} className="space-y-4 text-xs">
                <div className="p-4 bg-surface rounded-xl border border-white/5 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block">EMI Amount Due</span>
                    <span className="text-2xl font-bold text-primary">₹{selectedLoan.nextEmiAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-on-surface-variant block">Due Date</span>
                    <span className="text-xs font-bold text-on-surface">{selectedLoan.nextEmiDate}</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1.5">Pay From Account</label>
                  <select 
                    value={selectedAccount}
                    onChange={e => setSelectedAccount(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono font-medium focus:outline-none focus:border-primary"
                  >
                    <option value="ACC-001">Primary Savings Account (ACC-001 • Balance: ₹6,25,430)</option>
                    <option value="ACC-002">Business Current Account (ACC-002 • Balance: ₹4,50,000)</option>
                  </select>
                </div>

                <div className="p-3 bg-surface-container-high rounded-xl border border-white/5 text-[11px] text-on-surface-variant flex items-center gap-2">
                  <ShieldCheck size={16} className="text-tertiary shrink-0" />
                  <span>Instant receipt generation and automated loan statement update.</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setPayEmiModalOpen(false)} className="flex-1 py-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] disabled:opacity-40">
                    {isSubmitting ? "Processing..." : "Confirm & Pay EMI"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loan Prepayment Modal */}
        {prepayModalOpen && selectedLoan && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
            <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <Calculator size={20} className="text-primary" />
                  <h3 className="text-base font-bold text-on-surface">Loan Prepayment</h3>
                </div>
                <button onClick={() => setPrepayModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmPrepay} className="space-y-4 text-xs">
                <div className="p-3.5 bg-surface rounded-xl border border-white/5 space-y-1">
                  <p className="text-xs font-bold text-on-surface">{selectedLoan.name}</p>
                  <p className="text-[11px] text-on-surface-variant font-mono">Current Outstanding: ₹{selectedLoan.outstandingBalance.toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1.5">Prepayment Amount (₹)</label>
                  <input 
                    type="number"
                    value={prepayAmountInput}
                    onChange={e => setPrepayAmountInput(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono font-bold text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Live Savings Calculation */}
                <div className="p-3 bg-gradient-to-r from-primary/10 via-surface to-surface rounded-xl border border-primary/20 space-y-1 font-mono">
                  <div className="flex justify-between text-on-surface text-[11px]">
                    <span>Estimated Interest Saved:</span>
                    <span className="text-green-400 font-bold">₹{Math.round(Number(prepayAmountInput || 0) * 0.24).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-on-surface text-[11px]">
                    <span>Tenure Reduction:</span>
                    <span className="text-primary font-bold">{Math.max(1, Math.round(Number(prepayAmountInput || 0) / 10000))} months earlier</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setPrepayModalOpen(false)} className="flex-1 py-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] disabled:opacity-40">
                    {isSubmitting ? "Processing..." : "Confirm Prepayment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pre-Approved Eligibility & Disbursal Modal */}
        {eligibilityModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
            <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={20} className="text-primary" />
                  <h3 className="text-base font-bold text-on-surface">Pre-Approved Offer Eligibility</h3>
                </div>
                <button onClick={() => setEligibilityModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                  <X size={18} />
                </button>
              </div>

              {disbursalSuccess ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle2 size={48} className="text-tertiary animate-bounce" />
                  <span className="text-sm font-bold text-on-surface">Loan Amount Credited!</span>
                  <p className="text-xs text-on-surface-variant">₹5,00,000 has been transferred directly into your Primary Savings ACC-001.</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-surface rounded-xl border border-primary/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant font-semibold">CIBIL Credit Score</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">785 (Excellent)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant font-semibold">Pre-Approved Credit Limit</span>
                      <span className="text-base font-bold text-primary font-mono">₹15,00,000</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-on-surface-variant">Special Interest Rate</span>
                      <span className="text-tertiary font-bold">10.5% p.a. (0 Processing Fee)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-semibold text-on-surface-variant block">Disbursal Account</label>
                    <div className="p-3 bg-surface-container-high rounded-xl border border-white/5 font-mono text-on-surface font-bold text-xs">
                      Primary Savings Account (ACC-001 •••• 8812)
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setEligibilityModalOpen(false)} className="flex-1 py-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest">Close</button>
                    <button onClick={handleConfirmDisbursal} className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center justify-center gap-1.5">
                      Instantly Disburse ₹5 Lakhs <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* End-to-End Multi-Step Loan Application Modal */}
        <FullLoanApplicationModal 
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          initialLoanType={applyLoanType}
          onApplicationSuccess={(app: LoanApplication) => {
            const newL: Loan = {
              id: `LOAN-${Date.now()}`,
              name: `FinEdge ${app.loanTypeName}`,
              accountNumber: app.referenceNumber,
              type: app.loanType as any,
              status: 'ACTIVE',
              originalAmount: app.requestedAmount,
              outstandingBalance: app.requestedAmount,
              interestRate: app.interestRate,
              totalTenure: app.tenureMonths,
              emiPaid: 0,
              nextEmiAmount: app.calculatedEmi,
              nextEmiDate: "10 Sep 2026",
              disbursementDate: "Today",
              monthlyEmi: app.calculatedEmi,
              interestPaidThisYear: 0,
              emiSchedule: [
                { month: "Sep 2026", dueDate: "10 Sep 2026", amount: app.calculatedEmi, principal: Math.round(app.calculatedEmi * 0.7), interest: Math.round(app.calculatedEmi * 0.3), status: "PENDING" }
              ]
            };
            setLoans(prev => [newL, ...prev]);
            triggerToast(`Loan Application ${app.referenceNumber} (${app.loanTypeName}) approved and added!`);
          }}
        />
        {fullCalcModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4 overflow-y-auto py-6">
            <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-[10000] my-auto">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Calculator size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">Full Loan Prepayment Calculator</h3>
                    <p className="text-[11px] text-on-surface-variant">Compare side-by-side interest savings &amp; tenure reduction</p>
                  </div>
                </div>
                <button onClick={() => setFullCalcModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1.5">Select Loan Account</label>
                  <select className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary">
                    {loans.map(l => (
                      <option key={l.id} value={l.id}>{l.name} (Outstanding: ₹{l.outstandingBalance.toLocaleString('en-IN')})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-semibold text-on-surface-variant">Extra Lump-Sum Prepayment (₹)</label>
                    <span className="text-primary font-mono font-bold text-sm">₹{calcPrepayAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <input 
                    type="range"
                    min={10000}
                    max={500000}
                    step={5000}
                    value={calcPrepayAmount}
                    onChange={e => setCalcPrepayAmount(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer h-2 bg-surface-container-highest rounded-lg"
                  />
                </div>

                {/* Before vs After Comparison Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-surface rounded-xl border border-white/5 font-mono">
                  <div className="space-y-1 pb-2 border-b border-white/5 col-span-2 flex justify-between text-[11px] font-sans">
                    <span className="font-bold text-on-surface">Repayment Comparison</span>
                    <span className="text-tertiary font-bold">Smart Prepayment</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Without Prepayment</span>
                    <p className="text-xs text-on-surface">Interest: <strong className="text-on-surface font-bold">₹12,45,000</strong></p>
                    <p className="text-xs text-on-surface">Tenure: <strong className="text-on-surface font-bold">192 Months</strong></p>
                  </div>

                  <div className="space-y-1 border-l border-white/10 pl-3">
                    <span className="text-[10px] text-primary uppercase tracking-wider block">With ₹{calcPrepayAmount.toLocaleString('en-IN')} Prepayment</span>
                    <p className="text-xs text-green-400">Interest: <strong className="font-bold">₹11,92,618</strong></p>
                    <p className="text-xs text-primary">Tenure: <strong className="font-bold">{192 - Math.max(1, Math.round(calcPrepayAmount / 15000))} Months</strong></p>
                  </div>
                </div>

                {/* Savings Highlight */}
                <div className="p-3.5 bg-gradient-to-r from-primary/10 via-surface to-surface rounded-xl border border-primary/30 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Total Net Interest Saved</span>
                    <span className="text-lg font-bold text-green-400">₹{Math.round(calcPrepayAmount * 0.2468).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-on-surface-variant block">Loan Debt Free</span>
                    <span className="text-xs font-bold text-primary font-sans">{Math.max(1, Math.round(calcPrepayAmount / 15000))} Months Earlier</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setFullCalcModalOpen(false)} className="flex-1 py-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest">Close</button>
                  <button 
                    type="button" 
                    onClick={() => {
                      triggerToast(`Prepayment request of ₹${calcPrepayAmount.toLocaleString('en-IN')} submitted!`);
                      setFullCalcModalOpen(false);
                    }}
                    className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]"
                  >
                    Execute Prepayment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AccountProvider>
  );
}

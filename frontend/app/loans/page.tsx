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
import { CheckCircle2 } from 'lucide-react';
import FullLoanApplicationModal from '../../components/modals/FullLoanApplicationModal';
import { PayEmiModal, PrepayModal, EligibilityModal, FullCalcModal } from '../../components/loans/LoanModals';

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
      const prepayVal = Number(prepayAmountInput);
      setLoans(prev => prev.map(l => {
        if (l.id === selectedLoan.id) {
          const newBalance = Math.max(0, l.outstandingBalance - prepayVal);
          return {
            ...l,
            outstandingBalance: newBalance,
            totalTenure: Math.max(1, l.totalTenure - Math.round(prepayVal / 10000))
          };
        }
        return l;
      }));

      setIsSubmitting(false);
      triggerToast(`Part-prepayment of ₹${prepayVal.toLocaleString('en-IN')} for ${selectedLoan.name} received!`);
      setPrepayModalOpen(false);
    }, 1000);
  };

  const handleOpenApplyModal = (loanType: string = "Personal Loan") => {
    setApplyLoanType(loanType);
    setApplyModalOpen(true);
  };

  const handleConfirmDisbursal = () => {
    setDisbursalSuccess(true);
    setTimeout(() => {
      setDisbursalSuccess(false);
      setEligibilityModalOpen(false);
      triggerToast("₹5,00,000 instant pre-approved personal loan disbursed to ACC-001!");
      const newInstantLoan: Loan = {
        id: `LOAN-${Date.now()}`,
        name: "Pre-Approved Instant Personal Loan",
        accountNumber: `LN-INST-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'PERSONAL',
        status: 'ACTIVE',
        originalAmount: 500000,
        outstandingBalance: 500000,
        interestRate: 10.5,
        totalTenure: 36,
        emiPaid: 0,
        nextEmiAmount: 16250,
        nextEmiDate: "05 Sep 2026",
        disbursementDate: "Today",
        monthlyEmi: 16250,
        interestPaidThisYear: 0,
        emiSchedule: [
          { month: "Sep 2026", dueDate: "05 Sep 2026", amount: 16250, principal: 11875, interest: 4375, status: "PENDING" }
        ]
      };
      setLoans(prev => [newInstantLoan, ...prev]);
    }, 2000);
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

            <LoansHeader onApplyClick={() => handleOpenApplyModal()} />
            <LoanSummaryStrip loans={loans} />

            <div className="flex flex-col lg:flex-row gap-8">
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

        <PayEmiModal
          isOpen={payEmiModalOpen}
          onClose={() => setPayEmiModalOpen(false)}
          selectedLoan={selectedLoan}
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmPayEmi}
        />

        <PrepayModal
          isOpen={prepayModalOpen}
          onClose={() => setPrepayModalOpen(false)}
          selectedLoan={selectedLoan}
          prepayAmountInput={prepayAmountInput}
          setPrepayAmountInput={setPrepayAmountInput}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmPrepay}
        />

        <EligibilityModal
          isOpen={eligibilityModalOpen}
          onClose={() => setEligibilityModalOpen(false)}
          disbursalSuccess={disbursalSuccess}
          onDisburse={handleConfirmDisbursal}
        />

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

        <FullCalcModal
          isOpen={fullCalcModalOpen}
          onClose={() => setFullCalcModalOpen(false)}
          loans={loans}
          calcPrepayAmount={calcPrepayAmount}
          setCalcPrepayAmount={setCalcPrepayAmount}
          onExecute={() => {
            triggerToast(`Prepayment request of ₹${calcPrepayAmount.toLocaleString('en-IN')} submitted!`);
            setFullCalcModalOpen(false);
          }}
        />
      </div>
    </AccountProvider>
  );
}

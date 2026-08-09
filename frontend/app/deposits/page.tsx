"use client";

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DepositsHeader from '../../components/deposits/DepositsHeader';
import DepositSummary from '../../components/deposits/DepositSummary';
import ActiveDepositsList from '../../components/deposits/ActiveDepositsList';
import InterestRatesCard from '../../components/deposits/InterestRatesCard';
import { AccountProvider } from '../../context/AccountContext';
import OpenDepositModal from '../../components/modals/OpenDepositModal';
import DepositDetailsModal from '../../components/modals/DepositDetailsModal';
import BreakFdModal from '../../components/modals/BreakFdModal';
import PayRdInstallmentModal from '../../components/modals/PayRdInstallmentModal';
import DepositCalculatorModal from '../../components/modals/DepositCalculatorModal';
import { Deposit } from '../../types';
import { MockApi } from '../../lib/mockApi';

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [openDepositModalOpen, setOpenDepositModalOpen] = useState(false);
  const [initialDepositType, setInitialDepositType] = useState<"FD" | "RD">("FD");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [breakFdModalOpen, setBreakFdModalOpen] = useState(false);
  const [payRdModalOpen, setPayRdModalOpen] = useState(false);
  const [calculatorModalOpen, setCalculatorModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchDeposits = async () => {
    try {
      const data = await MockApi.getDeposits();
      setDeposits([...data]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
        <Sidebar />
        <div className="flex-1 lg:ml-[230px] flex flex-col min-h-screen transition-all duration-300">
          <Header />
          
          <main className="flex-1 p-4 md:p-8 mt-[72px] overflow-y-auto max-w-[1400px] mx-auto w-full relative">
            
            {/* Toast Banner */}
            {toastMessage && (
              <div className="fixed top-20 right-8 z-[10000] bg-primary text-on-primary font-bold px-4 py-3 rounded-xl shadow-2xl animate-bounce text-xs flex items-center gap-2">
                <span>{toastMessage}</span>
              </div>
            )}

            <DepositsHeader 
              onOpenNewDeposit={() => {
                setInitialDepositType('FD');
                setOpenDepositModalOpen(true);
              }}
            />
            
            <div className="mb-8">
              <DepositSummary 
                deposits={deposits}
                onViewDetails={(type) => {
                  const match = deposits.find(d => d.type === type);
                  if (match) {
                    setSelectedDeposit(match);
                    setDetailsModalOpen(true);
                  } else {
                    setInitialDepositType(type);
                    setOpenDepositModalOpen(true);
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative mb-8">
              
              {/* Left Column (approx 70% on desktop -> 8 cols) */}
              <div className="col-span-1 xl:col-span-8 flex flex-col gap-8">
                <ActiveDepositsList 
                  deposits={deposits}
                  onViewDetails={(dep) => {
                    setSelectedDeposit(dep);
                    setDetailsModalOpen(true);
                  }}
                  onBreakFd={(dep) => {
                    setSelectedDeposit(dep);
                    setBreakFdModalOpen(true);
                  }}
                  onPayInstallment={(dep) => {
                    setSelectedDeposit(dep);
                    setPayRdModalOpen(true);
                  }}
                />
              </div>

              {/* Right Column (approx 30% on desktop -> 4 cols) */}
              <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
                <InterestRatesCard 
                  onCalculateReturns={() => setCalculatorModalOpen(true)}
                />
                
                {/* Promo / Tip */}
                <div className="bg-gradient-to-br from-surface-container-highest to-surface-container border border-primary/20 rounded-xl p-6 relative overflow-hidden shadow-lg group hover:border-primary/50 transition-all">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-[30px] group-hover:bg-primary/20 transition-colors pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col gap-3">
                    <h4 className="text-lg font-semibold m-0 text-on-surface">Auto-Renewal Tip</h4>
                    <p className="text-sm text-on-surface-variant m-0">Opt for auto-renewal on your Fixed Deposits to continue earning uninterrupted interest and benefit from compound growth over time.</p>
                  </div>
                </div>
              </div>
              
            </div>
          </main>
        </div>

        {/* MODALS */}
        <OpenDepositModal 
          isOpen={openDepositModalOpen}
          onClose={() => setOpenDepositModalOpen(false)}
          initialType={initialDepositType}
          onDepositOpened={async ({ deposit, newBalance }) => {
            await fetchDeposits();
            triggerToast(`New ${deposit.type} opened! ACC-001 balance updated to ₹${newBalance.toLocaleString('en-IN')}`);
          }}
        />

        <DepositDetailsModal 
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          deposit={selectedDeposit}
        />

        <BreakFdModal 
          isOpen={breakFdModalOpen}
          onClose={() => setBreakFdModalOpen(false)}
          deposit={selectedDeposit}
          onFdBroken={async ({ refundAmount, newBalance }) => {
            await fetchDeposits();
            triggerToast(`FD Liquidated! ₹${refundAmount.toLocaleString('en-IN')} credited to ACC-001 (New balance: ₹${newBalance.toLocaleString('en-IN')})`);
          }}
        />

        <PayRdInstallmentModal 
          isOpen={payRdModalOpen}
          onClose={() => setPayRdModalOpen(false)}
          deposit={selectedDeposit}
          onInstallmentPaid={async ({ updatedRd, newBalance }) => {
            await fetchDeposits();
            triggerToast(`RD Installment paid! ACC-001 balance updated to ₹${newBalance.toLocaleString('en-IN')}`);
          }}
        />

        <DepositCalculatorModal 
          isOpen={calculatorModalOpen}
          onClose={() => setCalculatorModalOpen(false)}
          onOpenDeposit={() => {
            setInitialDepositType('FD');
            setOpenDepositModalOpen(true);
          }}
        />

      </div>
  );
}

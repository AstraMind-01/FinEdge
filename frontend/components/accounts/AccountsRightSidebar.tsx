"use client";

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useAccounts } from '../../context/AccountContext';
import { ChevronRight, CreditCard, Shield, User, ArrowRight } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import PortfolioBreakdownModal from '../modals/PortfolioBreakdownModal';
import UpdateNomineeModal from '../modals/UpdateNomineeModal';
import ManageCardsModal from '../modals/ManageCardsModal';
import FixedDepositsModal from '../modals/FixedDepositsModal';
import { Account } from '../../types';

export default function AccountsRightSidebar() {
  const { accounts, isLoading, totalBalance, selectAccount, createFixedDeposit } = useAccounts();

  const [activeModal, setActiveModal] = useState<"portfolio" | "nominee" | "cards" | "fd" | null>(null);
  const [targetAccount, setTargetAccount] = useState<Account | null>(null);

  const handleUpdateNominee = (accountId: string, nomineeName: string, relation: string) => {
    const acc = accounts.find(a => a.id === accountId);
    if (acc) {
      acc.nominee = nomineeName;
      acc.nomineeRelation = relation;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full lg:w-[320px] xl:w-[380px] shrink-0">
        <Skeleton className="h-[200px] rounded-xl" />
        <Skeleton className="h-[200px] rounded-xl" />
        <Skeleton className="h-[150px] rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 w-full lg:w-[320px] xl:w-[380px] shrink-0">
        {/* Account Insights */}
        <Card 
          onClick={() => setActiveModal("portfolio")}
          className="p-5 flex flex-col gap-4 cursor-pointer hover:border-primary/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-title-md font-semibold text-on-surface">Account Insights</h3>
            <button className="text-primary hover:text-primary-fixed transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {accounts.map(account => {
              const percentage = totalBalance > 0 ? (account.balance / totalBalance) * 100 : 0;
              return (
                <div key={account.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-on-surface-variant truncate w-[150px]">{account.name}</span>
                    <span className="text-on-surface font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        account.type === 'SAVINGS' ? 'bg-tertiary' : 
                        account.type === 'CURRENT' ? 'bg-secondary' : 
                        account.type === 'FIXED_DEPOSIT' ? 'bg-primary-fixed' : 'bg-tertiary-fixed'
                      }`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Nominee Summary */}
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              <h3 className="font-title-md font-semibold text-on-surface">Nominee Summary</h3>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {accounts.map(account => (
              <div key={account.id} className="flex items-center justify-between bg-surface p-3 rounded-lg border border-outline-variant/10">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] text-on-surface-variant uppercase tracking-wider font-medium">{account.type.replace('_', ' ')}</span>
                  <div className="flex items-center gap-1.5 text-[13px] text-on-surface">
                    <User size={12} className="text-on-surface-variant" />
                    <span className="font-medium">{account.nominee || 'Priya Ranjan'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setTargetAccount(account);
                    setActiveModal("nominee");
                  }}
                  className="text-[11px] text-primary hover:underline underline-offset-2 font-medium"
                >
                  Update
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Linked Cards */}
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-primary" />
              <h3 className="font-title-md font-semibold text-on-surface">Linked Cards</h3>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {accounts.filter(a => a.linkedCard).map(account => {
              const cardInfo = account.linkedCard?.split(' ') || [];
              const last4 = cardInfo[cardInfo.length - 1];
              const network = cardInfo[0];
              return (
                <div 
                  key={account.id} 
                  onClick={() => {
                    selectAccount(account.id);
                    setActiveModal("cards");
                  }}
                  className="flex items-center justify-between bg-surface p-3 rounded-lg border border-outline-variant/10 cursor-pointer hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-6 bg-surface-container-high rounded flex items-center justify-center shrink-0 border border-outline-variant/20">
                      <span className="text-[9px] font-bold text-on-surface italic">{network}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] text-on-surface font-medium">{account.name}</span>
                      <span className="text-[11px] text-on-surface-variant font-mono tracking-widest">{last4}</span>
                    </div>
                  </div>
                  <button className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Promo Card */}
        <Card className="p-5 flex flex-col items-center text-center gap-3 bg-gradient-to-br from-surface-container-high to-surface border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500"></div>
          <h3 className="font-title-md font-semibold text-on-surface relative z-10">Looking to save more?</h3>
          <p className="text-[12px] text-on-surface-variant relative z-10">Discover our high-yield Fixed Deposits and start growing your wealth today.</p>
          <Button 
            onClick={() => setActiveModal("fd")}
            className="w-full mt-2 bg-primary text-on-primary hover:shadow-[0_0_10px_rgba(240,180,41,0.3)] transition-shadow relative z-10 font-medium"
          >
            Explore Account Types <ArrowRight size={16} className="ml-1.5" />
          </Button>
        </Card>
      </div>

      {/* Modals */}
      <PortfolioBreakdownModal
        accounts={accounts}
        totalBalance={totalBalance}
        isOpen={activeModal === "portfolio"}
        onClose={() => setActiveModal(null)}
      />

      <UpdateNomineeModal
        account={targetAccount}
        isOpen={activeModal === "nominee"}
        onClose={() => setActiveModal(null)}
        onUpdateNominee={handleUpdateNominee}
      />

      <ManageCardsModal
        accounts={accounts}
        isOpen={activeModal === "cards"}
        onClose={() => setActiveModal(null)}
      />

      <FixedDepositsModal
        accounts={accounts}
        isOpen={activeModal === "fd"}
        onClose={() => setActiveModal(null)}
        onCreateFd={createFixedDeposit}
      />
    </>
  );
}

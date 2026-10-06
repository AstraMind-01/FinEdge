"use client";

import React, { useState, useEffect } from 'react';
import { Landmark, Briefcase, Lock, PiggyBank, ChevronDown, ChevronUp, Eye, EyeOff, FileText, ArrowLeftRight, CreditCard, Calendar, User, Percent, AlertCircle, Settings, Snowflake } from 'lucide-react';
import { useAccounts } from '../../context/AccountContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import AccountDetailsModal from '../modals/AccountDetailsModal';
import QuickTransferModal from '../modals/QuickTransferModal';
import AccountLimitsModal from '../modals/AccountLimitsModal';
import AccountStatementsModal from '../modals/AccountStatementsModal';
import FreezeAccountModal from '../modals/FreezeAccountModal';
import { Account } from '../../types';

export default function AccountList() {
  const { 
    accounts, 
    isLoading, 
    verificationStates, 
    requestVerification, 
    isAccountVerified,
    hideBalance, 
    selectAccount,
    executeTransfer,
    updateAccountLimits,
    toggleAccountFreeze,
    transactions
  } = useAccounts();

  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  const [targetAccount, setTargetAccount] = useState<Account | null>(null);
  const [activeModal, setActiveModal] = useState<"details" | "transfer" | "limits" | "statements" | "freeze" | null>(null);
  const [pendingDetailsAccId, setPendingDetailsAccId] = useState<string | null>(null);

  useEffect(() => {
    if (pendingDetailsAccId && isAccountVerified(pendingDetailsAccId)) {
      const acc = accounts.find(a => a.id === pendingDetailsAccId);
      if (acc) {
        setTargetAccount(acc);
        setActiveModal("details");
      }
      setPendingDetailsAccId(null);
    }
  }, [verificationStates, pendingDetailsAccId, isAccountVerified, accounts]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCards(prev => prev.includes(id) ? prev.filter(cardId => cardId !== id) : [...prev, id]);
  };

  const getIcon = (type: string) => {
    if (type === 'SAVINGS') return <Landmark className="text-tertiary bg-tertiary/10 p-2 rounded-xl shrink-0 w-[44px] h-[44px]" />;
    if (type === 'CURRENT') return <Briefcase className="text-secondary bg-secondary/10 p-2 rounded-xl shrink-0 w-[44px] h-[44px]" />;
    if (type === 'FIXED_DEPOSIT') return <Lock className="text-primary-fixed bg-primary-fixed/10 p-2 rounded-xl shrink-0 w-[44px] h-[44px]" />;
    if (type === 'RECURRING_DEPOSIT') return <PiggyBank className="text-tertiary-fixed bg-tertiary-fixed/10 p-2 rounded-xl shrink-0 w-[44px] h-[44px]" />;
    return <Landmark />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  const openAction = (acc: Account, modal: "details" | "transfer" | "limits" | "statements" | "freeze", e: React.MouseEvent) => {
    e.stopPropagation();
    selectAccount(acc.id);
    setTargetAccount(acc);
    if (modal === "details") {
      if (!isAccountVerified(acc.id)) {
        setPendingDetailsAccId(acc.id);
        requestVerification(acc.id);
        return;
      }
    }
    setActiveModal(modal);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <Skeleton className="h-[140px] rounded-xl" />
        <Skeleton className="h-[140px] rounded-xl" />
        <Skeleton className="h-[140px] rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        {accounts.map((account) => {
          const vState = verificationStates[account.id] || "NOT_VERIFIED";
          const isVerified = vState === "VERIFIED";
          const isExpanded = expandedCards.includes(account.id);

          return (
            <Card key={account.id} className="p-0 overflow-hidden flex flex-col bg-surface-container border border-outline-variant/10 shadow-sm transition-all">
              <div 
                className="p-5 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center cursor-pointer hover:bg-surface-container-high transition-colors"
                onClick={(e) => toggleExpand(account.id, e)}
              >
                <div className="flex items-center gap-4 min-w-[280px]">
                  {getIcon(account.type)}
                  <div className="flex flex-col gap-1">
                    <span className="font-title-md text-[16px] font-semibold text-on-surface truncate">{account.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] text-on-surface-variant tracking-widest">{account.maskedNumber}</span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant/40"></span>
                      <div className="flex items-center gap-1.5">
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${account.status === 'ACTIVE' ? 'bg-tertiary' : 'bg-error'}`}></span>
                        <span className="text-[11px] text-on-surface-variant capitalize">{account.status.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 w-full xl:w-auto xl:items-center">
                  <div className="flex items-center gap-3">
                    {isVerified ? (
                      <span className="font-display-lg text-[22px] text-on-surface font-bold tracking-tight">
                        {formatCurrency(account.balance)}
                      </span>
                    ) : (
                      <span className="font-display-lg text-[22px] text-on-surface-variant font-bold tracking-widest opacity-50">
                        ••••••••
                      </span>
                    )}
                    {isVerified ? (
                      <button className="text-on-surface-variant hover:text-on-surface transition-colors" onClick={(e) => { e.stopPropagation(); hideBalance(account.id); }}>
                        <EyeOff size={18} />
                      </button>
                    ) : (
                      <button className="text-primary hover:text-primary-fixed transition-colors" onClick={(e) => { e.stopPropagation(); requestVerification(account.id); selectAccount(account.id); }}>
                        <Eye size={18} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                    {account.ifsc && <span>IFSC: {account.ifsc}</span>}
                    {account.branch && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-outline-variant/40"></span>
                        <span className="truncate max-w-[180px]">{account.branch}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full xl:w-auto gap-4 mt-2 xl:mt-0">
                  <div className="flex items-center gap-2">
                    <Button 
                      className="h-8 text-[12px] px-3 bg-surface border border-outline-variant/20 hover:bg-surface-high text-on-surface" 
                      onClick={(e) => openAction(account, "details", e)}
                    >
                      <Eye size={14} className="mr-1.5" /> Details
                    </Button>
                    <Button 
                      className="h-8 text-[12px] px-3 bg-surface border border-outline-variant/20 hover:bg-surface-high text-on-surface" 
                      onClick={(e) => openAction(account, "statements", e)}
                    >
                      <FileText size={14} className="mr-1.5" /> Statement
                    </Button>
                    <Button 
                      className="h-8 text-[12px] px-3 bg-primary text-on-primary hover:shadow-[0_0_10px_rgba(240,180,41,0.3)] transition-shadow disabled:opacity-50" 
                      disabled={account.status !== 'ACTIVE'}
                      onClick={(e) => openAction(account, "transfer", e)}
                    >
                      <ArrowLeftRight size={14} className="mr-1.5" /> Transfer
                    </Button>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface text-on-surface-variant transition-colors shrink-0">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Accordion Drawer */}
              <div className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[350px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 border-t border-outline-variant/10 bg-surface-container-low flex flex-col gap-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    {account.openingDate && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] uppercase tracking-wider">
                          <Calendar size={14} /> Opening Date
                        </div>
                        <span className="text-[13px] text-on-surface font-medium">{account.openingDate}</span>
                      </div>
                    )}
                    {account.nominee && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] uppercase tracking-wider">
                          <User size={14} /> Nominee
                        </div>
                        <span className="text-[13px] text-on-surface font-medium">{account.nominee} <span className="text-on-surface-variant text-[11px]">({account.nomineeRelation})</span></span>
                      </div>
                    )}
                    {account.linkedCard && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] uppercase tracking-wider">
                          <CreditCard size={14} /> Linked Card
                        </div>
                        <span className="text-[13px] text-on-surface font-medium">{account.linkedCard}</span>
                      </div>
                    )}
                    {account.interestRate && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] uppercase tracking-wider">
                          <Percent size={14} /> Interest Rate
                        </div>
                        <span className="text-[13px] text-on-surface font-medium">{account.interestRate}% p.a.</span>
                      </div>
                    )}
                    {account.minBalance && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] uppercase tracking-wider">
                          <AlertCircle size={14} /> Min. Balance
                        </div>
                        <span className="text-[13px] text-on-surface font-medium">{formatCurrency(account.minBalance)}</span>
                      </div>
                    )}
                    {account.maturityDate && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] uppercase tracking-wider">
                          <Calendar size={14} /> Maturity Date
                        </div>
                        <span className="text-[13px] text-on-surface font-medium">{account.maturityDate}</span>
                      </div>
                    )}
                    {account.monthlyInstallment && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] uppercase tracking-wider">
                          <ArrowLeftRight size={14} /> Monthly Installment
                        </div>
                        <span className="text-[13px] text-on-surface font-medium">{formatCurrency(account.monthlyInstallment)}</span>
                      </div>
                    )}
                  </div>

                  {/* Drawer Quick Controls */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/10">
                    <Button 
                      className="h-8 text-[12px] px-3 bg-surface-high hover:bg-surface-highest text-on-surface"
                      onClick={(e) => openAction(account, "limits", e)}
                    >
                      <Settings size={14} className="mr-1.5" /> Manage Limits
                    </Button>
                    <Button 
                      className={`h-8 text-[12px] px-3 ${account.status === 'FROZEN' ? 'bg-error/20 text-error hover:bg-error/30' : 'bg-surface-high text-on-surface hover:bg-surface-highest'}`}
                      onClick={(e) => openAction(account, "freeze", e)}
                    >
                      <Snowflake size={14} className="mr-1.5" /> {account.status === 'FROZEN' ? 'Unfreeze Account' : 'Freeze Account'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modals */}
      {targetAccount && (
        <>
          <AccountDetailsModal
            account={targetAccount}
            isOpen={activeModal === "details"}
            onClose={() => setActiveModal(null)}
            isVerified={verificationStates[targetAccount.id] === "VERIFIED"}
          />

          <QuickTransferModal
            fromAccount={targetAccount}
            accounts={accounts}
            isOpen={activeModal === "transfer"}
            onClose={() => setActiveModal(null)}
            onTransfer={executeTransfer}
          />

          <AccountLimitsModal
            account={targetAccount}
            isOpen={activeModal === "limits"}
            onClose={() => setActiveModal(null)}
            onSaveLimits={updateAccountLimits}
          />

          <AccountStatementsModal
            account={targetAccount}
            transactions={transactions}
            isOpen={activeModal === "statements"}
            onClose={() => setActiveModal(null)}
          />

          <FreezeAccountModal
            account={targetAccount}
            isOpen={activeModal === "freeze"}
            onClose={() => setActiveModal(null)}
            onToggleFreeze={toggleAccountFreeze}
          />
        </>
      )}
    </>
  );
}

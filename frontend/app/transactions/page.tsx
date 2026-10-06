"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import TransactionsHeader from '../../components/transactions/TransactionsHeader';
import TransactionsFilterBar, { TransactionFilters } from '../../components/transactions/TransactionsFilterBar';
import TransactionsSummaryStrip from '../../components/transactions/TransactionsSummaryStrip';
import TransactionsList from '../../components/transactions/TransactionsList';
import TransactionsRightSidebar from '../../components/transactions/TransactionsRightSidebar';
import { AccountProvider, useAccounts } from '../../context/AccountContext';
import AccountStatementsModal from '../../components/modals/AccountStatementsModal';
import { AccountStatementBuilder } from '../../lib/pdf/documents/AccountStatement';
import { Account } from '../../types';

function TransactionsContent() {
  const { accounts, transactions, userProfile } = useAccounts();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [filters, setFilters] = useState<TransactionFilters>({
    searchQuery: "",
    accountId: "all",
    dateRange: "any",
    type: "all",
    category: "all",
    quickFilter: null
  });

  const handleFilterChange = (updated: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...updated }));
  };

  const handleInstantPdfDownload = () => {
    const selectedAccount: Account = accounts.find(a => a.id === filters.accountId) || accounts[0] || {
      id: 'ALL',
      type: 'SAVINGS',
      name: 'All Accounts',
      accountNumber: 'N/A',
      maskedNumber: 'N/A',
      lastFour: 'N/A',
      balance: 0,
      currency: 'INR',
      status: 'ACTIVE',
      accountHolder: userProfile.name
    };

    AccountStatementBuilder.generate(
      selectedAccount,
      userProfile.name,
      transactions,
      "Complete Transaction History"
    );
  };

  const activeAccountForModal = accounts.find(a => a.id === filters.accountId) || accounts[0] || null;

  return (
    <div className="flex-1 flex flex-col lg:pl-[230px] w-full min-h-screen">
      <Header />
      <main className="flex-1 mt-[72px] flex flex-col w-full max-w-[1600px] mx-auto p-6 lg:p-8 gap-6 overflow-x-hidden">
        <TransactionsHeader 
          onExportStatement={() => setIsExportModalOpen(true)}
          onDownloadPdf={handleInstantPdfDownload}
        />
        
        <TransactionsFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          accounts={accounts}
        />

        <TransactionsSummaryStrip />
        
        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
          <div className="flex-1 flex flex-col w-full">
            <TransactionsList filters={filters} accounts={accounts} />
          </div>
          <TransactionsRightSidebar 
            onFilterByMerchant={(name) => handleFilterChange({ searchQuery: name })} 
          />
        </div>
      </main>

      <AccountStatementsModal
        account={activeAccountForModal}
        transactions={transactions}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <AccountProvider>
      <div className="bg-background font-body-md text-on-surface min-h-screen flex">
        <Sidebar />
        <TransactionsContent />
      </div>
    </AccountProvider>
  );
}

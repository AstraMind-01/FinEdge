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

function TransactionsContent() {
  const { accounts } = useAccounts();

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

  return (
    <div className="flex-1 flex flex-col lg:pl-[230px] w-full min-h-screen">
      <Header />
      <main className="flex-1 mt-[72px] flex flex-col w-full max-w-[1600px] mx-auto p-6 lg:p-8 gap-6 overflow-x-hidden">
        <TransactionsHeader />
        
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

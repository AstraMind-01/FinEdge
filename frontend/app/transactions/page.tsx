"use client";
import React from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import TransactionsHeader from '../../components/transactions/TransactionsHeader';
import TransactionsFilterBar from '../../components/transactions/TransactionsFilterBar';
import TransactionsSummaryStrip from '../../components/transactions/TransactionsSummaryStrip';
import TransactionsList from '../../components/transactions/TransactionsList';
import TransactionsRightSidebar from '../../components/transactions/TransactionsRightSidebar';
import { AccountProvider } from '../../context/AccountContext';

function TransactionsContent() {
  return (
    <div className="flex-1 flex flex-col lg:pl-[230px] w-full min-h-screen">
      <Header />
      <main className="flex-1 mt-[72px] flex flex-col w-full max-w-[1600px] mx-auto p-6 lg:p-8 gap-6 overflow-x-hidden">
        <TransactionsHeader />
        <TransactionsFilterBar />
        <TransactionsSummaryStrip />
        
        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
          <div className="flex-1 flex flex-col w-full">
            <TransactionsList />
          </div>
          <TransactionsRightSidebar />
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

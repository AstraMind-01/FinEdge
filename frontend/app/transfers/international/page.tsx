"use client";
import React from 'react';
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';
import IntlTransferWizard from '../../../components/transfers/international/IntlTransferWizard';
import { AccountProvider } from '../../../context/AccountContext';

export default function InternationalTransferPage() {
  return (
    <AccountProvider>
      <div className="bg-background font-body-md text-on-surface min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:pl-[230px] w-full min-h-screen">
          <Header />
          <main className="flex-1 mt-[72px] flex flex-col w-full max-w-[1600px] mx-auto p-6 lg:p-8 gap-6 overflow-x-hidden">
            <IntlTransferWizard />
          </main>
        </div>
      </div>
    </AccountProvider>
  );
}

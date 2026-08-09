"use client";
import React from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import TransfersHeader from '../../components/transfers/TransfersHeader';
import TransfersForm from '../../components/transfers/TransfersForm';
import TransfersRightSidebar from '../../components/transfers/TransfersRightSidebar';
import AddBeneficiaryPromo from '../../components/transfers/AddBeneficiaryPromo';

function TransfersContent() {
  return (
    <div className="flex-1 flex flex-col lg:pl-[230px] w-full min-h-screen">
      <Header />
      <main className="flex-1 mt-[72px] flex flex-col w-full max-w-[1600px] mx-auto p-6 lg:p-8 gap-6 overflow-x-hidden">
        <TransfersHeader />
        
        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
          <div className="flex-1 flex flex-col w-full">
            <TransfersForm />
          </div>
          <TransfersRightSidebar />
        </div>

        <AddBeneficiaryPromo />
      </main>
    </div>
  );
}

export default function TransfersPage() {
  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen flex">
      <Sidebar />
      <TransfersContent />
    </div>
  );
}

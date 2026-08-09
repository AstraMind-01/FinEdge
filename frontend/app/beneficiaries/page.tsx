import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import BeneficiariesHeader from '../../components/beneficiaries/BeneficiariesHeader';
import BeneficiaryGrid from '../../components/beneficiaries/BeneficiaryGrid';
import RecentTransfers from '../../components/beneficiaries/RecentTransfers';

export default function BeneficiariesPage() {
  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <div className="flex-1 lg:ml-[230px] flex flex-col min-h-screen transition-all duration-300">
        <Header />
        
        <main className="flex-1 p-4 md:p-8 mt-[72px] overflow-y-auto max-w-[1400px] mx-auto w-full">
          <BeneficiariesHeader />

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative mt-4 mb-6">
            
            {/* Left Column (approx 70% on desktop -> 8 cols) */}
            <div className="col-span-1 xl:col-span-8 flex flex-col gap-6">
              <BeneficiaryGrid />
            </div>

            {/* Right Column (approx 30% on desktop -> 4 cols) */}
            <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
              <RecentTransfers />
              
              {/* Quick Actions / Tips */}
              <div className="bg-gradient-to-br from-surface-container-highest to-surface-container border border-primary/20 rounded-xl p-6 relative overflow-hidden shadow-lg">
                <div className="relative z-10 flex flex-col gap-3">
                  <h4 className="text-lg font-semibold m-0 text-primary">Safe Transfers</h4>
                  <p className="text-sm text-on-surface-variant m-0">Always verify the account details before adding a new beneficiary. New beneficiaries have a cooling period of 30 minutes before you can transfer funds.</p>
                </div>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}

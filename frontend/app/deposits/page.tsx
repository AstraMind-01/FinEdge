import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DepositsHeader from '../../components/deposits/DepositsHeader';
import DepositSummary from '../../components/deposits/DepositSummary';
import ActiveDepositsList from '../../components/deposits/ActiveDepositsList';
import InterestRatesCard from '../../components/deposits/InterestRatesCard';

export default function DepositsPage() {
  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <div className="flex-1 lg:ml-[230px] flex flex-col min-h-screen transition-all duration-300">
        <Header />
        
        <main className="flex-1 p-4 md:p-8 mt-[72px] overflow-y-auto max-w-[1400px] mx-auto w-full">
          <DepositsHeader />
          
          <div className="mb-8">
            <DepositSummary />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative mb-8">
            
            {/* Left Column (approx 70% on desktop -> 8 cols) */}
            <div className="col-span-1 xl:col-span-8 flex flex-col gap-8">
              <ActiveDepositsList />
            </div>

            {/* Right Column (approx 30% on desktop -> 4 cols) */}
            <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
              <InterestRatesCard />
              
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
    </div>
  );
}

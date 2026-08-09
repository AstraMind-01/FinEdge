import React from 'react';
import { Percent, ArrowRight } from 'lucide-react';

interface InterestRatesCardProps {
  onCalculateReturns?: () => void;
}

export default function InterestRatesCard({ onCalculateReturns }: InterestRatesCardProps) {
  const rates = [
    { tenure: "7 - 45 Days", rate: "4.50%" },
    { tenure: "46 - 90 Days", rate: "5.25%" },
    { tenure: "91 - 180 Days", rate: "5.75%" },
    { tenure: "181 - 364 Days", rate: "6.50%" },
    { tenure: "1 Year - 2 Years", rate: "7.10%" },
    { tenure: "2 Years - 3 Years", rate: "7.50%" },
    { tenure: "3 Years and above", rate: "7.00%" },
  ];

  return (
    <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold m-0 flex items-center gap-2">
          <Percent className="w-5 h-5 text-primary" />
          Interest Rates
        </h3>
        <span className="text-xs font-medium text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded">p.a.</span>
      </div>

      <div className="flex flex-col">
        {rates.map((rate, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-surface-container-highest last:border-0 hover:bg-surface-container-highest -mx-3 px-3 rounded-lg transition-colors cursor-pointer group">
            <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">{rate.tenure}</span>
            <span className="font-mono text-sm font-bold text-primary">{rate.rate}</span>
          </div>
        ))}
      </div>

      <button 
        type="button"
        onClick={onCalculateReturns}
        className="w-full mt-6 flex items-center justify-center gap-2 text-primary font-semibold text-sm hover:text-primary-fixed transition-colors"
      >
        Calculate Returns
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

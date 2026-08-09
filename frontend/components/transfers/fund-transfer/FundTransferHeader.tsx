import React from 'react';

interface FundTransferHeaderProps {
  currentStep: number;
}

export default function FundTransferHeader({ currentStep }: FundTransferHeaderProps) {
  const steps = [
    "1. Select Recipient",
    "2. Enter Amount",
    "3. Review",
    "4. Confirmation"
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-medium text-on-surface-variant flex items-center gap-2">
          <span className="hover:text-on-surface cursor-pointer transition-colors">Transfers</span>
          <span className="text-on-surface-variant/50">&gt;</span>
          <span className="text-primary cursor-pointer hover:text-primary-fixed transition-colors">Fund Transfer</span>
        </span>
        <h1 className="font-headline-lg text-[24px] lg:text-[28px] font-bold text-on-surface leading-tight">Fund Transfer</h1>
        <p className="text-[13px] text-on-surface-variant">Move money between accounts or to another person, safely and instantly</p>
      </div>

      <div className="w-full flex items-center justify-between relative mt-4">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-outline-variant/20 -z-10"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary transition-all duration-500 ease-in-out -z-10"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div key={stepNum} className="flex flex-col items-center gap-2 relative">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-on-primary ring-4 ring-primary/20 scale-110' 
                    : isCompleted 
                      ? 'bg-primary text-on-primary' 
                      : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
                }`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  stepNum
                )}
              </div>
              <span className={`hidden sm:block text-[11px] font-medium absolute -bottom-6 whitespace-nowrap ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                {step.split('. ')[1]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

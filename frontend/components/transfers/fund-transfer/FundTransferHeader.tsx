import React from 'react';
import { Check } from 'lucide-react';

interface FundTransferHeaderProps {
  currentStep: number;
}

export default function FundTransferHeader({ currentStep }: FundTransferHeaderProps) {
  const steps = [
    "Select Recipient",
    "Enter Amount",
    "Review",
    "Confirmation"
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Title Header */}
      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-medium text-on-surface-variant flex items-center gap-2">
          <span className="hover:text-on-surface cursor-pointer transition-colors">Transfers</span>
          <span className="text-on-surface-variant/50">&gt;</span>
          <span className="text-primary cursor-pointer hover:text-primary-fixed transition-colors">Fund Transfer</span>
        </span>
        <h1 className="font-headline-lg text-[24px] lg:text-[28px] font-bold text-on-surface leading-tight">Fund Transfer</h1>
        <p className="text-[13px] text-on-surface-variant">Move money between accounts or to another person, safely and instantly</p>
      </div>

      {/* Stepper Card */}
      <div className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between w-full relative">
          {steps.map((label, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <React.Fragment key={stepNum}>
                {/* Step Node */}
                <div className="flex flex-col items-center gap-2.5 z-10 shrink-0">
                  <div 
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary text-on-primary ring-4 ring-primary/25 scale-110 shadow-[0_0_15px_rgba(240,180,41,0.4)]' 
                        : isCompleted 
                          ? 'bg-primary text-on-primary' 
                          : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={18} strokeWidth={3} />
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span 
                    className={`text-[12px] font-medium text-center transition-colors whitespace-nowrap ${
                      isActive ? 'text-primary font-bold' : isCompleted ? 'text-on-surface font-semibold' : 'text-on-surface-variant'
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {/* Connecting Line (except after last step) */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-2 sm:mx-4 bg-outline-variant/20 relative self-center mb-6">
                    <div 
                      className="h-full bg-primary transition-all duration-500 ease-in-out"
                      style={{ width: currentStep > stepNum ? '100%' : '0%' }}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

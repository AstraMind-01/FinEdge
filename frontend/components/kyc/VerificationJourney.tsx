import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';

export default function VerificationJourney() {
  const steps = [
    { label: "Account Opened", date: "Oct 2021", status: "completed" },
    { label: "Docs Submitted", date: "Oct 2021", status: "completed" },
    { label: "In Progress", date: "Nov 2021", status: "completed" },
    { label: "KYC Approved", date: "Mar 2026", status: "active" },
  ];

  return (
    <div className="w-full">
      <div className="bg-surface-container rounded-xl border border-surface-container-highest shadow-lg p-6 md:p-8 w-full overflow-x-auto">
        <h3 className="text-xl font-semibold m-0 mb-8 text-center md:text-left">Verification Journey</h3>
        
        <div className="min-w-[600px] flex items-center justify-between relative pt-3 pb-6 px-4">
          {/* Connecting Line */}
          <div className="absolute top-8 left-10 right-10 h-0.5 bg-surface-container-highest z-0"></div>
          {/* Active Line Fill */}
          <div className="absolute top-8 left-10 right-10 h-0.5 bg-primary z-0" style={{ width: '100%' }}></div>
          
          {/* Steps */}
          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center gap-3 group w-32">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-transform group-hover:scale-110 ${
                  step.status === 'completed' 
                    ? 'bg-primary text-on-primary border-surface-container shadow-[0_0_15px_rgba(240,180,41,0.4)]' 
                    : 'bg-primary/10 text-primary border-primary shadow-[0_0_15px_rgba(240,180,41,0.2)]'
                }`}
              >
                {step.status === 'completed' ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : (
                  <ShieldCheck className="w-5 h-5" strokeWidth={2.5} />
                )}
              </div>
              <div className="flex flex-col items-center text-center">
                <span className={`text-sm font-semibold ${step.status === 'completed' ? 'text-on-surface' : 'text-primary'}`}>
                  {step.label}
                </span>
                <span className={`text-[10px] uppercase tracking-wider mt-0.5 ${step.status === 'completed' ? 'text-on-surface-variant' : 'text-primary font-bold'}`}>
                  {step.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

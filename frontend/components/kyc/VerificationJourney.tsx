"use client";

import React from 'react';
import { Check, ShieldCheck, Clock } from 'lucide-react';
import { VerificationEvent } from '../../types';

interface VerificationJourneyProps {
  events?: VerificationEvent[];
}

export default function VerificationJourney({ events: propEvents }: VerificationJourneyProps) {
  const defaultEvents: VerificationEvent[] = [
    { id: "1", label: "Account Opened", date: "OCT 2021", status: "completed" },
    { id: "2", label: "Docs Submitted", date: "OCT 2021", status: "completed" },
    { id: "3", label: "In Progress", date: "NOV 2021", status: "completed" },
    { id: "4", label: "KYC Approved", date: "MAR 2026", status: "completed" },
  ];

  const events = propEvents && propEvents.length > 0 ? propEvents : defaultEvents;

  return (
    <div className="w-full">
      <div className="bg-surface-container rounded-xl border border-surface-container-highest shadow-lg p-6 md:p-8 w-full overflow-x-auto">
        <h3 className="text-xl font-semibold m-0 mb-8 text-center md:text-left text-on-surface">Verification Journey</h3>
        
        <div className="min-w-[600px] flex items-center justify-between relative pt-3 pb-6 px-4">
          {/* Connecting Line */}
          <div className="absolute top-8 left-10 right-10 h-0.5 bg-surface-container-highest z-0"></div>
          {/* Active Line Fill */}
          <div className="absolute top-8 left-10 right-10 h-0.5 bg-primary z-0" style={{ width: '100%' }}></div>
          
          {/* Steps */}
          {events.map((evt, index) => (
            <div key={evt.id || index} className="relative z-10 flex flex-col items-center gap-3 group w-32">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-transform group-hover:scale-110 ${
                  evt.status === 'completed' 
                    ? 'bg-primary text-on-primary border-surface-container shadow-[0_0_15px_rgba(240,180,41,0.4)]' 
                    : evt.status === 'active'
                    ? 'bg-teal-400 text-black border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.4)]'
                    : 'bg-surface-container-highest text-on-surface-variant border-surface-container-highest'
                }`}
              >
                {evt.status === 'completed' ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : evt.status === 'active' ? (
                  <ShieldCheck className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <div className="flex flex-col items-center text-center">
                <span className={`text-sm font-semibold truncate w-full ${evt.status === 'completed' ? 'text-on-surface' : evt.status === 'active' ? 'text-teal-400' : 'text-on-surface-variant'}`}>
                  {evt.label}
                </span>
                <span className={`text-[10px] uppercase tracking-wider mt-0.5 ${evt.status === 'completed' ? 'text-on-surface-variant' : 'text-teal-400 font-bold'}`}>
                  {evt.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

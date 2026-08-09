import React from 'react';
import { CheckCircle, BadgeIcon, CreditCard, Home, FileText, User, PenTool, Check } from 'lucide-react';

export default function KycVerification() {
  const documents = [
    { icon: BadgeIcon, title: "Aadhaar Card", status: "Verified" },
    { icon: CreditCard, title: "PAN Card", status: "Verified" },
    { icon: Home, title: "Address Proof", status: "Verified" },
    { icon: FileText, title: "Income Proof", status: "Pending" },
    { icon: User, title: "Photograph", status: "Verified" },
    { icon: PenTool, title: "Signature", status: "Verified" },
  ];

  return (
    <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg flex flex-col">
      {/* Status Banner */}
      <div className="bg-teal-400/10 p-6 border-b border-teal-400/20 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-teal-400/5 rounded-full blur-[40px] pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-teal-400/20 flex items-center justify-center border border-teal-400/30 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
            <CheckCircle className="w-7 h-7 text-teal-400" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold text-teal-400 m-0 flex items-center gap-2">
              KYC Verified
            </h3>
            <span className="text-xs text-on-surface-variant mt-0.5">Last updated: 15 Mar 2026</span>
          </div>
        </div>
        <div className="hidden md:flex relative z-10 h-16 w-32 items-end justify-end">
          {/* Sparkline Visual */}
          <svg className="w-full h-full text-teal-400 opacity-40" preserveAspectRatio="none" viewBox="0 0 100 40">
            <path className="opacity-20" d="M0,40 L10,35 L20,38 L30,25 L40,28 L50,15 L60,20 L70,5 L80,10 L90,2 L100,0 V40 Z" fill="currentColor"></path>
            <path d="M0,40 L10,35 L20,38 L30,25 L40,28 L50,15 L60,20 L70,5 L80,10 L90,2 L100,0" fill="none" stroke="currentColor" strokeWidth="2"></path>
          </svg>
        </div>
      </div>

      {/* Checklist Table */}
      <div className="p-6">
        <div className="w-full flex flex-col gap-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-on-surface-variant uppercase tracking-wider border-b border-surface-container-highest pb-3">
            <div className="col-span-6 md:col-span-5">Document</div>
            <div className="col-span-3 hidden md:block">Status</div>
            <div className="col-span-6 md:col-span-4 text-right">Action</div>
          </div>

          {/* Rows */}
          {documents.map((doc, i) => (
            <div key={i} className={`grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg transition-colors group relative overflow-hidden ${
              doc.status === 'Pending' 
                ? 'bg-surface-container-highest/50 border border-primary/10 hover:border-primary/30' 
                : 'hover:bg-surface-container-highest'
            }`}>
              {doc.status === 'Pending' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80"></div>}
              
              <div className="col-span-6 md:col-span-5 flex items-center gap-3 pl-2">
                <doc.icon className={`w-5 h-5 ${doc.status === 'Pending' ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary transition-colors'}`} />
                <span className="text-sm text-on-surface">{doc.title}</span>
              </div>
              
              <div className="col-span-3 hidden md:flex items-center">
                {doc.status === 'Verified' ? (
                  <span className="px-3 py-0.5 rounded-full bg-teal-400/10 text-teal-400 text-xs font-medium border border-teal-400/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Verified
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary-fixed-dim text-xs font-medium border border-primary/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(240,180,41,0.1)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Pending
                  </span>
                )}
              </div>
              
              <div className="col-span-6 md:col-span-4 flex items-center justify-end gap-4">
                {doc.status === 'Verified' ? (
                  <>
                    <button className="text-xs font-bold text-primary hover:text-primary-fixed transition-colors">View</button>
                    <button className="text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors">Update</button>
                  </>
                ) : (
                  <button className="px-3 py-1 rounded bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors border border-primary/20">Re-upload</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

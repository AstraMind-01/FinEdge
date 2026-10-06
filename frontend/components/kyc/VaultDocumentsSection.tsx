"use client";

import React, { useRef } from "react";
import { FolderOpen, FileText, ChevronLeft, ChevronRight, Plus, CheckCircle2, Lock } from "lucide-react";
import { VaultDocument } from "../../types";

interface VaultDocumentsSectionProps {
  vaultDocuments: VaultDocument[];
  isDocumentAccessGranted: (id: string) => boolean;
  onDocumentClick: (doc: VaultDocument) => void;
  onOpenUpload: () => void;
}

export default function VaultDocumentsSection({
  vaultDocuments,
  isDocumentAccessGranted,
  onDocumentClick,
  onOpenUpload
}: VaultDocumentsSectionProps) {
  const vaultScrollRef = useRef<HTMLDivElement>(null);

  const scrollVault = (direction: 'left' | 'right') => {
    if (vaultScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      vaultScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="text-primary w-5 h-5" />
          <h3 className="text-xl font-semibold m-0">Document Vault</h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-xl border border-white/5 shadow-inner">
            <button
              type="button"
              onClick={() => scrollVault('left')}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-variant transition-all cursor-pointer"
              title="Previous Document"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollVault('right')}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-variant transition-all cursor-pointer"
              title="Next Document"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenUpload}
            className="px-3.5 py-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-on-primary font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-[0_0_15px_rgba(240,180,41,0.3)]"
          >
            <Plus size={14} /> Upload Document
          </button>
        </div>
      </div>
      
      <div 
        ref={vaultScrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x hide-scrollbar scroll-smooth"
      >
        {vaultDocuments.map((doc) => {
          const isAccessActive = isDocumentAccessGranted(doc.id);

          return (
            <div 
              key={doc.id} 
              onClick={() => onDocumentClick(doc)}
              className="min-w-[150px] bg-surface-container-highest/50 rounded-xl p-3 flex flex-col gap-2.5 border border-surface-variant hover:border-primary/50 transition-colors cursor-pointer group snap-start shrink-0 relative overflow-hidden"
            >
              <div className="h-16 bg-[#1E293B] rounded-lg flex items-center justify-center relative overflow-hidden">
                <FileText className="text-on-surface-variant w-8 h-8 opacity-50" />
                <div className="absolute inset-2 flex flex-col gap-1 opacity-20">
                  <div className="h-1 w-3/4 bg-current"></div>
                  <div className="h-1 w-full bg-current"></div>
                  <div className="h-1 w-5/6 bg-current"></div>
                </div>
                <div className="absolute inset-0 bg-surface/80 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-[2px] transition-all">
                  {isAccessActive ? (
                    <span className="text-tertiary text-[10px] font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 size={14} /> Preview
                    </span>
                  ) : (
                    <span className="text-primary text-[10px] font-bold uppercase flex items-center gap-1">
                      <Lock size={14} /> 2FA Unlock
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-on-surface truncate max-w-[90px]">{doc.fileName}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    doc.status === 'Verified' ? 'text-teal-400 bg-teal-500/10' : 'text-amber-400 bg-amber-500/10'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-on-surface-variant">
                  <span>{doc.fileSize}</span>
                  <span className="font-mono">{doc.uploadDate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

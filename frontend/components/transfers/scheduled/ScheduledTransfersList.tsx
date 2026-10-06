import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { ScheduledTransfer } from '../../../types';
import { Repeat, ChevronDown, ChevronUp, Edit2, Pause, Play, Trash2, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../ui/button';

interface ScheduledTransfersListProps {
  transfers: ScheduledTransfer[];
}

export default function ScheduledTransfersList({ transfers }: ScheduledTransfersListProps) {
  
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary/10 text-tertiary border border-tertiary/20">ACTIVE</span>;
      case 'PAUSED': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20">PAUSED</span>;
      case 'FAILED': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error/10 text-error border border-error/20">FAILED</span>;
      case 'COMPLETED': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-outline-variant/10 text-on-surface-variant border border-outline-variant/20">COMPLETED</span>;
      default: return null;
    }
  };

  if (transfers.length === 0) {
    return (
      <Card className="w-full p-12 flex flex-col items-center justify-center gap-4 bg-surface-container border border-outline-variant/10 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
          <Clock size={24} />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-[16px] font-bold text-on-surface">No Scheduled Transfers Found</h3>
          <p className="text-[13px] text-on-surface-variant">Try adjusting your filters or schedule a new transfer.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full flex flex-col border border-outline-variant/10 bg-surface-container shadow-sm overflow-hidden">
      
      <div className="flex flex-col divide-y divide-outline-variant/10">
        {transfers.map(t => {
          const isExpanded = expandedId === t.id;
          const totalTransferred = t.history.filter(h => h.status === 'SUCCESS').reduce((sum, h) => sum + h.amount, 0);

          return (
            <div key={t.id} className="flex flex-col bg-surface hover:bg-surface-high transition-colors">
              
              {/* Main Row */}
              <div 
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                onClick={() => toggleExpand(t.id)}
              >
                
                {/* Left: Recipient Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-[16px] font-bold text-on-surface-variant">
                      {t.beneficiaryName.charAt(0)}
                    </div>
                    {t.isRecurring && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm border border-surface">
                        <Repeat size={10} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[15px] text-on-surface">{t.beneficiaryName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-[10px] font-medium text-on-surface-variant border border-outline-variant/10">
                        {t.purpose}
                      </span>
                    </div>
                    <span className="text-[12px] text-on-surface-variant flex items-center gap-1.5">
                      {t.frequency} • From {t.fromAccountId}
                    </span>
                  </div>
                </div>

                {/* Right: Amount & Status */}
                <div className="flex items-center justify-between lg:justify-end gap-6 flex-1 lg:flex-none">
                  <div className="flex flex-col lg:items-end gap-1">
                    <span className="font-bold text-[16px] text-on-surface">{formatCurrency(t.amount)}</span>
                    <span className="text-[11px] text-on-surface-variant">Next: {t.nextDate}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {getStatusBadge(t.status)}
                    <button className="text-on-surface-variant hover:text-on-surface w-6 h-6 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-5 bg-surface-container-low border-t border-dashed border-outline-variant/20 flex flex-col gap-6" onClick={(e) => e.stopPropagation()}>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-8 px-3 text-[12px] font-medium bg-surface border-outline-variant/20 flex items-center gap-1.5">
                      <Edit2 size={12} /> Edit Details
                    </Button>
                    {t.status === 'ACTIVE' ? (
                      <Button variant="outline" className="h-8 px-3 text-[12px] font-medium bg-secondary/5 text-secondary border-secondary/20 hover:bg-secondary/10 flex items-center gap-1.5">
                        <Pause size={12} /> Pause Schedule
                      </Button>
                    ) : (
                      <Button variant="outline" className="h-8 px-3 text-[12px] font-medium bg-tertiary/5 text-tertiary border-tertiary/20 hover:bg-tertiary/10 flex items-center gap-1.5">
                        <Play size={12} /> Resume Schedule
                      </Button>
                    )}
                    <Button variant="outline" className="h-8 px-3 text-[12px] font-medium bg-error/5 text-error border-error/20 hover:bg-error/10 flex items-center gap-1.5 ml-auto">
                      <Trash2 size={12} /> Cancel Schedule
                    </Button>
                  </div>

                  {/* History Grid */}
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 flex flex-col gap-3">
                      <h4 className="text-[12px] font-semibold text-on-surface uppercase tracking-wider">Execution History</h4>
                      <div className="flex flex-col gap-2">
                        {t.history.map((h, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-outline-variant/10 bg-surface">
                            <div className="flex items-center gap-3">
                              {h.status === 'SUCCESS' ? (
                                <CheckCircle2 size={16} className="text-tertiary" />
                              ) : h.status === 'FAILED' ? (
                                <AlertTriangle size={16} className="text-error" />
                              ) : (
                                <Clock size={16} className="text-on-surface-variant" />
                              )}
                              <span className="text-[13px] text-on-surface-variant">{h.date}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-semibold text-[13px] text-on-surface">{formatCurrency(h.amount)}</span>
                              {h.status === 'FAILED' && (
                                <button className="text-[11px] font-medium text-error hover:underline">Retry</button>
                              )}
                            </div>
                          </div>
                        ))}
                        {t.history.length === 0 && (
                          <div className="text-[12px] text-on-surface-variant p-2">No executions yet.</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="lg:w-[250px] shrink-0 flex flex-col gap-4 bg-surface p-4 rounded-xl border border-outline-variant/10">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-on-surface-variant">Total Transferred</span>
                        <span className="font-bold text-[16px] text-primary">{formatCurrency(totalTransferred)}</span>
                      </div>
                      <div className="w-full h-px bg-outline-variant/10 border-dashed border-b border-outline-variant/20"></div>
                      <div className="flex flex-col gap-2 text-[12px]">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Start Date:</span>
                          <span className="font-medium text-on-surface">{t.startDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">End Date:</span>
                          <span className="font-medium text-on-surface">{t.endDate || 'Until cancelled'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Transfer Mode:</span>
                          <span className="font-medium text-on-surface">{t.transferMode}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-outline-variant/10 bg-surface flex items-center justify-between text-[12px] text-on-surface-variant">
        <span>Showing {transfers.length} scheduled transfers</span>
        <div className="flex items-center gap-2">
          <button className="w-7 h-7 rounded bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-50">&lt;</button>
          <span className="font-medium">1</span>
          <button className="w-7 h-7 rounded bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-50">&gt;</button>
        </div>
      </div>
    </Card>
  );
}

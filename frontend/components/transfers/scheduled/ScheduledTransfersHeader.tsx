import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../ui/button';

interface ScheduledTransfersHeaderProps {
  onScheduleNew: () => void;
}

export default function ScheduledTransfersHeader({ onScheduleNew }: ScheduledTransfersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-medium text-on-surface-variant flex items-center gap-2">
          <span className="hover:text-on-surface cursor-pointer transition-colors">Transfers</span>
          <span className="text-on-surface-variant/50">&gt;</span>
          <span className="text-primary cursor-pointer hover:text-primary-fixed transition-colors">Scheduled Transfers</span>
        </span>
        <h1 className="font-headline-lg text-[24px] lg:text-[28px] font-bold text-on-surface leading-tight">Scheduled Transfers</h1>
        <p className="text-[13px] text-on-surface-variant">Automate your payments and never miss a due date</p>
      </div>
      <div className="flex items-center gap-3">
        <Button 
          onClick={onScheduleNew}
          className="bg-primary text-on-primary h-[40px] px-4 hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-shadow font-bold flex items-center gap-2"
        >
          <Plus size={16} />
          Schedule New Transfer
        </Button>
      </div>
    </div>
  );
}

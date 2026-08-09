import React from 'react';
import { Download, FileDown } from 'lucide-react';
import { Button } from '../ui/button';

export default function TransactionsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
      <div className="flex flex-col">
        <h1 className="font-headline-lg text-[24px] lg:text-[28px] font-bold text-on-surface leading-tight">Transactions</h1>
        <p className="text-[13px] text-on-surface-variant mt-1">Track and manage all your account activity</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="bg-transparent border-outline-variant/30 text-on-surface hover:bg-surface-container h-[40px] px-4 font-medium flex items-center gap-2">
          <FileDown size={16} />
          Export Statement
        </Button>
        <Button className="bg-primary text-on-primary h-[40px] px-4 hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-shadow font-medium flex items-center gap-2">
          <Download size={16} />
          Download PDF
        </Button>
      </div>
    </div>
  );
}

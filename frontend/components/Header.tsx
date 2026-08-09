import React from 'react';
import { Search, Mail, Bell, Maximize } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 lg:left-[230px] right-0 h-[72px] bg-background/95 backdrop-blur-xl z-40 px-6 lg:px-8 flex items-center justify-between border-b border-outline-variant/10 shadow-[0_1px_8px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-headline-lg text-[18px] lg:text-[20px] font-semibold text-on-surface leading-tight">Welcome back, Soumya Ranjan</span>
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Premium</span>
          </div>
          <span className="text-[12px] text-on-surface-variant mt-0.5">Managing your wealth securely.</span>
        </div>
        <div className="ml-8 hidden lg:flex items-center bg-surface-container rounded-full px-4 py-2 gap-2 border border-outline-variant/20 w-[240px] xl:w-[300px]">
          <Search className="text-on-surface-variant shrink-0" size={18} />
          <input className="bg-transparent border-none outline-none text-body-md text-[13px] text-on-surface placeholder:text-on-surface-variant w-full" placeholder="Search transactions..." type="text"/>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-5 text-on-surface-variant">
          <Mail className="cursor-pointer hover:text-on-surface transition-colors" size={20} />
          <Bell className="cursor-pointer hover:text-on-surface transition-colors" size={20} />
          <Maximize className="cursor-pointer hover:text-on-surface transition-colors" size={20} />
        </div>
        <div className="hidden sm:block h-8 w-[1px] bg-outline-variant/30"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-bold text-on-surface leading-tight truncate max-w-[120px]">Soumya Ranjan</p>
            <p className="text-[11px] text-primary leading-tight mt-0.5">Premium Member</p>
          </div>
          <img alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-primary/30 shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWO8u-64-GeG9wf5SYzdm1UexZArMSgxO2KQPic_UqGxUlrO0nZMrhObGmbU2leefEiuNXzPZF6G7vkyodfUz9M4rhN1wcpkjrYrC2OPN4b-vNKq3Cv1Ll0pgdCkhqBZDgFYOwv8ZkVeCIIRXpYICJh1S6CRqclEWRyZC9JQ5ZFD_yERN1ZROlC_S9CzOLRxStiSoUirrYkpGL6a2K0vhRbkUUjNruYPnSxhqPmIgGOeoLt1VxfFKUMg"/>
        </div>
      </div>
    </header>
  );
}

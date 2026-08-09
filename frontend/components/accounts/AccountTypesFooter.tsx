import React from 'react';
import { Landmark, Briefcase, Lock, PiggyBank, ArrowRight } from 'lucide-react';
import { Card } from '../ui/card';

export default function AccountTypesFooter() {
  const types = [
    {
      id: 'savings',
      title: 'Savings Account',
      description: 'Earn up to 4% p.a. with zero minimum balance requirements.',
      icon: <Landmark className="text-tertiary" size={24} />,
      bg: 'from-tertiary/10 to-transparent'
    },
    {
      id: 'current',
      title: 'Current Account',
      description: 'Unlimited free transactions for your growing business needs.',
      icon: <Briefcase className="text-secondary" size={24} />,
      bg: 'from-secondary/10 to-transparent'
    },
    {
      id: 'fd',
      title: 'Fixed Deposit',
      description: 'Secure your future with guaranteed returns up to 7.25% p.a.',
      icon: <Lock className="text-primary-fixed" size={24} />,
      bg: 'from-primary-fixed/10 to-transparent'
    },
    {
      id: 'rd',
      title: 'Recurring Deposit',
      description: 'Build wealth steadily with small monthly investments.',
      icon: <PiggyBank className="text-tertiary-fixed" size={24} />,
      bg: 'from-tertiary-fixed/10 to-transparent'
    }
  ];

  return (
    <div className="flex flex-col gap-4 mt-4 w-full">
      <h3 className="font-title-md font-semibold text-on-surface">Account Types We Offer</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {types.map((type) => (
          <Card key={type.id} className={`p-5 flex flex-col gap-3 relative overflow-hidden bg-gradient-to-br ${type.bg} border-outline-variant/10 group cursor-pointer hover:border-outline-variant/30 transition-colors`}>
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/10 group-hover:scale-110 transition-transform">
              {type.icon}
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <span className="font-title-md text-[15px] font-semibold text-on-surface">{type.title}</span>
              <p className="text-[12px] text-on-surface-variant leading-relaxed">
                {type.description}
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-auto pt-2 text-[12px] font-medium text-primary group-hover:text-primary-fixed transition-colors">
              Learn More <ArrowRight size={14} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

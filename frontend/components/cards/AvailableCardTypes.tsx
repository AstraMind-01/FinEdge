import React from 'react';
import { CreditCard, Smartphone, ShieldCheck } from 'lucide-react';

export default function AvailableCardTypes() {
  const options = [
    {
      title: "Credit Cards",
      icon: <CreditCard className="text-[#a379c9]" size={24} />,
      desc: "Earn 5x rewards, airport lounge access, and exclusive lifestyle benefits.",
      bg: "from-[#2D1B4E]/40 to-transparent",
      borderColor: "border-[#4A2B7F]/50"
    },
    {
      title: "Debit Cards",
      icon: <CreditCard className="text-blue-400" size={24} />,
      desc: "Zero markup on international spends and instant ATM withdrawals.",
      bg: "from-[#1A2E4C]/40 to-transparent",
      borderColor: "border-[#2A4B7C]/50"
    },
    {
      title: "Virtual Cards",
      icon: <Smartphone className="text-teal-400" size={24} />,
      desc: "Instantly generated for secure, one-time online shopping.",
      bg: "from-[#14494E]/40 to-transparent",
      borderColor: "border-[#1B656C]/50"
    },
    {
      title: "Prepaid Forex",
      icon: <ShieldCheck className="text-green-400" size={24} />,
      desc: "Load multiple currencies and travel the world cashless.",
      bg: "from-green-900/30 to-transparent",
      borderColor: "border-green-800/50"
    }
  ];

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-on-surface mb-4">Available Card Types</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((opt, i) => (
          <div key={i} className={`bg-gradient-to-br ${opt.bg} rounded-2xl p-5 border ${opt.borderColor} hover:border-primary/50 transition-colors group cursor-pointer`}>
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
              {opt.icon}
            </div>
            <h4 className="text-on-surface font-bold mb-2">{opt.title}</h4>
            <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">{opt.desc}</p>
            <a href="#" className="text-primary text-sm font-medium hover:underline flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Apply Now →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

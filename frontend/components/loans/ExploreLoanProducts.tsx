import React from 'react';
import { Home, User, Car, GraduationCap } from 'lucide-react';

export default function ExploreLoanProducts() {
  const products = [
    {
      title: "Personal Loan",
      icon: <User size={24} className="text-purple-400" />,
      rate: "10.25%",
      benefit: "Get instant approval with minimal documentation. Funds in 24 hours.",
      bg: "from-purple-900/30 to-transparent",
      border: "border-purple-800/40"
    },
    {
      title: "Home Loan",
      icon: <Home size={24} className="text-blue-400" />,
      rate: "8.50%",
      benefit: "Own your dream home with flexible repayment up to 30 years.",
      bg: "from-blue-900/30 to-transparent",
      border: "border-blue-800/40"
    },
    {
      title: "Car Loan",
      icon: <Car size={24} className="text-teal-400" />,
      rate: "9.00%",
      benefit: "Drive your dream car with 100% on-road financing.",
      bg: "from-teal-900/30 to-transparent",
      border: "border-teal-800/40"
    },
    {
      title: "Education Loan",
      icon: <GraduationCap size={24} className="text-primary" />,
      rate: "7.50%",
      benefit: "Invest in your future with moratorium until course completion.",
      bg: "from-amber-900/20 to-transparent",
      border: "border-amber-800/40"
    }
  ];

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-on-surface mb-4">Explore Loan Products</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((p, i) => (
          <div key={i} className={`bg-gradient-to-br ${p.bg} rounded-2xl p-5 border ${p.border} hover:border-primary/50 transition-colors group cursor-pointer`}>
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
              {p.icon}
            </div>
            <h4 className="text-on-surface font-bold mb-1">{p.title}</h4>
            <p className="text-primary text-sm font-bold mb-2">From {p.rate} p.a.</p>
            <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">{p.benefit}</p>
            <a href="#" className="text-primary text-sm font-medium hover:underline flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Apply Now →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

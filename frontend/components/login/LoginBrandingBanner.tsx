"use client";

import React from "react";

export default function LoginBrandingBanner() {
  return (
    <section
      className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden"
      style={{
        backgroundImage:
          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD8bhNL0M5e5VZ7jp6rL7i3p0AviAtd2w5J8ELgQrw5mAbYwiA-KKaKthedAeFy4u_YRb93QH4ttljl03UmBT7-9PIPBk9FMMnQBvcFhoQsNNi1go5KLX3Y6w0DryUzIoJjw454Zy8Glw1JAx-E6Neu4DgOX94LrajgNU_Vr_SpixDZ7HKOEVtkw3lrDxVMbqspsv5_iT2Gi8PxBYUHe-pi5jU5P8lKX1eqf4hfpSGTfPYJ7X_Jo1kQMA')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/80 to-[#0B1120]/30 z-0" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, #f5c960, #d69e1f)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#0B1120]" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" />
            <path d="M12 8l-4 2.5v4L12 17l4-2.5v-4L12 8z" fill="currentColor" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-[#ffd481] tracking-tight leading-none">FinEdge</span>
          <span className="text-[10px] text-[#d4c5ad] uppercase tracking-[0.2em] mt-0.5">Banking Redefined</span>
        </div>
      </div>

      {/* Headline */}
      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 mb-6">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#f0b429]" stroke="currentColor" strokeWidth={2}>
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-xs text-white uppercase tracking-widest font-semibold">Enterprise Grade Security</span>
        </div>
        <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-lg mb-6 leading-tight">
          Banking that puts <span className="text-[#ffd481] italic">you</span> first.
        </h1>
        <p className="text-lg text-[#d4c5ad] leading-relaxed">
          Secure, smart, and simple wealth management for the modern world. Access institutional-grade insights from anywhere.
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="relative z-10 grid grid-cols-3 gap-4">
        {[
          { icon: "🔒", label: "256-bit", sub: "Encryption" },
          { icon: "🏛️", label: "Regulated", sub: "Tier 1 Bank" },
          { icon: "🎧", label: "24/7", sub: "Concierge Support" },
        ].map((item) => (
          <div
            key={item.sub}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-xl p-4 rounded-xl hover:-translate-y-0.5 transition-transform"
          >
            <span className="text-2xl">{item.icon}</span>
            <div>
              <div className="text-sm font-semibold text-white font-mono">{item.label}</div>
              <div className="text-[10px] text-[#d4c5ad] uppercase tracking-wider">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="absolute -left-1/4 -bottom-1/4 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(240,180,41,0.05) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
    </section>
  );
}

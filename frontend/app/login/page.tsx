"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"password" | "otp">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!customerId.trim()) {
      setError("Please enter your Customer ID or email.");
      triggerShake();
      return;
    }
    if (activeTab === "password" && !password) {
      setError("Please enter your password.");
      triggerShake();
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push("/");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      (nextInput as HTMLInputElement)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      (prevInput as HTMLInputElement)?.focus();
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#0B1120] font-sans">
      {/* Left Branding Panel */}
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
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{background: "linear-gradient(135deg, #f5c960, #d69e1f)"}}>
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
            Banking that puts{" "}
            <span className="text-[#ffd481] italic">you</span> first.
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
            <div key={item.sub} className="flex items-center gap-3 bg-white/10 backdrop-blur-xl p-4 rounded-xl hover:-translate-y-0.5 transition-transform">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="text-sm font-semibold text-white font-mono">{item.label}</div>
                <div className="text-[10px] text-[#d4c5ad] uppercase tracking-wider">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute -left-1/4 -bottom-1/4 w-[800px] h-[800px] rounded-full pointer-events-none" style={{background: "radial-gradient(circle, rgba(240,180,41,0.05) 0%, transparent 70%)", filter: "blur(80px)"}} />
      </section>

      {/* Right Auth Panel */}
      <main className="w-full lg:w-[45%] flex flex-col bg-[#0B1120]" style={{boxShadow: "-20px 0 40px -10px rgba(0,0,0,0.5)"}}>
        {/* Top Links */}
        <header className="flex justify-end items-center gap-6 px-8 py-6 text-sm">
          <a href="#" className="text-[#d4c5ad] hover:text-white transition-colors text-sm">Having trouble?</a>
        </header>

        {/* Form Area */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 md:px-20 w-full max-w-xl mx-auto py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background: "linear-gradient(135deg, #f5c960, #d69e1f)"}}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#0B1120]" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#ffd481]">FinEdge</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-[#d4c5ad] text-sm">Sign in to access your dashboard</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-[#151b2b] rounded-xl p-1 mb-8 relative">
            <div
              className="absolute inset-y-1 w-[calc(50%-4px)] bg-[#2f3445] rounded-lg shadow-sm transition-all duration-300 ease-in-out"
              style={{ left: activeTab === "otp" ? "calc(50% + 2px)" : "4px" }}
            />
            {(["password", "otp"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setError(""); }}
                className={`relative z-10 flex-1 py-2.5 text-xs uppercase tracking-widest font-semibold transition-colors duration-200 ${activeTab === tab ? "text-white" : "text-[#d4c5ad] hover:text-white"}`}
              >
                {tab === "password" ? "Password" : "Login via OTP"}
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 w-full"
            style={shake ? { animation: "shake 0.4s ease-in-out" } : {}}
          >
            {/* Customer ID */}
            <div className="flex flex-col gap-1.5 group">
              <label className="text-xs font-semibold text-[#d4c5ad] uppercase tracking-wider" htmlFor="customer-id">
                Customer ID / Email
              </label>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9c8f7a] group-focus-within:text-[#f0b429] transition-colors" stroke="currentColor" strokeWidth={2}>
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx={12} cy={7} r={4} />
                </svg>
                <input
                  id="customer-id"
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Enter your Customer ID or email"
                  className="w-full bg-[#141B2D] text-white rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none border border-[#2f3445] focus:border-[#f0b429]/60 transition-all placeholder-[#9c8f7a] font-mono"
                />
              </div>
            </div>

            {/* Password or OTP */}
            {activeTab === "password" ? (
              <div className="flex flex-col gap-1.5 group">
                <div className="flex justify-between items-center">
                  <label className={`text-xs font-semibold uppercase tracking-wider ${error ? "text-[#ffb4ab]" : "text-[#d4c5ad]"}`} htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-xs text-[#ffd481] hover:text-[#ffdea4] transition-colors hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${error ? "text-[#ffb4ab]" : "text-[#9c8f7a] group-focus-within:text-[#f0b429]"}`} stroke="currentColor" strokeWidth={2}>
                    <rect x={3} y={11} width={18} height={11} rx={2} /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`w-full text-white rounded-xl py-3.5 pl-12 pr-12 text-sm outline-none border transition-all font-mono ${
                      error
                        ? "bg-[#ffb4ab]/10 border-[#ffb4ab]"
                        : "bg-[#141B2D] border-[#2f3445] focus:border-[#f0b429]/60"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9c8f7a] hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1={1} y1={1} x2={23} y2={23} />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx={12} cy={12} r={3} />
                      </svg>
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-xs text-[#ffb4ab] flex items-center gap-1.5 mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth={2}>
                      <circle cx={12} cy={12} r={10} /><line x1={12} y1={8} x2={12} y2={12} /><line x1={12} y1={16} x2={12.01} y2={16} />
                    </svg>
                    {error}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-[#d4c5ad] uppercase tracking-wider">One-Time Password</label>
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-bold text-white bg-[#141B2D] border border-[#2f3445] rounded-xl outline-none focus:border-[#f0b429]/60 transition-all"
                    />
                  ))}
                </div>
                <button type="button" className="text-xs text-[#ffd481] hover:underline self-start mt-1">Resend OTP</button>
              </div>
            )}

            {/* Remember Device */}
            {activeTab === "password" && (
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setRememberDevice(!rememberDevice)}
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${rememberDevice ? "border-[#f0b429]" : "bg-[#151b2b] border-[#504534] group-hover:border-[#f0b429]/50"}`}
                  style={rememberDevice ? { background: "#f0b429" } : {}}
                >
                  {rememberDevice && (
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-[#0B1120]" stroke="currentColor" strokeWidth={3}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-[#d4c5ad] group-hover:text-white transition-colors">Remember this device</span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 overflow-hidden group mt-1 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
              style={{ background: "#f0b429", color: "#261900" }}
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx={12} cy={12} r={10} strokeOpacity={0.25} />
                  <path d="M12 2a10 10 0 0110 10" />
                </svg>
              ) : (
                <>
                  <span className="relative z-10 text-base">Secure Login</span>
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-700 ease-in-out" />
                </>
              )}
            </button>
          </form>

          {/* Alternative Login */}
          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center w-full gap-4 mb-6 opacity-60">
              <div className="h-px bg-[#504534] flex-1" />
              <span className="text-xs text-[#d4c5ad] uppercase tracking-widest whitespace-nowrap">Or login with</span>
              <div className="h-px bg-[#504534] flex-1" />
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button className="flex flex-col items-center justify-center gap-2 py-4 bg-[#151b2b] hover:bg-[#2f3445] rounded-xl border border-transparent hover:border-[#504534]/50 transition-all group">
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-[#d4c5ad] group-hover:text-[#57f1db] transition-colors" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                <span className="text-xs text-[#d4c5ad] group-hover:text-white">Biometric ID</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 py-4 bg-[#151b2b] hover:bg-[#2f3445] rounded-xl border border-transparent hover:border-[#504534]/50 transition-all group">
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-[#d4c5ad] group-hover:text-[#c6bfff] transition-colors" stroke="currentColor" strokeWidth={1.5}>
                  <rect x={3} y={3} width={7} height={7} /><rect x={14} y={3} width={7} height={7} /><rect x={3} y={14} width={7} height={7} /><path d="M14 14h3v3M14 17h3v3M17 14h3v3" />
                </svg>
                <span className="text-xs text-[#d4c5ad] group-hover:text-white">Scan QR Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-8 pb-8 text-center text-sm">
          <p className="text-[#d4c5ad] mb-3">
            New to FinEdge?{" "}
            <a href="#" className="text-[#ffd481] font-medium hover:underline hover:text-[#ffdea4] transition-colors">
              Open an Account
            </a>
          </p>
          <div className="flex justify-center gap-4 text-[11px] text-[#9c8f7a] uppercase tracking-wider">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

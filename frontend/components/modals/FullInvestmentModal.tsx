"use client";

import React, { useState } from "react";
import { 
  X, BarChart3, TrendingUp, Wallet, Target, ShieldCheck, CheckCircle2, 
  Loader2, Calculator, ArrowRight, AlertCircle, Info, Sparkles 
} from "lucide-react";
import { Holding, SIP } from "../../types";
import { MockApi } from "../../lib/mockApi";

interface FullInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string; // "Mutual Funds", "Stocks & IPOs", "Fixed Deposits", "Gold Investment", "Bonds"
  onInvestmentSuccess?: (result: { holding?: Holding; sip?: SIP; newBalance: number }) => void;
}

interface AssetOption {
  id: string;
  name: string;
  subTitle: string;
  rateOrPrice: number;
  rateLabel: string;
  riskGrade: string;
  minAmount: number;
}

const ASSET_CATALOG: Record<string, AssetOption[]> = {
  "MUTUAL FUNDS": [
    { id: "MF-01", name: "Axis Bluechip Fund Direct-Growth", subTitle: "Large Cap Equity • 5★ Rated", rateOrPrice: 18.4, rateLabel: "+18.4% 3Y CAGR", riskGrade: "Very High Risk", minAmount: 500 },
    { id: "MF-02", name: "Nippon India Small Cap Fund", subTitle: "Small Cap Equity • 5★ Rated", rateOrPrice: 28.6, rateLabel: "+28.6% 3Y CAGR", riskGrade: "Very High Risk", minAmount: 1000 },
    { id: "MF-03", name: "Parag Parikh Flexi Cap Fund", subTitle: "Flexi Cap Equity • 5★ Rated", rateOrPrice: 21.2, rateLabel: "+21.2% 3Y CAGR", riskGrade: "Moderate-High Risk", minAmount: 1000 }
  ],
  "STOCKS & IPOS": [
    { id: "STK-01", name: "TCS (Tata Consultancy Services)", subTitle: "IT Services Giant • NSE: TCS", rateOrPrice: 4150, rateLabel: "₹4,150.00 / Share", riskGrade: "Moderate Risk", minAmount: 4150 },
    { id: "STK-02", name: "Reliance Industries Ltd", subTitle: "Energy & Telecom • NSE: RELIANCE", rateOrPrice: 2950, rateLabel: "₹2,950.00 / Share", riskGrade: "Moderate Risk", minAmount: 2950 },
    { id: "STK-03", name: "FinEdge Fintech IPO", subTitle: "Mainboard IPO • Lot Size: 45 Shares", rateOrPrice: 320, rateLabel: "₹320.00 / Share (Cutoff)", riskGrade: "High Growth IPO", minAmount: 14400 }
  ],
  "FIXED DEPOSITS": [
    { id: "FD-01", name: "5 Year Tax Saver Fixed Deposit", subTitle: "Section 80C Tax Saving • Guaranteed", rateOrPrice: 8.50, rateLabel: "8.50% p.a.", riskGrade: "Zero Risk (DICGC Insured)", minAmount: 10000 },
    { id: "FD-02", name: "3 Year High Yield Fixed Deposit", subTitle: "Quarterly Compounding • Cumulative", rateOrPrice: 8.10, rateLabel: "8.10% p.a.", riskGrade: "Zero Risk (DICGC Insured)", minAmount: 5000 },
    { id: "FD-03", name: "1 Year Short Term FD", subTitle: "Flexible Premature Withdrawal", rateOrPrice: 7.25, rateLabel: "7.25% p.a.", riskGrade: "Zero Risk (DICGC Insured)", minAmount: 5000 }
  ],
  "GOLD INVESTMENT": [
    { id: "GLD-01", name: "Digital Gold 24K (99.9% Purity)", subTitle: "Vault Storage Insured by Augmont", rateOrPrice: 7250, rateLabel: "₹7,250 / Gram", riskGrade: "Low Risk (Hedge)", minAmount: 500 },
    { id: "GLD-02", name: "Sovereign Gold Bond (SGB Series V)", subTitle: "RBI Issued • +2.5% Annual Interest", rateOrPrice: 6890, rateLabel: "₹6,890 / Gram", riskGrade: "Sovereign Backed", minAmount: 6890 }
  ],
  "BONDS": [
    { id: "BND-01", name: "HDFC Capital Senior Corporate Bond", subTitle: "AAA Rated • Semi-Annual Coupon", rateOrPrice: 8.95, rateLabel: "8.95% YTM", riskGrade: "AAA Credit Rating", minAmount: 25000 },
    { id: "BND-02", name: "NHAI Tax-Free Government Bond", subTitle: "100% Tax-Free Interest • Govt Backed", rateOrPrice: 7.60, rateLabel: "7.60% Tax-Free YTM", riskGrade: "Sovereign Rated", minAmount: 50000 },
    { id: "BND-03", name: "RBI Floating Rate Savings Bond", subTitle: "Reset Every 6 Months • 7 Years Lock-in", rateOrPrice: 8.05, rateLabel: "8.05% Floating YTM", riskGrade: "Government Backed", minAmount: 1000 }
  ]
};

export default function FullInvestmentModal({
  isOpen,
  onClose,
  category,
  onInvestmentSuccess
}: FullInvestmentModalProps) {
  // Normalize category key
  const catKey = category.toUpperCase().includes("MUTUAL") ? "MUTUAL FUNDS" :
                 category.toUpperCase().includes("STOCK") || category.toUpperCase().includes("IPO") ? "STOCKS & IPOS" :
                 category.toUpperCase().includes("FIXED") || category.toUpperCase().includes("FD") ? "FIXED DEPOSITS" :
                 category.toUpperCase().includes("GOLD") ? "GOLD INVESTMENT" : "BONDS";

  const catalog = ASSET_CATALOG[catKey] || ASSET_CATALOG["MUTUAL FUNDS"];

  // State
  const [selectedAsset, setSelectedAsset] = useState<AssetOption>(catalog[0]);
  const [investMode, setInvestMode] = useState<'SIP' | 'LUMP'>(catKey === "MUTUAL FUNDS" ? 'SIP' : 'LUMP');
  const [amountInput, setAmountInput] = useState<string>(catalog[0].minAmount.toString());
  const [fdTenureYears, setFdTenureYears] = useState<number>(3);
  const [sipDebitDate, setSipDebitDate] = useState<number>(10);
  const [stepUpEnabled, setStepUpEnabled] = useState<boolean>(true);
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");

  const [currentStep, setCurrentStep] = useState<number>(1); // 1: Select & Parameters, 2: KYC & Verification, 3: Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAmount = Number(amountInput) || 0;
  const currentAccBalance = 625430.50; // ACC-001 balance

  // Calculations per category
  let calculationBadge = "";
  let maturityEstimate = 0;
  let unitsOrQuantity = 0;

  if (catKey === "MUTUAL FUNDS") {
    if (investMode === 'SIP') {
      const wealth5Y = Math.round(currentAmount * 89.6);
      calculationBadge = `5Y Estimated SIP Value: ~₹${wealth5Y.toLocaleString('en-IN')}`;
    } else {
      const wealth5Y = Math.round(currentAmount * Math.pow(1 + selectedAsset.rateOrPrice / 100, 5));
      calculationBadge = `5Y Estimated Value at ${selectedAsset.rateOrPrice}%: ~₹${wealth5Y.toLocaleString('en-IN')}`;
    }
  } else if (catKey === "STOCKS & IPOS") {
    unitsOrQuantity = Math.floor(currentAmount / selectedAsset.rateOrPrice);
    calculationBadge = `Total Shares Purchased: ${unitsOrQuantity} Shares (Price: ${selectedAsset.rateLabel})`;
  } else if (catKey === "FIXED DEPOSITS") {
    // Compound interest: A = P(1 + r/n)^(nt)
    const r = selectedAsset.rateOrPrice / 100;
    maturityEstimate = Math.round(currentAmount * Math.pow(1 + r / 4, 4 * fdTenureYears));
    calculationBadge = `Maturity Value after ${fdTenureYears} Years: ₹${maturityEstimate.toLocaleString('en-IN')} (+₹${(maturityEstimate - currentAmount).toLocaleString('en-IN')} Interest)`;
  } else if (catKey === "GOLD INVESTMENT") {
    const grams = Math.round((currentAmount / selectedAsset.rateOrPrice) * 100) / 100;
    calculationBadge = `Total 24K Gold Credited: ${grams} Grams`;
  } else if (catKey === "BONDS") {
    const annualPayout = Math.round(currentAmount * (selectedAsset.rateOrPrice / 100));
    calculationBadge = `Annual Coupon Interest Payout: ₹${annualPayout.toLocaleString('en-IN')} / year`;
  }

  const handleSelectAsset = (asset: AssetOption) => {
    setSelectedAsset(asset);
    setAmountInput(asset.minAmount.toString());
    setValidationError(null);
  };

  const handleProceedToVerify = () => {
    setValidationError(null);
    if (currentAmount < selectedAsset.minAmount) {
      setValidationError(`Minimum investment amount for ${selectedAsset.name} is ₹${selectedAsset.minAmount.toLocaleString('en-IN')}`);
      return;
    }
    if (currentAmount > currentAccBalance) {
      setValidationError(`Insufficient funds in ACC-001. Available balance is ₹${currentAccBalance.toLocaleString('en-IN')}`);
      return;
    }
    setCurrentStep(2);
  };

  const handleConfirmInvestment = async () => {
    setIsSubmitting(true);
    setValidationError(null);
    try {
      const result = await MockApi.executeInvestment({
        category,
        assetName: selectedAsset.name,
        amount: currentAmount,
        investType: investMode,
        navOrPrice: selectedAsset.rateOrPrice,
        tenureYears: fdTenureYears
      });

      setCurrentStep(3);
      if (onInvestmentSuccess) {
        onInvestmentSuccess(result);
      }
    } catch (err) {
      setValidationError("Investment execution failed. Please check account status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-xl p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/30">
                {category} Suite
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20">
                Live Backend Engine
              </span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">Explore &amp; Invest in {category}</h2>
            <p className="text-xs text-on-surface-variant">Real-time NAVs, compounding calculators &amp; instant bank debits</p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold">
            <AlertCircle size={18} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* STEP 1: ASSET SELECTION & PARAMETERS */}
        {currentStep === 1 && (
          <div className="space-y-4 text-xs">
            
            {/* Mode Switcher for Mutual Funds */}
            {catKey === "MUTUAL FUNDS" && (
              <div className="flex bg-surface rounded-xl p-1 border border-white/5">
                <button
                  type="button"
                  onClick={() => setInvestMode('SIP')}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all text-xs ${investMode === 'SIP' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Monthly SIP
                </button>
                <button
                  type="button"
                  onClick={() => setInvestMode('LUMP')}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all text-xs ${investMode === 'LUMP' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  One-Time Lump Sum
                </button>
              </div>
            )}

            {/* Asset Catalog Selector */}
            <div>
              <label className="font-semibold text-on-surface-variant block mb-1.5">Select Investment Instrument</label>
              <div className="space-y-2">
                {catalog.map(asset => {
                  const isSel = selectedAsset.id === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleSelectAsset(asset)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSel ? 'bg-primary/10 border-primary shadow-lg' : 'bg-surface border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-on-surface text-xs">{asset.name}</p>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20">
                            {asset.riskGrade}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">{asset.subTitle}</p>
                      </div>

                      <div className="text-right font-mono shrink-0">
                        <p className="text-xs font-bold text-primary">{asset.rateLabel}</p>
                        <p className="text-[10px] text-on-surface-variant">Min: ₹{asset.minAmount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Amount Input */}
            <div className="p-4 bg-surface rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-on-surface-variant">
                  {investMode === 'SIP' ? 'Monthly SIP Contribution (₹)' : 'Investment Amount (₹)'}
                </span>
                <span className="text-base font-bold text-primary font-mono">₹{currentAmount.toLocaleString('en-IN')}</span>
              </div>

              <input 
                type="number"
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono font-bold text-sm focus:outline-none focus:border-primary"
              />
            </div>

            {/* Extra Options for FD */}
            {catKey === "FIXED DEPOSITS" && (
              <div>
                <label className="font-semibold text-on-surface-variant block mb-1.5">FD Deposit Tenure</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 3, 5].map(yrs => (
                    <button
                      key={yrs}
                      type="button"
                      onClick={() => setFdTenureYears(yrs)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${fdTenureYears === yrs ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-white/10 text-on-surface-variant'}`}
                    >
                      {yrs} {yrs === 1 ? 'Year' : 'Years'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Extra Options for SIP */}
            {catKey === "MUTUAL FUNDS" && investMode === 'SIP' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">Auto-Debit Date</label>
                  <select value={sipDebitDate} onChange={e => setSipDebitDate(Number(e.target.value))} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono">
                    <option value={5}>5th of Month</option>
                    <option value={10}>10th of Month</option>
                    <option value={15}>15th of Month</option>
                    <option value={25}>25th of Month</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" checked={stepUpEnabled} onChange={e => setStepUpEnabled(e.target.checked)} className="w-4 h-4 accent-primary cursor-pointer" />
                  <span className="font-bold text-on-surface text-xs">Annual +10% Step-Up</span>
                </div>
              </div>
            )}

            {/* Live Calculation Banner */}
            <div className="p-3.5 bg-gradient-to-r from-primary/10 via-surface to-surface rounded-xl border border-primary/20 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <Calculator size={18} className="text-primary shrink-0" />
                <span className="text-xs font-bold text-on-surface">{calculationBadge}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel</button>
              <button 
                type="button" 
                onClick={handleProceedToVerify}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5"
              >
                Proceed to KYC &amp; Pay <ArrowRight size={14} />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: KYC VERIFICATION & SOURCE BANK ACCOUNT */}
        {currentStep === 2 && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-surface rounded-xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-bold text-on-surface text-xs">Investor KYC Status</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                  <ShieldCheck size={12} /> CKYC Verified (ID: CKYC-991204-IN)
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Selected Instrument:</span>
                <span className="font-bold text-on-surface">{selectedAsset.name}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Total Investment Debit:</span>
                <span className="font-bold text-primary font-mono text-sm">₹{currentAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Source Account Picker */}
            <div className="space-y-1.5">
              <label className="font-semibold text-on-surface-variant block">Source Bank Account</label>
              <div className="p-3.5 bg-surface-container-high rounded-xl border border-primary/30 flex items-center justify-between font-mono">
                <div>
                  <p className="font-bold text-on-surface text-xs">Primary Savings Account (ACC-001)</p>
                  <p className="text-[11px] text-on-surface-variant">•••• 8812 • HDFC Bank</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-on-surface-variant block">Available Balance</span>
                  <span className="text-xs font-bold text-green-400">₹{currentAccBalance.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-surface-container-high rounded-xl border border-white/5 text-[11px] text-on-surface-variant flex items-center gap-2">
              <Info size={16} className="text-tertiary shrink-0" />
              <span>Instant order routing to stock exchange &amp; fund house. Zero exit load options.</span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/5">
              <button type="button" onClick={() => setCurrentStep(1)} className="px-4 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Back</button>
              <button 
                type="button" 
                disabled={isSubmitting}
                onClick={handleConfirmInvestment}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5 disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing Investment...
                  </>
                ) : (
                  <>
                    Confirm &amp; Debit ₹{currentAmount.toLocaleString('en-IN')} <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {currentStep === 3 && (
          <div className="flex flex-col items-center text-center py-6 gap-3">
            <div className="w-16 h-16 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-lg font-bold text-on-surface">Investment Executed Successfully!</h3>
            <p className="text-xs text-on-surface-variant max-w-md">
              Your investment of <strong className="text-primary font-mono">₹{currentAmount.toLocaleString('en-IN')}</strong> in <strong>{selectedAsset.name}</strong> has been confirmed and added to your portfolio.
            </p>
            <div className="p-3 bg-surface rounded-xl border border-white/5 font-mono text-xs text-on-surface-variant my-2">
              Updated Account Balance: <strong className="text-green-400 font-bold">₹{(currentAccBalance - currentAmount).toLocaleString('en-IN')}</strong>
            </div>
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]"
            >
              Done &amp; View Holdings
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

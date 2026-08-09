"use client";
import React, { useState, useEffect } from 'react';
import IntlTransferHeader from './IntlTransferHeader';
import IntlStep1Recipient from './IntlStep1Recipient';
import IntlStep2Amount from './IntlStep2Amount';
import IntlStep3Purpose from './IntlStep3Purpose';
import IntlStep4Review from './IntlStep4Review';
import IntlTransferRightSidebar from './IntlTransferRightSidebar';
import IntlTransferBenefits from './IntlTransferBenefits';
import { IntlBeneficiary, ExchangeRate } from '../../../types';
import { MockApi } from '../../../lib/mockApi';
import { Skeleton } from '../../ui/skeleton';
import { Card } from '../../ui/card';
import { CheckCircle2, Download, Share2, Plus, Home } from 'lucide-react';
import Link from 'next/link';

export default function IntlTransferWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [beneficiaries, setBeneficiaries] = useState<IntlBeneficiary[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Transfer State
  const [selectedRecipient, setSelectedRecipient] = useState<IntlBeneficiary | null>(null);
  const [amountInr, setAmountInr] = useState<string>("");
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [purpose, setPurpose] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [bens, rates] = await Promise.all([
        MockApi.getIntlBeneficiaries(),
        MockApi.getExchangeRates()
      ]);
      setBeneficiaries(bens);
      setExchangeRates(rates);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleNext = () => {
    if (currentStep === 4) {
      setIsSuccess(true);
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleEdit = (step: number) => setCurrentStep(step);
  const handleReset = () => {
    setCurrentStep(1);
    setSelectedRecipient(null);
    setAmountInr("");
    setTargetCurrency("USD");
    setPurpose("");
    setIsSuccess(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <Skeleton className="h-[100px] w-full rounded-xl" />
        <div className="flex flex-col lg:flex-row gap-6">
          <Skeleton className="flex-1 h-[500px] rounded-xl" />
          <Skeleton className="w-full lg:w-[320px] xl:w-[380px] h-[500px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (isSuccess) {
    const transactionId = `INTL-${Math.floor(Math.random() * 900000) + 100000}`;
    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const currentRate = exchangeRates.find(r => r.currency === targetCurrency)?.rate || 83.42;
    const foreignValue = (parseFloat(amountInr) / currentRate).toFixed(2);
    const formatCurrency = (val: string | number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(typeof val === 'string' ? parseFloat(val) : val);

    return (
      <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
        <Card className="w-full flex flex-col items-center border border-outline-variant/10 bg-surface-container shadow-sm overflow-hidden py-12 px-6">
          <div className="flex flex-col items-center gap-4 text-center max-w-md w-full">
            <div className="w-20 h-20 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(76,175,80,0.2)]">
              <CheckCircle2 size={40} />
            </div>
            
            <h2 className="font-headline-lg text-[28px] font-bold text-on-surface">Transfer Initiated!</h2>
            <p className="text-[14px] text-on-surface-variant">
              Your international transfer is being processed. It should reach {selectedRecipient?.name} in 2-4 business days.
            </p>

            <div className="w-full bg-surface-container-low rounded-2xl border border-outline-variant/10 p-6 flex flex-col gap-4 mt-4 shadow-sm text-left">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/10">
                <span className="text-[12px] text-on-surface-variant uppercase tracking-wider font-medium">Transaction ID</span>
                <span className="text-[14px] font-mono text-on-surface font-semibold">{transactionId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-on-surface-variant">Amount Sent</span>
                <span className="text-[16px] font-bold text-on-surface">{formatCurrency(amountInr)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-on-surface-variant">Amount Received</span>
                <span className="text-[18px] font-display-sm font-bold text-tertiary">{foreignValue} {targetCurrency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-on-surface-variant">To</span>
                <div className="flex flex-col items-end">
                  <span className="text-[14px] font-semibold text-on-surface">{selectedRecipient?.name}</span>
                  <span className="text-[12px] text-on-surface-variant">{selectedRecipient?.country}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-dashed border-outline-variant/20">
                <span className="text-[13px] text-on-surface-variant">Date & Time</span>
                <span className="text-[13px] font-medium text-on-surface">{timestamp}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <Button variant="outline" className="h-[48px] bg-surface border-outline-variant/20 hover:bg-surface-high font-medium flex items-center gap-2">
                <Download size={16} /> Download
              </Button>
              <Button variant="outline" className="h-[48px] bg-surface border-outline-variant/20 hover:bg-surface-high font-medium flex items-center gap-2">
                <Share2 size={16} /> Share
              </Button>
              <Button onClick={handleReset} className="col-span-2 h-[48px] bg-primary text-on-primary font-bold hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-shadow flex items-center gap-2">
                <Plus size={16} /> Make Another Transfer
              </Button>
              <Link href="/" className="col-span-2 h-[48px] flex items-center justify-center gap-2 text-[14px] font-medium text-primary hover:underline">
                <Home size={16} /> Back to Dashboard
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <IntlTransferHeader currentStep={currentStep} />
      
      <div className="flex flex-col lg:flex-row gap-6 w-full items-start mt-2">
        <div className="flex-1 flex flex-col w-full">
          {currentStep === 1 && (
            <IntlStep1Recipient 
              beneficiaries={beneficiaries}
              selectedRecipient={selectedRecipient}
              onSelectRecipient={setSelectedRecipient}
              onNext={handleNext}
              onCancel={() => window.location.href = '/transfers'}
            />
          )}
          {currentStep === 2 && (
            <IntlStep2Amount 
              amountInr={amountInr}
              setAmountInr={setAmountInr}
              targetCurrency={targetCurrency}
              setTargetCurrency={setTargetCurrency}
              exchangeRates={exchangeRates}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <IntlStep3Purpose 
              purpose={purpose}
              setPurpose={setPurpose}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <IntlStep4Review 
              recipient={selectedRecipient}
              amountInr={amountInr}
              targetCurrency={targetCurrency}
              exchangeRates={exchangeRates}
              purpose={purpose}
              onNext={handleNext}
              onBack={handleBack}
              onEdit={handleEdit}
            />
          )}
        </div>

        <IntlTransferRightSidebar 
          currentStep={currentStep}
          recipient={selectedRecipient}
          amountInr={amountInr}
          targetCurrency={targetCurrency}
          exchangeRates={exchangeRates}
          purpose={purpose}
        />
      </div>

      <IntlTransferBenefits />
    </div>
  );
}

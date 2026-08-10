"use client";
import React, { useState, useEffect } from 'react';
import FundTransferHeader from './FundTransferHeader';
import Step1Recipient from './Step1Recipient';
import Step2Amount from './Step2Amount';
import Step3Review from './Step3Review';
import Step4Success from './Step4Success';
import TransferSummarySidebar from './TransferSummarySidebar';
import { Account, Beneficiary } from '../../../types';
import { useAccounts } from '../../../context/AccountContext';
import { MockApi } from '../../../lib/mockApi';
import { Skeleton } from '../../ui/skeleton';

export default function FundTransferWizard() {
  const { accounts: contextAccounts } = useAccounts();
  const [currentStep, setCurrentStep] = useState(1);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Transfer State
  const [fromAccount, setFromAccount] = useState<Account | undefined>();
  const [toRecipient, setToRecipient] = useState<Beneficiary | Account | undefined>();
  const [amount, setAmount] = useState<string>("");
  const [transferMode, setTransferMode] = useState("IMPS");
  const [paymentResult, setPaymentResult] = useState<{ paymentId?: string; orderId?: string; timestamp?: string } | null>(null);

  useEffect(() => {
    const loadBens = async () => {
      const bens = await MockApi.getBeneficiaries();
      setBeneficiaries(bens);
    };
    loadBens();
  }, []);

  useEffect(() => {
    const validAccs = contextAccounts.filter(a => a.type === 'SAVINGS' || a.type === 'CURRENT');
    setAccounts(validAccs);
    if (validAccs.length > 0 && !fromAccount) {
      setFromAccount(validAccs[0]);
    }
    setIsLoading(false);
  }, [contextAccounts]);

  const fee = transferMode === "IMPS" && parseFloat(amount) > 0 ? 5 : 0;

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleEdit = (step: number) => setCurrentStep(step);
  const handleReset = () => {
    setCurrentStep(1);
    setToRecipient(undefined);
    setAmount("");
    setTransferMode("IMPS");
    setPaymentResult(null);
  };

  const handlePaymentSuccess = (res?: { paymentId?: string; orderId?: string; timestamp?: string }) => {
    if (res) setPaymentResult(res);
    handleNext();
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

  return (
    <div className="flex flex-col gap-6 w-full">
      <FundTransferHeader currentStep={currentStep} />
      
      <div className="flex flex-col lg:flex-row gap-6 w-full items-start mt-2">
        <div className="flex-1 flex flex-col w-full">
          {currentStep === 1 && (
            <Step1Recipient 
              accounts={accounts}
              beneficiaries={beneficiaries}
              fromAccount={fromAccount}
              toRecipient={toRecipient}
              onFromAccountSelect={setFromAccount}
              onToRecipientSelect={setToRecipient}
              onNext={handleNext}
              onCancel={() => window.location.href = '/'}
            />
          )}
          {currentStep === 2 && (
            <Step2Amount 
              amount={amount}
              setAmount={setAmount}
              transferMode={transferMode}
              setTransferMode={setTransferMode}
              fromAccount={fromAccount}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <Step3Review 
              fromAccount={fromAccount}
              toRecipient={toRecipient}
              amount={amount}
              transferMode={transferMode}
              fee={fee}
              onNext={handlePaymentSuccess}
              onBack={handleBack}
              onEdit={handleEdit}
            />
          )}
          {currentStep === 4 && (
            <Step4Success 
              fromAccount={fromAccount}
              toRecipient={toRecipient}
              amount={amount}
              transferMode={transferMode}
              fee={fee}
              paymentResult={paymentResult}
              onReset={handleReset}
            />
          )}
        </div>

        {currentStep < 4 && (
          <TransferSummarySidebar 
            currentStep={currentStep}
            fromAccount={fromAccount}
            toRecipient={toRecipient}
            amount={amount}
            transferMode={transferMode}
            fee={fee}
          />
        )}
      </div>
    </div>
  );
}

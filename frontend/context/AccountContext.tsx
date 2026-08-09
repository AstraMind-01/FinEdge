"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Account, Transaction, VerificationState } from "../types";
import { MockApi } from "../lib/mockApi";

interface AccountContextType {
  accounts: Account[];
  totalBalance: number;
  verificationStates: Record<string, VerificationState>;
  selectedAccountId: string | null;
  transactions: Transaction[];
  isLoading: boolean;
  
  selectAccount: (id: string) => void;
  requestVerification: (id: string) => void;
  verifyAccount: (id: string) => Promise<boolean>;
  hideBalance: (id: string) => void;
  executeTransfer: (from: string, to: string, amount: number) => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [verificationStates, setVerificationStates] = useState<Record<string, VerificationState>>({});
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccounts = async () => {
    setIsLoading(true);
    const data = await MockApi.getAccounts();
    setAccounts(data);
    
    const initialStates: Record<string, VerificationState> = {};
    data.forEach(acc => {
      if (!verificationStates[acc.id]) {
        initialStates[acc.id] = "NOT_VERIFIED";
      }
    });
    setVerificationStates(prev => ({ ...initialStates, ...prev }));
    
    if (data.length > 0 && !selectedAccountId) {
      setSelectedAccountId(data[0].id);
      fetchTransactions(data[0].id);
    }
    setIsLoading(false);
  };

  const fetchTransactions = async (accountId: string) => {
    const data = await MockApi.getTransactions(accountId);
    setTransactions(data);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const selectAccount = (id: string) => {
    setSelectedAccountId(id);
    fetchTransactions(id);
  };

  const requestVerification = (id: string) => {
    setVerificationStates(prev => ({ ...prev, [id]: "VERIFICATION_REQUIRED" }));
  };

  const verifyAccount = async (id: string) => {
    setVerificationStates(prev => ({ ...prev, [id]: "VERIFYING" }));
    try {
      const token = await MockApi.requestBalanceAccess(id);
      const success = await MockApi.verifyBalanceAccess(id, token);
      if (success) {
        setVerificationStates(prev => ({ ...prev, [id]: "VERIFIED" }));
        return true;
      }
    } catch (e) {}
    setVerificationStates(prev => ({ ...prev, [id]: "FAILED" }));
    return false;
  };

  const hideBalance = (id: string) => {
    setVerificationStates(prev => ({ ...prev, [id]: "NOT_VERIFIED" }));
  };

  const executeTransfer = async (from: string, to: string, amount: number) => {
    await MockApi.transferFunds(from, to, amount);
    await fetchAccounts();
    if (selectedAccountId) {
      await fetchTransactions(selectedAccountId);
    }
  };

  return (
    <AccountContext.Provider value={{
      accounts,
      totalBalance,
      verificationStates,
      selectedAccountId,
      transactions,
      isLoading,
      selectAccount,
      requestVerification,
      verifyAccount,
      hideBalance,
      executeTransfer
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (!context) throw new Error("useAccounts must be used within AccountProvider");
  return context;
}

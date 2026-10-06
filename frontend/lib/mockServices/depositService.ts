import { Deposit, Account } from "../../types";
import { accounts, depositsStore, transactions, delay } from "../mockData/initialData";

let depositsList = depositsStore;

export const DepositMockService = {
  getDeposits: async (): Promise<Deposit[]> => {
    await delay(300);
    return depositsList;
  },

  openNewDeposit: async (data: {
    name: string;
    type: "FD" | "RD";
    principalAmount: number;
    monthlyInstallment?: number;
    tenureYears: number;
    interestRate: number;
  }): Promise<{ deposit: Deposit; newBalance: number }> => {
    await delay(800);
    const amountToDebit = data.type === "FD" ? data.principalAmount : (data.monthlyInstallment || 10000);

    if (accounts.length > 0) {
      accounts[0].balance = Math.max(0, accounts[0].balance - amountToDebit);
    }
    const newBal = accounts[0]?.balance || 525430.5;

    const startDate = new Date().toISOString().split("T")[0];
    const maturityDate = new Date(Date.now() + data.tenureYears * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const maturityAmount = Math.round(
      data.principalAmount * Math.pow(1 + data.interestRate / 100 / 4, 4 * data.tenureYears)
    );

    const newDep: Deposit = {
      id: `${data.type}-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name,
      type: data.type,
      principalAmount: data.principalAmount,
      monthlyDepositAmount: data.monthlyInstallment,
      monthlyInstallment: data.monthlyInstallment,
      interestRate: data.interestRate,
      startDate,
      maturityDate,
      maturityAmount,
      totalDepositedAmount: amountToDebit,
      accumulatedAmount: amountToDebit,
      nextDueDate:
        data.type === "RD"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          : undefined,
      status: "ACTIVE",
    };

    depositsList.unshift(newDep);

    transactions.unshift({
      id: `TX-DEP-${Date.now()}`,
      accountId: "ACC-001",
      merchantName: `Opened ${data.type} - ${data.name}`,
      amount: -amountToDebit,
      date: "Just now",
      type: "DEBIT",
      category: "Deposit",
    });

    return { deposit: newDep, newBalance: newBal };
  },

  breakDeposit: async (depositId: string): Promise<{ refundAmount: number; newBalance: number }> => {
    await delay(800);
    const target = depositsList.find((d) => d.id === depositId);
    const refundAmount = target
      ? Math.round(target.accumulatedAmount || target.principalAmount)
      : 100000;

    depositsList = depositsList.filter((d) => d.id !== depositId);

    if (accounts.length > 0) {
      accounts[0].balance += refundAmount;
    }
    const newBal = accounts[0]?.balance || 625430.5;

    transactions.unshift({
      id: `TX-BRK-${Date.now()}`,
      accountId: "ACC-001",
      merchantName: `Liquidated FD - ${target?.name || depositId}`,
      amount: refundAmount,
      date: "Just now",
      type: "CREDIT",
      category: "Deposit",
    });

    return { refundAmount, newBalance: newBal };
  },

  payRdInstallment: async (depositId: string): Promise<{ updatedRd: Deposit; newBalance: number }> => {
    await delay(800);
    const target = depositsList.find((d) => d.id === depositId);
    const installmentAmt =
      target?.monthlyInstallment || target?.monthlyDepositAmount || 10000;

    if (accounts.length > 0) {
      accounts[0].balance = Math.max(0, accounts[0].balance - installmentAmt);
    }
    const newBal = accounts[0]?.balance || 525430.5;

    if (target) {
      target.accumulatedAmount = (target.accumulatedAmount || 0) + installmentAmt;
      target.totalDepositedAmount = (target.totalDepositedAmount || 0) + installmentAmt;
      target.nextDueDate = "01 Oct 2026";
    }

    transactions.unshift({
      id: `TX-RD-${Date.now()}`,
      accountId: "ACC-001",
      merchantName: `RD Installment - ${target?.name || depositId}`,
      amount: -installmentAmt,
      date: "Just now",
      type: "DEBIT",
      category: "Deposit",
    });

    return { updatedRd: target!, newBalance: newBal };
  },

  createFixedDeposit: async (
    sourceAccountId: string,
    amount: number,
    tenureMonths: number,
    interestRate: number
  ): Promise<Account> => {
    await delay(1000);
    const source = accounts.find((a) => a.id === sourceAccountId);
    if (!source) throw new Error("Source account not found");
    if (source.status !== "ACTIVE") throw new Error("Source account is not active");
    if (source.balance < amount) throw new Error("Insufficient balance to open FD");

    source.balance -= amount;

    const fdNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const maturityYear = new Date().getFullYear() + Math.ceil(tenureMonths / 12);
    const maturityDate = `${maturityYear}-12-31`;

    const newFd: Account = {
      id: `FD-${Date.now()}`,
      type: "FIXED_DEPOSIT",
      name: `${tenureMonths / 12} Yr Fixed Deposit`,
      maskedNumber: `•••• ${fdNumber}`,
      lastFour: fdNumber,
      balance: amount,
      currency: "INR",
      status: "ACTIVE",
      accountHolder: source.accountHolder,
      interestRate: interestRate,
      maturityDate: maturityDate,
      ifsc: source.ifsc,
      branch: source.branch,
      openingDate: new Date().toISOString().split("T")[0],
      nominee: source.nominee,
      nomineeRelation: source.nomineeRelation,
      interestEarned: Math.round(amount * (interestRate / 100) * (tenureMonths / 12)),
    };

    accounts.push(newFd);

    transactions.unshift({
      id: `TX-${Date.now()}-FD`,
      accountId: sourceAccountId,
      merchantName: `FD Creation (${newFd.maskedNumber})`,
      amount: -amount,
      date: "Just now",
      type: "DEBIT",
      category: "Transfer",
    });

    return newFd;
  },
};

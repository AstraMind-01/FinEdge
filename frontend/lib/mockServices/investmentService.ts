import { Holding, SIP, InvestmentGoal, PortfolioDataPoint } from "../../types";
import { accounts, holdings, sips, goals, portfolioData, transactions, delay } from "../mockData/initialData";

export const InvestmentMockService = {
  getHoldings: async (): Promise<Holding[]> => {
    await delay(300);
    return [...holdings];
  },

  getSIPs: async (): Promise<SIP[]> => {
    await delay(300);
    return [...sips];
  },

  getInvestmentGoals: async (): Promise<InvestmentGoal[]> => {
    await delay(300);
    return [...goals];
  },

  getPortfolioData: async (): Promise<PortfolioDataPoint[]> => {
    await delay(200);
    return [...portfolioData];
  },

  executeInvestment: async (params: {
    category: string;
    assetName: string;
    amount: number;
    investType: "SIP" | "LUMP";
    navOrPrice?: number;
    tenureYears?: number;
  }): Promise<{ holding?: Holding; sip?: SIP; newBalance: number }> => {
    await delay(800);
    if (accounts.length > 0) {
      accounts[0].balance = Math.max(0, accounts[0].balance - params.amount);
    }
    const newBal = accounts[0]?.balance || 525430.5;

    transactions.unshift({
      id: `TX-INV-${Date.now()}`,
      accountId: "ACC-001",
      merchantName: `Investment - ${params.assetName}`,
      amount: -params.amount,
      date: "Just now",
      type: "DEBIT",
      category: "Investment",
    });

    let newHolding: Holding | undefined;
    let newSip: SIP | undefined;

    if (params.investType === "SIP") {
      newSip = {
        id: `SIP-${Date.now()}`,
        fundName: params.assetName,
        fundHouse: `${params.category} Portfolio`,
        category: params.category,
        nav: params.navOrPrice || 50.0,
        returns3Y: 18.5,
        rating: 5,
        riskGrade: "Moderate to High",
        amount: params.amount,
        monthlyAmount: params.amount,
        frequency: "Monthly (10th)",
        debitDate: 10,
        nextDebitDate: "10 Sep 2026",
        status: "ACTIVE",
        totalInvested: params.amount,
        currentValue: params.amount,
        installmentsPaid: 1,
        stepUpPercent: 10,
        linkedAccount: "Primary Savings ACC-001 •••• 8812",
        folioNumber: `FOL-${Math.floor(100000 + Math.random() * 900000)}-IN`,
      };
      sips.unshift(newSip);
    } else {
      const price = params.navOrPrice || 100;
      const unitsCalculated = Math.round((params.amount / price) * 100) / 100;
      newHolding = {
        id: `HLD-${Date.now()}`,
        name: params.assetName,
        category: params.category,
        units: unitsCalculated,
        avgNav: price,
        currentNav: price * 1.02,
        investedAmount: params.amount,
        currentValue: Math.round(params.amount * 1.02),
        returnAmount: Math.round(params.amount * 0.02),
        returnPercent: 2.0,
        returns3Y: 15.4,
        rating: 5,
        type: params.investType,
        folioNumber: `HLD-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      holdings.unshift(newHolding);
    }

    return { holding: newHolding, sip: newSip, newBalance: newBal };
  },

  investMutualFund: async (
    accountId: string,
    fundName: string,
    amount: number,
    isSip: boolean
  ): Promise<boolean> => {
    await delay(800);
    const account = accounts.find((a) => a.id === accountId);
    if (!account) throw new Error("Account not found");
    if (account.status !== "ACTIVE") throw new Error("Account is not active");
    if (account.balance < amount) throw new Error("Insufficient balance for investment");

    account.balance -= amount;
    transactions.unshift({
      id: `TX-${Date.now()}-INV`,
      accountId: accountId,
      merchantName: `${isSip ? "SIP" : "Lump-sum"}: ${fundName}`,
      amount: -amount,
      date: "Just now",
      type: "DEBIT",
      category: "Investment",
    });
    return true;
  },
};

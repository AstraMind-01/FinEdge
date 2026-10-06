import { PortfolioDataPoint } from "../../types";

export const portfolioRangeData: Record<string, PortfolioDataPoint[]> = {
  "1M": [
    { month: "Week 1", value: 415000 },
    { month: "Week 2", value: 420000 },
    { month: "Week 3", value: 422000 },
    { month: "Week 4", value: 427450 }
  ],
  "3M": [
    { month: "Jun", value: 395000 },
    { month: "Jul", value: 410000 },
    { month: "Aug", value: 427450 }
  ],
  "6M": [
    { month: "Mar", value: 340000 },
    { month: "Apr", value: 355000 },
    { month: "May", value: 370000 },
    { month: "Jun", value: 395000 },
    { month: "Jul", value: 410000 },
    { month: "Aug", value: 427450 }
  ],
  "1Y": [
    { month: "Sep", value: 290000 },
    { month: "Nov", value: 305000 },
    { month: "Jan", value: 310000 },
    { month: "Mar", value: 340000 },
    { month: "May", value: 370000 },
    { month: "Jul", value: 410000 },
    { month: "Aug", value: 427450 }
  ],
  "All": [
    { month: "2023", value: 180000 },
    { month: "2024", value: 260000 },
    { month: "2025", value: 350000 },
    { month: "2026", value: 427450 }
  ]
};

export const COLORS = ['#F0B429', '#6366f1', '#14b8a6', '#f97316', '#ef4444'];

export const categoryColors: Record<string, string> = {
  "Large Cap Mutual Fund": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Small Cap Mutual Fund": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Flexi Cap Mutual Fund": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Equity Stock": "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

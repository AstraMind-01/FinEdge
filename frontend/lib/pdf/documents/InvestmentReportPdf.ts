import { FinEdgeDocumentTemplate, CustomerInfo } from '../FinEdgeDocumentTemplate';
import { PdfTable } from '../PdfTable';
import { PdfUtils } from '../PdfUtils';
import { UserProfile } from '../../../types';

export interface InvestmentReportData {
  userProfile?: Partial<UserProfile>;
  totalPortfolioValue: number;
  monthlySipAmount: number;
  activeSipCount: number;
  holdings: { name: string; category: string; units: number; investedAmount: number; currentValue: number; returnPct: number }[];
}

export const InvestmentReportPdfBuilder = {
  generate(data: InvestmentReportData) {
    const docId = PdfUtils.generateDocumentId('INV');
    const template = new FinEdgeDocumentTemplate('INVESTMENT PORTFOLIO REPORT', {
      documentId: docId,
      documentType: 'INVESTMENT_REPORT',
      dateStr: PdfUtils.formatDate(new Date())
    }, 'p');

    const customerInfo: CustomerInfo = {
      name: data.userProfile?.name || 'Alex Johnson',
      accountNumber: 'INVEST-FOLIO-7721',
      accountType: 'Wealth & Investment Portfolio',
      status: 'ACTIVE PORTFOLIO'
    };
    template.addCustomerInfo(customerInfo);

    // Section 1: Portfolio Summary
    template.addSectionTitle('PORTFOLIO VALUATION SUMMARY');
    template.addKeyValuePairs([
      { label: 'Total Portfolio Value', value: PdfUtils.formatCurrency(data.totalPortfolioValue) },
      { label: 'Active Monthly SIP', value: PdfUtils.formatCurrency(data.monthlySipAmount) },
      { label: 'Active SIP Count', value: `${data.activeSipCount} Active Funds` },
      { label: 'Annual Portfolio Return', value: '+14.2% CAGR' },
      { label: 'Asset Allocation', value: '68.5% Equity / 31.5% Debt & FD' }
    ]);

    // Section 2: Holdings Breakdown Table
    template.addSectionTitle('INVESTMENT HOLDINGS & RETURNS');
    const headers = [['Instrument Name', 'Asset Type', 'Units', 'Invested (₹)', 'Current Value (₹)', 'Return (%)']];
    const rows = data.holdings.map(h => [
      h.name,
      h.category,
      String(h.units),
      PdfUtils.formatCurrency(h.investedAmount),
      PdfUtils.formatCurrency(h.currentValue),
      `+${h.returnPct.toFixed(1)}%`
    ]);

    PdfTable.drawTable(template, headers, rows);

    template.addSecurityNotice(true);
    template.save(`FinEdge_Investment_Report_${docId}.pdf`);
  }
};

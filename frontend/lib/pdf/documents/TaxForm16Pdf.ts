import { FinEdgeDocumentTemplate, CustomerInfo } from '../FinEdgeDocumentTemplate';
import { PdfTable } from '../PdfTable';
import { PdfUtils } from '../PdfUtils';
import { Account, UserProfile } from '../../../types';

export const TaxForm16PdfBuilder = {
  generate(
    userProfile: UserProfile,
    accounts: Account[],
    financialYear: string = "2025-26",
    assessmentYear: string = "2026-27"
  ) {
    const docId = PdfUtils.generateDocumentId('CERT');
    const template = new FinEdgeDocumentTemplate('FORM 16A / 26AS TAX CERTIFICATE', {
      documentId: docId,
      documentType: 'ANNUAL_INTEREST_STATEMENT',
      dateStr: PdfUtils.formatDate(new Date())
    }, 'p');

    // Customer Info
    const customerInfo: CustomerInfo = {
      name: userProfile.name,
      accountNumber: accounts[0]?.maskedNumber || 'CUST-TAX-9912',
      status: 'TAX CERTIFIED'
    };
    template.addCustomerInfo(customerInfo);

    // Section 1: Taxpayer & Bank Metadata
    template.addSectionTitle('TAXPAYER & DEDUCTOR IDENTIFICATION DETAILS');
    template.addKeyValuePairs([
      { label: 'Taxpayer Name', value: userProfile.name },
      { label: 'Customer ID', value: userProfile.customerID || 'FE9842' },
      { label: 'PAN Number', value: 'ABCDE1234F' },
      { label: 'Financial Year', value: financialYear },
      { label: 'Assessment Year', value: assessmentYear },
      { label: 'Deductor Name', value: 'FinEdge Bank Limited' },
      { label: 'Deductor TAN', value: 'MUMF09182C' },
      { label: 'Issuing Branch', value: userProfile.branch || 'Mumbai Corporate' }
    ]);

    // Section 2: Account Wise Interest & TDS Breakdown
    template.addSectionTitle('ACCOUNT-WISE INTEREST EARNED & TDS DEDUCTED');

    const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
    const estimatedTotalInterest = accounts.reduce((sum, a) => sum + (a.interestEarned || Math.round((a.balance || 0) * (a.interestRate || 3.5) / 100)), 0);
    const tdsDeducted = estimatedTotalInterest > 40000 ? Math.round(estimatedTotalInterest * 0.10) : 0;

    const tableHeaders = [['Account No.', 'Account Type', 'Balance (₹)', 'Int. Rate', 'Interest Earned (₹)', 'TDS Deducted (₹)']];
    const tableData = accounts.map(a => {
      const interest = a.interestEarned || Math.round((a.balance || 0) * (a.interestRate || 3.5) / 100);
      const tds = interest > 40000 ? Math.round(interest * 0.10) : 0;
      return [
        a.maskedNumber || a.id,
        a.type || 'SAVINGS',
        `₹ ${a.balance.toLocaleString('en-IN')}`,
        `${a.interestRate || 3.5}%`,
        `₹ ${interest.toLocaleString('en-IN')}`,
        `₹ ${tds.toLocaleString('en-IN')}`
      ];
    });

    // Add Summary Row
    tableData.push([
      'TOTAL',
      'ALL ACCOUNTS',
      `₹ ${totalBalance.toLocaleString('en-IN')}`,
      '-',
      `₹ ${estimatedTotalInterest.toLocaleString('en-IN')}`,
      `₹ ${tdsDeducted.toLocaleString('en-IN')}`
    ]);

    PdfTable.drawTable(template, tableHeaders, tableData);

    // Section 3: Statutory Certification
    template.addSectionTitle('STATUTORY CERTIFICATION & TAX ADVICE');
    template.doc.setFont('helvetica', 'normal');
    template.doc.setFontSize(8.5);
    template.doc.setTextColor(60, 60, 60);

    const certificationText =
      'Certified that the interest amounts listed above have been credited to the customer\'s accounts during Financial Year ' +
      financialYear +
      '. Where applicable, Tax Deducted at Source (TDS) under Section 194A of the Income Tax Act, 1961 has been deposited to the credit of the Central Government via NSDL NISM portal. This certificate is computer-generated and requires no physical signature under Rule 31(1)(b).';

    const lines = template.doc.splitTextToSize(certificationText, 170);
    let currentY = template.getStartY();
    lines.forEach((line: string) => {
      template.doc.text(line, 20, currentY);
      currentY += 4.5;
    });

    template.setStartY(currentY + 6);
    template.addSecurityNotice(true);

    const fileName = `FinEdge_Tax_Certificate_Form16_${financialYear}.pdf`;
    template.save(fileName);
  }
};

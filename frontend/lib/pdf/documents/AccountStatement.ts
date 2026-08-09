import { FinEdgeDocumentTemplate, CustomerInfo } from '../FinEdgeDocumentTemplate';
import { PdfTable } from '../PdfTable';
import { PdfUtils } from '../PdfUtils';
import { Transaction, Account } from '../../../types';

export const AccountStatementBuilder = {
  generate(
    account: Account,
    customerName: string,
    transactions: Transaction[],
    dateRangeStr: string = 'Current Month'
  ) {
    const docId = PdfUtils.generateDocumentId('STMT');
    const template = new FinEdgeDocumentTemplate('ACCOUNT STATEMENT', {
      documentId: docId,
      documentType: 'Account_Statement',
      accountNumber: account.accountNumber,
      dateStr: PdfUtils.formatDate(new Date())
    }, 'p');

    // Add Customer Info
    const customerInfo: CustomerInfo = {
      name: customerName,
      accountNumber: account.accountNumber || account.maskedNumber || 'Unknown',
      accountType: account.type || 'Savings Account',
      status: account.status || 'Active'
    };
    template.addCustomerInfo(customerInfo);

    // Add Summary
    template.addSectionTitle('STATEMENT SUMMARY');
    template.addKeyValuePairs([
      { label: 'Statement Period', value: dateRangeStr },
      { label: 'Total Balance', value: PdfUtils.formatCurrency(account.balance) },
      { label: 'Total Transactions', value: String(transactions.length) }
    ]);

    // Add Transactions Table
    template.addSectionTitle('TRANSACTION HISTORY');
    
    if (transactions.length === 0) {
      template.doc.setFont('helvetica', 'italic');
      template.doc.setFontSize(9);
      template.doc.setTextColor(150, 150, 150);
      template.doc.text('No transactions found for this period.', 20, template.getStartY());
      template.setStartY(template.getStartY() + 10);
    } else {
      const tableHeaders = [['Date', 'Description', 'Ref ID', 'Withdrawal', 'Deposit']];
      const tableData = transactions.map(tx => {
        const isCredit = tx.type === 'CREDIT' || (tx as any).amount > 0;
        const absAmount = Math.abs(tx.amount);
        const formattedAmount = PdfUtils.formatCurrency(absAmount);
        
        return [
          PdfUtils.formatDate(tx.date || tx.timestamp),
          tx.merchantName || tx.category || 'Transaction',
          tx.referenceId || 'N/A',
          isCredit ? '' : formattedAmount,
          isCredit ? formattedAmount : ''
        ];
      });

      PdfTable.drawTable(template, tableHeaders, tableData);
    }

    // Add Security Notice
    template.addSecurityNotice(true); // Sensitive

    // Save
    template.save(`FinEdge_Account_Statement_${account.lastFour || 'Account'}.pdf`);
  }
};

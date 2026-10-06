import { FinEdgeDocumentTemplate, CustomerInfo } from '../FinEdgeDocumentTemplate';
import { PdfUtils } from '../PdfUtils';
import { Transaction } from '../../../types';

export const TransactionReceiptBuilder = {
  generate(
    transaction: Transaction,
    customerName: string,
    accountNumber: string
  ) {
    const docId = PdfUtils.generateDocumentId('REC');
    const template = new FinEdgeDocumentTemplate('TRANSACTION RECEIPT', {
      documentId: docId,
      documentType: 'Transaction_Receipt',
      referenceId: transaction.referenceId,
      dateStr: PdfUtils.formatDate(new Date())
    }, 'p');

    // Add Customer Info
    const customerInfo: CustomerInfo = {
      name: customerName,
      accountNumber: accountNumber,
    };
    template.addCustomerInfo(customerInfo);

    // Add Details
    template.addSectionTitle('TRANSACTION DETAILS');
    const isCredit = transaction.type === 'CREDIT' || (transaction as any).amount > 0;
    
    template.addKeyValuePairs([
      { label: 'Transaction ID', value: transaction.referenceId || 'N/A' },
      { label: 'Date', value: PdfUtils.formatDateTime(transaction.timestamp || transaction.date) },
      { label: 'Description', value: transaction.merchantName || 'N/A' },
      { label: 'Transaction Type', value: isCredit ? 'CREDIT / INCOMING' : 'DEBIT / OUTGOING' },
      { label: 'Category', value: transaction.category || 'Transfer' },
      { label: 'Amount', value: PdfUtils.formatCurrency(Math.abs(transaction.amount)) },
      { label: 'Status', value: transaction.status || 'COMPLETED', status: transaction.status || 'COMPLETED' },
    ]);

    // Add Security Notice
    template.addSecurityNotice(false);

    // Save
    template.save(`FinEdge_Transaction_Receipt_${transaction.referenceId || docId}.pdf`);
  }
};

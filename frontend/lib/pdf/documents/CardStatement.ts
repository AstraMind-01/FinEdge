import { FinEdgeDocumentTemplate, CustomerInfo } from '../FinEdgeDocumentTemplate';
import { PdfUtils } from '../PdfUtils';
import { PdfTable } from '../PdfTable';
import { BankCard, Transaction } from '../../../types';

export const CardStatementBuilder = {
  generate(
    card: BankCard,
    customerName: string,
    linkedAccountNumber: string,
    transactions: Transaction[] = []
  ) {
    const docId = PdfUtils.generateDocumentId('STMT');
    const template = new FinEdgeDocumentTemplate('CARD STATEMENT', {
      documentId: docId,
      documentType: 'Card_Statement',
      referenceId: card.id,
      dateStr: PdfUtils.formatDate(new Date())
    }, 'p');

    // Add Customer Info
    const customerInfo: CustomerInfo = {
      name: customerName,
      accountNumber: linkedAccountNumber,
      accountType: card.type === 'CREDIT' ? 'Credit Card' : 'Debit Card',
      status: card.status || 'Active'
    };
    template.addCustomerInfo(customerInfo);

    // Add Card Info
    template.addSectionTitle('CARD INFORMATION');
    template.addKeyValuePairs([
      { label: 'Card Number', value: card.maskedNumber },
      { label: 'Network', value: card.network },
      { label: 'Cardholder Name', value: card.cardholderName },
      { label: 'Status', value: card.status || 'ACTIVE', status: card.status || 'ACTIVE' }
    ]);

    // Add Summary
    template.addSectionTitle('STATEMENT SUMMARY');
    if (card.type === 'CREDIT') {
      template.addKeyValuePairs([
        { label: 'Outstanding Balance', value: PdfUtils.formatCurrency(card.outstandingBalance) },
        { label: 'Available Credit', value: PdfUtils.formatCurrency(card.availableCredit) },
        { label: 'Total Credit Limit', value: PdfUtils.formatCurrency(card.creditLimit) },
        { label: 'Statement Period', value: 'Current Month' }
      ]);
    } else {
      template.addKeyValuePairs([
        { label: 'Card Type', value: 'Debit Card' },
        { label: 'Statement Period', value: 'Current Month' }
      ]);
    }

    // Add Transactions Table
    template.addSectionTitle('CARD TRANSACTIONS');
    
    if (transactions.length === 0) {
      template.doc.setFont('helvetica', 'italic');
      template.doc.setFontSize(9);
      template.doc.setTextColor(150, 150, 150);
      template.doc.text('No recent card transactions found.', 20, template.getStartY());
      template.setStartY(template.getStartY() + 10);
    } else {
      const tableHeaders = [['Date', 'Description', 'Amount', 'Status']];
      const tableData = transactions.map(tx => [
        PdfUtils.formatDate(tx.date || tx.timestamp),
        tx.merchantName || 'Card Transaction',
        PdfUtils.formatCurrency(Math.abs(tx.amount)),
        tx.status || 'COMPLETED'
      ]);

      PdfTable.drawTable(template, tableHeaders, tableData);
    }

    // Add Security Notice
    template.addSecurityNotice(true);

    // Save
    template.save(`FinEdge_Card_Statement_${card.lastFour}.pdf`);
  }
};

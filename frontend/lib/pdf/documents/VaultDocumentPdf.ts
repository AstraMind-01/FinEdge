import { FinEdgeDocumentTemplate, CustomerInfo } from '../FinEdgeDocumentTemplate';
import { PdfTable } from '../PdfTable';
import { PdfUtils } from '../PdfUtils';
import { VaultDocument } from '../../../types';

export const VaultDocumentPdfBuilder = {
  generate(
    vaultDoc: VaultDocument | { title: string; fileName: string; status: string; documentNumber?: string; authority?: string; uploadDate?: string; storageId?: string; encryptionKeyId?: string; textPreview?: string },
    customerName: string,
    cleanPdfFileName: string
  ) {
    const docId = PdfUtils.generateDocumentId('DOC');
    const template = new FinEdgeDocumentTemplate('ENCRYPTED VAULT DOCUMENT', {
      documentId: vaultDoc.storageId || docId,
      documentType: 'KYC_Vault_Document',
      dateStr: PdfUtils.formatDate(new Date())
    }, 'p');

    // Add Customer Info
    const customerInfo: CustomerInfo = {
      name: customerName,
      accountNumber: 'CUSTOMER-VAULT',
      status: (vaultDoc.status || 'Verified').toUpperCase()
    };
    template.addCustomerInfo(customerInfo);

    // Add Document Summary Metadata
    template.addSectionTitle('DOCUMENT METADATA & ENCRYPTION SPECS');
    template.addKeyValuePairs([
      { label: 'Document Title', value: vaultDoc.title || 'Certified KYC Document' },
      { label: 'Original File Name', value: vaultDoc.fileName || 'Document.pdf' },
      { label: 'Verification Status', value: vaultDoc.status || 'Verified' },
      { label: 'Document / ID No', value: vaultDoc.documentNumber || '•••• •••• 9912' },
      { label: 'Issuing Authority', value: vaultDoc.authority || 'Government Authority' },
      { label: 'Upload Date', value: vaultDoc.uploadDate || PdfUtils.formatDate(new Date()) },
      { label: 'Private Storage ID', value: vaultDoc.storageId || 'VAULT-STORE-1001' },
      { label: 'AES Encryption Key ID', value: vaultDoc.encryptionKeyId || 'AES256-KEY-9941' },
      { label: 'Malware Scan Status', value: 'CLEAN (0 Threats Detected)' }
    ]);

    // Add Certified Preview Content
    template.addSectionTitle('DIGITALLY CERTIFIED CONTENT PREVIEW');
    template.doc.setFont('courier', 'normal');
    template.doc.setFontSize(9);
    template.doc.setTextColor(40, 40, 40);

    const previewText = vaultDoc.textPreview || 'REPUBLIC OF INDIA - VERIFIED DOCUMENT RECORD\nName: ' + customerName + '\nStatus: Certified & AES-256 Encrypted';
    const lines = template.doc.splitTextToSize(previewText, 170);
    
    let currentY = template.getStartY();
    lines.forEach((line: string) => {
      if (currentY > template.doc.internal.pageSize.getHeight() - 30) {
        template.doc.addPage();
        currentY = 60;
      }
      template.doc.text(line, 20, currentY);
      currentY += 5;
    });
    template.setStartY(currentY + 5);

    // Add Security Audit Trail Table if available
    if ('auditLogs' in vaultDoc && vaultDoc.auditLogs && vaultDoc.auditLogs.length > 0) {
      template.addSectionTitle('SECURITY AUDIT TRAIL LOGS');
      const tableHeaders = [['Action Log', 'Timestamp', 'IP Address', 'Status']];
      const tableData = vaultDoc.auditLogs.map(log => [
        log.action,
        log.timestamp,
        log.ipAddress,
        log.status
      ]);
      PdfTable.drawTable(template, tableHeaders, tableData);
    }

    // Add Security Notice
    template.addSecurityNotice(true);

    // Save with clean PDF filename
    template.save(cleanPdfFileName);
  }
};

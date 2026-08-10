export const PdfUtils = {
  /**
   * Generates a standardized Document ID based on the type and current date.
   * Format: FE-{TYPE}-YYYYMMDD-{RANDOM_SUFFIX}
   */
  generateDocumentId(type: string): string {
    const date = new Date();
    const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
    const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FE-${type.toUpperCase()}-${dateString}-${suffix}`;
  },

  /**
   * Masks an account number leaving only the last 4 digits visible.
   */
  maskAccountNumber(accountNumber: string | null | undefined): string {
    if (!accountNumber) return 'N/A';
    const numStr = String(accountNumber);
    if (numStr.length <= 4) return `•••• ${numStr}`;
    return `•••• ${numStr.slice(-4)}`;
  },

  /**
   * Formats a date to standard DD MMM YYYY format.
   */
  formatDate(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return 'N/A';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return String(dateStr); // fallback
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  /**
   * Formats a date and time to standard DD MMM YYYY, HH:MM AM/PM format.
   */
  formatDateTime(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return 'N/A';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return String(dateStr); // fallback
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Formats an amount as Indian Rupees (₹).
   */
  formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  }
};

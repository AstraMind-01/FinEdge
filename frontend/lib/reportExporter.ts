/**
 * FinEdge Financial Report Exporter Utility
 * Generates and downloads CSV and printable PDF financial statements based on live user data.
 */

export interface ExportData {
  timeframe: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  investments: number;
  creditScore: number;
  categoryBreakdown: { name: string; amount: number; percentage: number }[];
  transactions: { date: string; description: string; category: string; amount: number; type: 'CREDIT' | 'DEBIT' }[];
}

export function exportReportToCSV(data: ExportData, filename: string = "FinEdge_Financial_Report.csv") {
  const headers = ["Date", "Description", "Category", "Type", "Amount (INR)"];
  const rows = data.transactions.map(t => [
    `"${t.date}"`,
    `"${t.description.replace(/"/g, '""')}"`,
    `"${t.category}"`,
    `"${t.type}"`,
    t.amount.toFixed(2)
  ]);

  const csvContent = [
    `FinEdge Banking & Analytics Platform - Financial Report (${data.timeframe})`,
    `Generated on: ${new Date().toLocaleString('en-IN')}`,
    `Total Income: INR ${data.totalIncome.toLocaleString('en-IN')}`,
    `Total Expenses: INR ${data.totalExpenses.toLocaleString('en-IN')}`,
    `Net Savings: INR ${data.netSavings.toLocaleString('en-IN')}`,
    `Credit Score: ${data.creditScore}`,
    "",
    headers.join(","),
    ...rows.map(r => r.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportReportToPrintablePDF(data: ExportData, reportTitle: string = "Financial Analytics Summary Report") {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle} - FinEdge</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; padding: 40px; margin: 0; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: center; border-b: 2px solid #f0b429; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #111; }
          .logo span { color: #d99a08; }
          .subtitle { font-size: 14px; color: #666; }
          .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .metric-card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; text-align: center; }
          .metric-label { font-size: 11px; text-transform: uppercase; color: #6c757d; letter-spacing: 0.5px; }
          .metric-value { font-size: 20px; font-weight: bold; margin-top: 5px; color: #111; }
          .table-title { font-size: 16px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; border-left: 4px solid #f0b429; padding-left: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #1e293b; color: #ffffff; text-align: left; padding: 10px 12px; font-size: 12px; font-weight: 600; }
          td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .type-credit { color: #16a34a; font-weight: 600; }
          .type-debit { color: #dc2626; font-weight: 600; }
          .footer { margin-top: 40px; border-t: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Fin<span>Edge</span> Intelligent Banking</div>
            <div class="subtitle">${reportTitle} • ${data.timeframe}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #64748b;">Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div style="font-size: 11px; color: #94a3b8;">Account: Premium Savings (••••2840)</div>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Total Income</div>
            <div class="metric-value">₹${data.totalIncome.toLocaleString('en-IN')}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Expenses</div>
            <div class="metric-value">₹${data.totalExpenses.toLocaleString('en-IN')}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Net Savings</div>
            <div class="metric-value">₹${data.netSavings.toLocaleString('en-IN')}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Investments</div>
            <div class="metric-value">₹${data.investments.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div class="table-title">Category Spending Breakdown</div>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount (INR)</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${data.categoryBreakdown.map(c => `
              <tr>
                <td>${c.name}</td>
                <td>₹${c.amount.toLocaleString('en-IN')}</td>
                <td>${c.percentage}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="table-title">Recent Transactions</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${data.transactions.slice(0, 15).map(t => `
              <tr>
                <td>${t.date}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td class="${t.type === 'CREDIT' ? 'type-credit' : 'type-debit'}">${t.type}</td>
                <td class="${t.type === 'CREDIT' ? 'type-credit' : 'type-debit'}">₹${t.amount.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          FinEdge Banking & Payment Platform • Confidential Security Document • System Generated Statement
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

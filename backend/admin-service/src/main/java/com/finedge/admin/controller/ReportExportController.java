package com.finedge.admin.controller;

import com.finedge.admin.entity.Transaction;
import com.finedge.admin.repository.TransactionRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/admin/reports")
public class ReportExportController {

    private final TransactionRepository transactionRepository;

    public ReportExportController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    /**
     * Streams a CSV file of transactions directly to the HTTP response.
     * Uses OutputStreamWriter to avoid building the entire file in memory.
     */
    @GetMapping("/transactions/export")
    @PreAuthorize("hasAuthority('REPORT_GENERATE') or hasRole('SUPER_ADMIN')")
    public void exportTransactionsCsv(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String status,
            HttpServletResponse response) throws IOException {

        String timestamp = DateTimeFormatter.ofPattern("yyyyMMdd_HHmm").format(OffsetDateTime.now());
        String filename = "transactions_report_" + timestamp + ".csv";

        response.setContentType("text/csv");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
        response.setHeader(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION);

        List<Transaction> transactions = transactionRepository.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));

        // If no data, return header-only CSV with a "No data" note
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(response.getOutputStream(), StandardCharsets.UTF_8));

        // BOM for Excel compatibility
        writer.write('\uFEFF');

        // Header row
        writer.println("Transaction ID,Date,Sender Account,Receiver Account,Type,Amount,Status,Risk Score,IP Address");

        BigDecimal totalAmount = BigDecimal.ZERO;
        int rowCount = 0;

        for (Transaction txn : transactions) {
            writer.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                    escapeCsv(txn.getId() != null ? txn.getId().toString() : ""),
                    escapeCsv(txn.getTimestamp() != null ? txn.getTimestamp().toString() : ""),
                    escapeCsv(txn.getSenderAccount()),
                    escapeCsv(txn.getReceiverAccount()),
                    escapeCsv(txn.getType()),
                    txn.getAmount() != null ? txn.getAmount().toPlainString() : "0.00",
                    escapeCsv(txn.getStatus()),
                    txn.getRiskScore() != null ? txn.getRiskScore().toPlainString() : "N/A",
                    escapeCsv(txn.getIpAddress())
            );
            if (txn.getAmount() != null) {
                totalAmount = totalAmount.add(txn.getAmount());
            }
            rowCount++;
        }

        // Summary footer
        writer.println();
        writer.printf("Total Records:,%d,,,,Total Amount:,%s,,%n", rowCount, totalAmount.toPlainString());

        writer.flush();
        writer.close();
    }

    /**
     * Escapes a CSV field: wraps in double quotes if it contains commas, quotes, or newlines.
     */
    private String escapeCsv(String field) {
        if (field == null) return "";
        if (field.contains(",") || field.contains("\"") || field.contains("\n")) {
            return "\"" + field.replace("\"", "\"\"") + "\"";
        }
        return field;
    }
}

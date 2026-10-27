package com.finedge.admin.worker;

import com.finedge.admin.entity.GeneratedReport;
import com.finedge.admin.repository.GeneratedReportRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Component
@ConditionalOnProperty(name = "spring.rabbitmq.host")
public class ReportWorker {

    private static final Logger logger = LoggerFactory.getLogger(ReportWorker.class);
    private final GeneratedReportRepository reportRepository;

    public ReportWorker(GeneratedReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @RabbitListener(queues = "report_generation_queue")
    @Transactional
    public void generateReport(String reportIdStr) {
        logger.info("Received request to generate report ID: {}", reportIdStr);
        try {
            UUID reportId = UUID.fromString(reportIdStr);
            GeneratedReport report = reportRepository.findById(reportId)
                    .orElseThrow(() -> new IllegalArgumentException("Report not found"));
            
            // Mocking the generation of PDF/Excel and uploading to S3
            Thread.sleep(2000); 

            report.setStatus(GeneratedReport.Status.READY);
            report.setFilePath("s3://finedge-reports/" + reportId + "." + report.getFormat());
            report.setExpiresAt(OffsetDateTime.now().plusDays(7));
            
            reportRepository.save(report);
            logger.info("Report {} generated successfully.", reportIdStr);
        } catch (Exception e) {
            logger.error("Failed to generate report {}", reportIdStr, e);
            // Fallback status logic here...
        }
    }
}

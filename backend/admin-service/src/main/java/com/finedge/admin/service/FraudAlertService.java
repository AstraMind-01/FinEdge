package com.finedge.admin.service;

import com.finedge.admin.entity.FraudAlert;
import com.finedge.admin.repository.FraudAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class FraudAlertService {

    private final FraudAlertRepository fraudAlertRepository;

    public FraudAlertService(FraudAlertRepository fraudAlertRepository) {
        this.fraudAlertRepository = fraudAlertRepository;
    }

    @Transactional
    public FraudAlert resolveAlert(UUID id, String resolutionNotes) {
        FraudAlert alert = fraudAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setStatus(FraudAlert.Status.RESOLVED);
        alert.setResolutionNotes(resolutionNotes);
        alert.setResolvedAt(OffsetDateTime.now());
        return fraudAlertRepository.save(alert);
    }
}

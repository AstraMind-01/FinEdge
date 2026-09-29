package com.finedge.admin.service;

import com.finedge.admin.entity.KycApplication;
import com.finedge.admin.entity.AdminUser;
import com.finedge.admin.repository.KycApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class KycService {

    private final KycApplicationRepository kycRepository;

    public KycService(KycApplicationRepository kycRepository) {
        this.kycRepository = kycRepository;
    }

    @Transactional
    public KycApplication approveApplication(UUID id, AdminUser adminUser) {
        KycApplication application = kycRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KYC Application not found"));
        application.setStatus(KycApplication.Status.APPROVED);
        application.setReviewedBy(adminUser);
        application.setReviewedAt(OffsetDateTime.now());
        
        // Also update the User's KYC status
        application.getUser().setKycStatus(com.finedge.admin.entity.User.KycStatus.VERIFIED);
        
        return kycRepository.save(application);
    }
}

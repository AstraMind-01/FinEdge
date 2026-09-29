package com.finedge.admin.service;

import com.finedge.admin.entity.ApprovalRequest;
import com.finedge.admin.entity.AdminUser;
import com.finedge.admin.repository.ApprovalRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ApprovalService {

    private final ApprovalRequestRepository approvalRepository;

    public ApprovalService(ApprovalRequestRepository approvalRepository) {
        this.approvalRepository = approvalRepository;
    }

    @Transactional
    public ApprovalRequest processApproval(UUID id, AdminUser currentAdmin) {
        ApprovalRequest request = approvalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Approval Request not found"));

        if (request.getFirstApprover() == null) {
            request.setFirstApprover(currentAdmin);
            request.setStatus(ApprovalRequest.Status.PARTIALLY_APPROVED);
        } else if (request.getSecondApprover() == null) {
            // Maker-checker dual control rule
            if (request.getFirstApprover().getId().equals(currentAdmin.getId())) {
                throw new RuntimeException("Second approver must be different from first approver");
            }
            request.setSecondApprover(currentAdmin);
            request.setStatus(ApprovalRequest.Status.APPROVED);
            
            // Trigger the actual business logic for the approved action here
        }

        return approvalRepository.save(request);
    }
}

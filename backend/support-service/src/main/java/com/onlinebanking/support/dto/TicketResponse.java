package com.onlinebanking.support.dto;

import com.onlinebanking.support.model.TicketCategory;
import com.onlinebanking.support.model.TicketPriority;
import com.onlinebanking.support.model.TicketStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {
    private String ticketId;
    private String userId;
    private String conversationId;
    private TicketCategory category;
    private String issueSummary;
    private String transactionId;
    private TicketPriority priority;
    private TicketStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

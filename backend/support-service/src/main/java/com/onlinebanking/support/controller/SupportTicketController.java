package com.onlinebanking.support.controller;

import com.onlinebanking.support.dto.TicketResponse;
import com.onlinebanking.support.model.SupportTicket;
import com.onlinebanking.support.repository.SupportTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/support/tickets")
@CrossOrigin(origins = "*")
public class SupportTicketController {

    @Autowired
    private SupportTicketRepository ticketRepository;

    @GetMapping("/{ticketId}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable String ticketId, @RequestParam(required = false) String userId) {
        Optional<SupportTicket> opt = userId != null 
                ? ticketRepository.findByTicketIdAndUserId(ticketId, userId)
                : ticketRepository.findByTicketId(ticketId);

        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SupportTicket t = opt.get();
        TicketResponse res = TicketResponse.builder()
                .ticketId(t.getTicketId())
                .userId(t.getUserId())
                .conversationId(t.getConversationId())
                .category(t.getCategory())
                .issueSummary(t.getIssueSummary())
                .transactionId(t.getTransactionId())
                .priority(t.getPriority())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();

        return ResponseEntity.ok(res);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TicketResponse>> getUserTickets(@PathVariable String userId) {
        List<SupportTicket> list = ticketRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<TicketResponse> res = list.stream().map(t -> TicketResponse.builder()
                .ticketId(t.getTicketId())
                .userId(t.getUserId())
                .conversationId(t.getConversationId())
                .category(t.getCategory())
                .issueSummary(t.getIssueSummary())
                .transactionId(t.getTransactionId())
                .priority(t.getPriority())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(res);
    }
}

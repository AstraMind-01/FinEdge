package com.onlinebanking.support.repository;

import com.onlinebanking.support.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    Optional<SupportTicket> findByTicketId(String ticketId);
    List<SupportTicket> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<SupportTicket> findByTicketIdAndUserId(String ticketId, String userId);
}

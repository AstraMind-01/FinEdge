package com.onlinebanking.support.repository;

import com.onlinebanking.support.model.ChatMessageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageLogRepository extends JpaRepository<ChatMessageLog, Long> {
    List<ChatMessageLog> findByConversationIdOrderByTimestampAsc(String conversationId);
}

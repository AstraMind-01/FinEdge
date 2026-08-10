package com.onlinebanking.support.controller;

import com.onlinebanking.support.dto.ChatRequest;
import com.onlinebanking.support.dto.ChatResponse;
import com.onlinebanking.support.engine.FinEdgeKnowledgeEngine;
import com.onlinebanking.support.model.ChatMessageLog;
import com.onlinebanking.support.repository.ChatMessageLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/support")
@CrossOrigin(origins = "*")
public class SupportChatController {

    @Autowired
    private FinEdgeKnowledgeEngine knowledgeEngine;

    @Autowired
    private ChatMessageLogRepository messageLogRepository;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Save user message log
        if (request.getConversationId() != null) {
            ChatMessageLog userLog = ChatMessageLog.builder()
                    .conversationId(request.getConversationId())
                    .userId(request.getUserId())
                    .sender("user")
                    .messageText(request.getMessage())
                    .build();
            messageLogRepository.save(userLog);
        }

        // Process message via Knowledge Engine
        ChatResponse response = knowledgeEngine.processUserQuery(request);

        // Save bot response log
        if (response.getConversationId() != null) {
            ChatMessageLog botLog = ChatMessageLog.builder()
                    .conversationId(response.getConversationId())
                    .userId(request.getUserId())
                    .sender("bot")
                    .messageText(response.getReply())
                    .build();
            messageLogRepository.save(botLog);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{conversationId}")
    public ResponseEntity<List<ChatMessageLog>> getHistory(@PathVariable String conversationId) {
        List<ChatMessageLog> logs = messageLogRepository.findByConversationIdOrderByTimestampAsc(conversationId);
        return ResponseEntity.ok(logs);
    }

    @DeleteMapping("/history/{conversationId}")
    public ResponseEntity<Void> clearHistory(@PathVariable String conversationId) {
        List<ChatMessageLog> logs = messageLogRepository.findByConversationIdOrderByTimestampAsc(conversationId);
        messageLogRepository.deleteAll(logs);
        return ResponseEntity.noContent().build();
    }
}

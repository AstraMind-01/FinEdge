package com.onlinebanking.support.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private String conversationId;
    private String reply;
    private String timestamp;
    private String ticketId;
    private boolean escalated;
    private String actionRedirectUrl;
    private java.util.List<String> quickActions;
}

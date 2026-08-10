package com.onlinebanking.support.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequest {
    private String conversationId;
    private String message;
    private String userId;
    private String userEmail;
    private String userName;
}

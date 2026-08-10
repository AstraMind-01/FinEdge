package com.onlinebanking.auth.otp.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.onlinebanking.auth.otp.OtpPurpose;
import com.onlinebanking.auth.otp.OtpStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OtpResponse {

    private boolean success;
    private String verificationToken;
    private OtpPurpose purpose;
    private OtpStatus status;
    private String proofToken;
    private Integer expiresInSeconds;
    private Integer resendCooldownSeconds;
    private Integer remainingAttempts;
    private String message;
    private String error;
}

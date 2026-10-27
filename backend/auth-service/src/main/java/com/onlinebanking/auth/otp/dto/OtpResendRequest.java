package com.onlinebanking.auth.otp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpResendRequest {

    @NotBlank(message = "Verification token is required")
    private String verificationToken;
}

package com.onlinebanking.auth.otp.dto;

import com.onlinebanking.auth.otp.OtpPurpose;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpGenerateRequest {

    private String username;

    @NotNull(message = "OTP purpose is required")
    private OtpPurpose purpose;

    private String targetIdentifier;
}

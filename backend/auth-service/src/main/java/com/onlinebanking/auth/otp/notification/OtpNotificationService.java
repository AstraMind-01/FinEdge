package com.onlinebanking.auth.otp.notification;

import com.onlinebanking.auth.otp.OtpPurpose;

public interface OtpNotificationService {

    void sendOtp(String recipientEmail, String username, OtpPurpose purpose, String plaintextOtp);
}

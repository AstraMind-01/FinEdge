package com.onlinebanking.auth.dto;

import com.onlinebanking.auth.entity.GovernmentIdType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record KycSubmissionRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        String fullName,

        @NotNull(message = "Date of birth is required")
        @Past(message = "Date of birth must be in the past")
        LocalDate dateOfBirth,

        @NotBlank(message = "Phone number is required")
        @Size(min = 10, max = 15, message = "Phone number must be valid")
        String phoneNumber,

        @NotBlank(message = "Address is required")
        @Size(min = 5, max = 255, message = "Address must be detailed")
        String address,

        @NotNull(message = "Government ID type is required")
        GovernmentIdType governmentIdType,

        @NotBlank(message = "Government ID number is required")
        @Size(min = 5, max = 50, message = "Government ID number must be valid")
        String governmentIdNumber
) {
}

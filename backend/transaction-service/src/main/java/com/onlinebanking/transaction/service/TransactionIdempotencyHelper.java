package com.onlinebanking.transaction.service;

import com.onlinebanking.transaction.dto.TransactionResponse;
import com.onlinebanking.transaction.entity.Transaction;
import com.onlinebanking.transaction.exception.IdempotencyConflictException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class TransactionIdempotencyHelper {

    private static final Logger log = LoggerFactory.getLogger(TransactionIdempotencyHelper.class);

    private TransactionIdempotencyHelper() {}

    public static TransactionResponse validateIdempotencyFingerprint(
            Transaction existing,
            String currentFingerprint,
            String idempotencyKey
    ) {
        if (currentFingerprint.equals(existing.getRequestFingerprint())) {
            log.info("Idempotency match found for key: {}. Returning original response.", idempotencyKey);
            return TransactionMapper.mapToResponse(existing);
        } else {
            log.warn("IDEMPOTENCY_CONFLICT: Key [{}] presented with mismatching request payload.", idempotencyKey);
            throw new IdempotencyConflictException("IDEMPOTENCY_CONFLICT: Idempotency key '" + idempotencyKey 
                    + "' was previously used with different request parameters.");
        }
    }

    public static String computeFingerprint(String type, BigDecimal amount, String fromAcc, String toAcc) {
        String raw = String.format("TYPE=%s|AMT=%s|FROM=%s|TO=%s",
                type,
                amount != null ? amount.stripTrailingZeros().toPlainString() : "NULL",
                fromAcc != null ? fromAcc : "NULL",
                toAcc != null ? toAcc : "NULL");
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return raw;
        }
    }
}

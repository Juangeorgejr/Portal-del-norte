package com.hotel.integration.payment;

import com.hotel.payment.entity.PaymentMethod;

import java.math.BigDecimal;

public interface PaymentProvider {

    PaymentTransactionResult processPayment(
            String reference,
            BigDecimal amount,
            String currency,
            PaymentMethod method,
            String customerEmail
    );

    PaymentTransactionResult verifyTransaction(String transactionId);

    record PaymentTransactionResult(
            boolean approved,
            String transactionId,
            String status,
            String message,
            String rawResponse
    ) {}
}

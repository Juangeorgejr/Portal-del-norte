package com.hotel.integration.payment;

import com.hotel.payment.entity.PaymentMethod;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Component
public class SimulatedPaymentProvider implements PaymentProvider {

    @Override
    public PaymentTransactionResult processPayment(
            String reference,
            BigDecimal amount,
            String currency,
            PaymentMethod method,
            String customerEmail
    ) {
        String txId = "SIM-TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("Procesando pago simulado: ref={}, monto={} {}, metodo={}, cliente={}",
                reference, amount, currency, method, customerEmail);

        // Aprobación simulada instantánea
        return new PaymentTransactionResult(
                true,
                txId,
                "APPROVED",
                "Transacción aprobada satisfactoriamente en entorno de simulación",
                "{\"provider\": \"SIMULATED\", \"txId\": \"" + txId + "\", \"code\": 200}"
        );
    }

    @Override
    public PaymentTransactionResult verifyTransaction(String transactionId) {
        return new PaymentTransactionResult(
                true,
                transactionId,
                "APPROVED",
                "Transacción verificada",
                "{\"verified\": true}"
        );
    }
}

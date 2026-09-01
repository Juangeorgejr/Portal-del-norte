package com.hotel.payment.dto;

import com.hotel.payment.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessPaymentRequest {

    @NotNull(message = "El ID de la reserva es obligatorio")
    private Long bookingId;

    @NotNull(message = "El método de pago es obligatorio (TARJETA, PSE, NEQUI, BANCOLOMBIA, EFECTIVO)")
    private PaymentMethod method;
}

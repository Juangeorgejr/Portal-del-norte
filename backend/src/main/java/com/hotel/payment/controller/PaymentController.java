package com.hotel.payment.controller;

import com.hotel.payment.dto.ProcessPaymentRequest;
import com.hotel.payment.entity.Payment;
import com.hotel.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Pagos", description = "Procesamiento de pagos y pasarela electrónica")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    @Operation(summary = "Procesar pago de una reserva (simulado / Wompi)")
    public ResponseEntity<Payment> processPayment(@Valid @RequestBody ProcessPaymentRequest request) {
        Payment payment = paymentService.processPayment(request);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Consultar estado de pago de una reserva")
    public ResponseEntity<Payment> getPaymentByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBookingId(bookingId));
    }
}

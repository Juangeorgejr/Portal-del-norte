package com.hotel.payment.service;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.BookingStatus;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.common.exception.BusinessException;
import com.hotel.common.exception.ResourceNotFoundException;
import com.hotel.integration.payment.PaymentProvider;
import com.hotel.invoice.service.InvoiceService;
import com.hotel.payment.dto.ProcessPaymentRequest;
import com.hotel.payment.entity.Payment;
import com.hotel.payment.entity.PaymentStatus;
import com.hotel.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentProvider paymentProvider;
    private final InvoiceService invoiceService;

    @Transactional
    public Payment processPayment(ProcessPaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + request.getBookingId()));

        if (booking.getStatus() == BookingStatus.CANCELADA) {
            throw new BusinessException("No se puede procesar pago para una reserva cancelada.");
        }

        if (booking.getStatus() == BookingStatus.CONFIRMADA || booking.getStatus() == BookingStatus.CHECKED_IN) {
            throw new BusinessException("Esta reserva ya cuenta con un pago aprobado.");
        }

        String reference = "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        var result = paymentProvider.processPayment(
                reference,
                booking.getTotal(),
                "COP",
                request.getMethod(),
                booking.getGuest().getEmail()
        );

        Payment payment = Payment.builder()
                .paymentReference(reference)
                .booking(booking)
                .amount(booking.getTotal())
                .currency("COP")
                .method(request.getMethod())
                .status(result.approved() ? PaymentStatus.APPROVED : PaymentStatus.DECLINED)
                .provider("SIMULATED")
                .providerTransactionId(result.transactionId())
                .providerResponse(result.rawResponse())
                .paidAt(result.approved() ? LocalDateTime.now() : null)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        if (result.approved()) {
            booking.setStatus(BookingStatus.CONFIRMADA);
            bookingRepository.save(booking);

            // Generación de factura
            try {
                invoiceService.generateInvoiceForBooking(booking, savedPayment);
            } catch (Exception e) {
                log.error("Error al emitir factura para reserva: " + booking.getBookingCode(), e);
            }
        }

        return savedPayment;
    }

    @Transactional(readOnly = true)
    public Payment getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró pago para la reserva: " + bookingId));
    }
}

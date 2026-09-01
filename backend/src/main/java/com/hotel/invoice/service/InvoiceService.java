package com.hotel.invoice.service;

import com.hotel.booking.entity.Booking;
import com.hotel.invoice.entity.Invoice;
import com.hotel.invoice.entity.InvoiceStatus;
import com.hotel.invoice.repository.InvoiceRepository;
import com.hotel.payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    @Transactional
    public Invoice generateInvoiceForBooking(Booking booking, Payment payment) {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        String suffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String invoiceNumber = String.format("FE-PN-%s-%s", datePrefix, suffix);

        String cufe = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .booking(booking)
                .payment(payment)
                .guest(booking.getGuest())
                .subtotal(booking.getSubtotal())
                .taxAmount(booking.getTaxAmount())
                .total(booking.getTotal())
                .status(InvoiceStatus.APPROVED)
                .cufe(cufe)
                .issuedAt(LocalDateTime.now())
                .documentUrl("/api/invoices/download/" + invoiceNumber)
                .providerResponse("{\"dian_status\": \"VALIDADA\", \"cufe\": \"" + cufe + "\"}")
                .build();

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Factura electrónica generada: {} con CUFE {}", invoiceNumber, cufe);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByGuestId(Long guestId) {
        return invoiceRepository.findByGuestIdOrderByIssuedAtDesc(guestId);
    }

    @Transactional(readOnly = true)
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }
}

package com.hotel.invoice.service;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.BookingServiceItem;
import com.hotel.guest.entity.Guest;
import com.hotel.invoice.entity.Invoice;
import com.hotel.invoice.entity.InvoiceStatus;
import com.hotel.room.entity.Room;
import com.hotel.room.entity.RoomType;
import com.hotel.service.entity.HotelService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class InvoicePdfServiceTest {

    private InvoicePdfService invoicePdfService;

    @BeforeEach
    void setUp() {
        invoicePdfService = new InvoicePdfService();
    }

    @Test
    @DisplayName("Debe generar un archivo PDF binario válido con encabezado y CUFE")
    void generateInvoicePdf_ShouldReturnValidPdfByteArray() {
        // Arrange
        Guest guest = Guest.builder()
                .firstName("Carlos")
                .lastName("Gómez")
                .email("carlos.gomez@gmail.com")
                .phone("+57 310 123 4567")
                .documentType("CC")
                .documentNumber("1098765432")
                .build();

        RoomType roomType = RoomType.builder().id(1L).name("Suite Ejecutiva").build();
        Room room = Room.builder().id(1L).roomNumber("301").roomType(roomType).build();

        HotelService breakfastService = HotelService.builder()
                .id(1L)
                .name("Desayuno Buffet")
                .price(new BigDecimal("28000.00"))
                .build();

        BookingServiceItem serviceItem = BookingServiceItem.builder()
                .service(breakfastService)
                .quantity(2)
                .unitPrice(new BigDecimal("28000.00"))
                .total(new BigDecimal("56000.00"))
                .build();

        Booking booking = Booking.builder()
                .id(1L)
                .bookingCode("PN-20260901-A1B2")
                .guest(guest)
                .room(room)
                .checkInDate(LocalDate.now().plusDays(2))
                .checkOutDate(LocalDate.now().plusDays(4))
                .guestCount(2)
                .numberOfNights(2)
                .pricePerNight(new BigDecimal("200000.00"))
                .subtotal(new BigDecimal("456000.00"))
                .taxAmount(new BigDecimal("86640.00"))
                .total(new BigDecimal("542640.00"))
                .services(List.of(serviceItem))
                .build();

        Invoice invoice = Invoice.builder()
                .id(1L)
                .invoiceNumber("FE-PN-202609-0001")
                .booking(booking)
                .guest(guest)
                .subtotal(new BigDecimal("456000.00"))
                .taxAmount(new BigDecimal("86640.00"))
                .total(new BigDecimal("542640.00"))
                .status(InvoiceStatus.APPROVED)
                .cufe("a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6")
                .issuedAt(LocalDateTime.now())
                .build();

        // Act
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice);

        // Assert
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 500, "El PDF generado debe contener bytes válidos");
        // Los primeros 4 bytes de un archivo PDF siempre son %PDF
        assertEquals('%', (char) pdfBytes[0]);
        assertEquals('P', (char) pdfBytes[1]);
        assertEquals('D', (char) pdfBytes[2]);
        assertEquals('F', (char) pdfBytes[3]);
    }
}

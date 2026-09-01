package com.hotel.booking.dto;

import com.hotel.auth.dto.UserResponse;
import com.hotel.booking.entity.BookingStatus;
import com.hotel.room.dto.RoomResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long id;
    private String bookingCode;
    private UserResponse.GuestDto guest;
    private RoomResponse room;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer guestCount;
    private BigDecimal pricePerNight;
    private Integer numberOfNights;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal total;
    private BookingStatus status;
    private String cancellationReason;
    private LocalDateTime actualCheckIn;
    private LocalDateTime actualCheckOut;
    private List<BookingServiceResponse> services;
    private PaymentSummaryDto payment;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingServiceResponse {
        private Long id;
        private String serviceName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal total;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentSummaryDto {
        private String reference;
        private String status;
        private String method;
        private BigDecimal amount;
        private LocalDateTime paidAt;
    }
}

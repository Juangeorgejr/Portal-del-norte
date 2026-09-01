package com.hotel.booking.mapper;

import com.hotel.auth.dto.UserResponse;
import com.hotel.booking.dto.BookingResponse;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.BookingServiceItem;
import com.hotel.guest.entity.Guest;
import com.hotel.payment.entity.Payment;
import com.hotel.room.mapper.RoomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class BookingMapper {

    private final RoomMapper roomMapper;

    public BookingResponse toBookingResponse(Booking booking, Payment payment) {
        if (booking == null) return null;

        Guest guest = booking.getGuest();
        UserResponse.GuestDto guestDto = null;
        if (guest != null) {
            guestDto = UserResponse.GuestDto.builder()
                    .id(guest.getId())
                    .firstName(guest.getFirstName())
                    .lastName(guest.getLastName())
                    .email(guest.getEmail())
                    .phone(guest.getPhone())
                    .documentType(guest.getDocumentType())
                    .documentNumber(guest.getDocumentNumber())
                    .build();
        }

        List<BookingResponse.BookingServiceResponse> serviceResponses = Collections.emptyList();
        if (booking.getServices() != null) {
            serviceResponses = booking.getServices().stream()
                    .map(this::toServiceResponse)
                    .collect(Collectors.toList());
        }

        BookingResponse.PaymentSummaryDto paymentDto = null;
        if (payment != null) {
            paymentDto = BookingResponse.PaymentSummaryDto.builder()
                    .reference(payment.getPaymentReference())
                    .status(payment.getStatus().name())
                    .method(payment.getMethod().name())
                    .amount(payment.getAmount())
                    .paidAt(payment.getPaidAt())
                    .build();
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .guest(guestDto)
                .room(roomMapper.toRoomResponse(booking.getRoom()))
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .guestCount(booking.getGuestCount())
                .pricePerNight(booking.getPricePerNight())
                .numberOfNights(booking.getNumberOfNights())
                .subtotal(booking.getSubtotal())
                .taxAmount(booking.getTaxAmount())
                .discountAmount(booking.getDiscountAmount())
                .total(booking.getTotal())
                .status(booking.getStatus())
                .cancellationReason(booking.getCancellationReason())
                .actualCheckIn(booking.getActualCheckIn())
                .actualCheckOut(booking.getActualCheckOut())
                .services(serviceResponses)
                .payment(paymentDto)
                .createdAt(booking.getCreatedAt())
                .build();
    }

    private BookingResponse.BookingServiceResponse toServiceResponse(BookingServiceItem item) {
        return BookingResponse.BookingServiceResponse.builder()
                .id(item.getId())
                .serviceName(item.getService().getName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .total(item.getTotal())
                .build();
    }
}

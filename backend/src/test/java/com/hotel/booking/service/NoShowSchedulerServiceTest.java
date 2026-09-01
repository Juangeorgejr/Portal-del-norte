package com.hotel.booking.service;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.BookingStatus;
import com.hotel.booking.repository.BookingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NoShowSchedulerServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private NoShowSchedulerService noShowSchedulerService;

    @Test
    @DisplayName("Debe marcar como NO_SHOW las reservas pasadas que no hicieron check-in")
    void processNoShowsNow_ShouldMarkExpiredBookingsAsNoShow() {
        // Arrange
        Booking expiredConfirmedBooking = Booking.builder()
                .id(1L)
                .bookingCode("PN-20260801-1111")
                .status(BookingStatus.CONFIRMADA)
                .checkInDate(LocalDate.now().minusDays(1)) // Ayer
                .build();

        Booking validFutureBooking = Booking.builder()
                .id(2L)
                .bookingCode("PN-20260910-2222")
                .status(BookingStatus.CONFIRMADA)
                .checkInDate(LocalDate.now().plusDays(5)) // Futuro
                .build();

        when(bookingRepository.findAll()).thenReturn(List.of(expiredConfirmedBooking, validFutureBooking));

        // Act
        int processedCount = noShowSchedulerService.processNoShowsNow();

        // Assert
        assertEquals(1, processedCount);
        assertEquals(BookingStatus.NO_SHOW, expiredConfirmedBooking.getStatus());
        assertEquals(BookingStatus.CONFIRMADA, validFutureBooking.getStatus());
        verify(bookingRepository, times(1)).save(expiredConfirmedBooking);
    }
}

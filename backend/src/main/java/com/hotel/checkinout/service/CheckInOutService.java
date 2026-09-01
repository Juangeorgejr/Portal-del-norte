package com.hotel.checkinout.service;

import com.hotel.booking.dto.BookingResponse;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.BookingStatus;
import com.hotel.booking.mapper.BookingMapper;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.common.exception.BusinessException;
import com.hotel.common.exception.ResourceNotFoundException;
import com.hotel.payment.entity.Payment;
import com.hotel.payment.repository.PaymentRepository;
import com.hotel.room.entity.Room;
import com.hotel.room.entity.RoomOperationalStatus;
import com.hotel.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckInOutService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final PaymentRepository paymentRepository;
    private final BookingMapper bookingMapper;

    @Transactional
    public BookingResponse performCheckIn(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + bookingId));

        if (booking.getStatus() == BookingStatus.CHECKED_IN) {
            throw new BusinessException("El huésped ya realizó el check-in previamente.");
        }

        if (booking.getStatus() == BookingStatus.CANCELADA) {
            throw new BusinessException("No es posible hacer check-in a una reserva cancelada.");
        }

        Room room = booking.getRoom();
        if (room.getOperationalStatus() == RoomOperationalStatus.OCUPADA) {
            throw new BusinessException("La habitación " + room.getRoomNumber() + " se encuentra actualmente ocupada por otro huésped.");
        }

        // Actualizar estado de la reserva y habitación
        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setActualCheckIn(LocalDateTime.now());
        room.setOperationalStatus(RoomOperationalStatus.OCUPADA);

        bookingRepository.save(booking);
        roomRepository.save(room);

        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        log.info("Check-in completado para reserva {}. Habitación {} marcada como OCUPADA",
                booking.getBookingCode(), room.getRoomNumber());

        return bookingMapper.toBookingResponse(booking, payment);
    }

    @Transactional
    public BookingResponse performCheckOut(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + bookingId));

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new BusinessException("Solo se puede realizar Check-out a reservas con estado CHECKED_IN.");
        }

        Room room = booking.getRoom();

        // Actualizar estado de reserva y pasar habitación a LIMPIEZA
        booking.setStatus(BookingStatus.CHECKED_OUT);
        booking.setActualCheckOut(LocalDateTime.now());
        room.setOperationalStatus(RoomOperationalStatus.LIMPIEZA);

        bookingRepository.save(booking);
        roomRepository.save(room);

        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        log.info("Check-out completado para reserva {}. Habitación {} transferida a estado LIMPIEZA",
                booking.getBookingCode(), room.getRoomNumber());

        return bookingMapper.toBookingResponse(booking, payment);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getExpectedCheckInsToday() {
        LocalDate today = LocalDate.now();
        List<Booking> bookings = bookingRepository.findExpectedCheckInsToday(today);
        return bookings.stream()
                .map(b -> bookingMapper.toBookingResponse(b, paymentRepository.findByBookingId(b.getId()).orElse(null)))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getExpectedCheckOutsToday() {
        LocalDate today = LocalDate.now();
        List<Booking> bookings = bookingRepository.findExpectedCheckOutsToday(today);
        return bookings.stream()
                .map(b -> bookingMapper.toBookingResponse(b, paymentRepository.findByBookingId(b.getId()).orElse(null)))
                .collect(Collectors.toList());
    }
}

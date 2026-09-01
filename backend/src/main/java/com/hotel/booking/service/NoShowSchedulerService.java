package com.hotel.booking.service;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.BookingStatus;
import com.hotel.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoShowSchedulerService {

    private final BookingRepository bookingRepository;

    /**
     * Tarea programada ejecutada diariamente a la 01:00 AM.
     * Identifica reservas de días anteriores que nunca realizaron check-in
     * y las transfiere automáticamente al estado NO_SHOW liberando inventario.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void scheduleProcessExpiredBookings() {
        log.info("Ejecutando proceso nocturno automático de detección de NO-SHOW...");
        int count = processNoShowsNow();
        log.info("Proceso NO-SHOW completado. Total de reservas marcadas como NO-SHOW: {}", count);
    }

    /**
     * Ejecuta la detección manual o programada de reservas vencidas no presentadas.
     *
     * @return Cantidad de reservas marcadas como NO_SHOW
     */
    @Transactional
    public int processNoShowsNow() {
        LocalDate today = LocalDate.now();

        // Buscar reservas CONFIRMADAS o PENDIENTES cuya fecha de check-in sea anterior a hoy
        List<Booking> allBookings = bookingRepository.findAll();
        List<Booking> expiredBookings = allBookings.stream()
                .filter(b -> (b.getStatus() == BookingStatus.CONFIRMADA || b.getStatus() == BookingStatus.PENDIENTE))
                .filter(b -> b.getCheckInDate().isBefore(today))
                .toList();

        int processed = 0;
        for (Booking booking : expiredBookings) {
            booking.setStatus(BookingStatus.NO_SHOW);
            booking.setCancellationReason("No-Show automático: El huésped no se presentó en la fecha de check-in programada (" + booking.getCheckInDate() + ").");
            bookingRepository.save(booking);
            processed++;
            log.info("Reserva {} marcada como NO_SHOW (Fecha llegada: {})", booking.getBookingCode(), booking.getCheckInDate());
        }

        return processed;
    }
}

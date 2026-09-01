package com.hotel.booking.repository;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByGuestIdOrderByCreatedAtDesc(Long guestId);

    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.checkInDate = :date AND b.status = 'CONFIRMADA'")
    List<Booking> findExpectedCheckInsToday(@Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.checkOutDate = :date AND b.status = 'CHECKED_IN'")
    List<Booking> findExpectedCheckOutsToday(@Param("date") LocalDate date);

    @Query("""
        SELECT COUNT(b) FROM Booking b
        WHERE b.status IN ('CONFIRMADA', 'CHECKED_IN')
          AND b.checkInDate <= :date
          AND b.checkOutDate > :date
    """)
    long countOccupiedRoomsOnDate(@Param("date") LocalDate date);
}

package com.hotel.room.repository;

import com.hotel.room.entity.Room;
import com.hotel.room.entity.RoomOperationalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findByRoomNumber(String roomNumber);

    List<Room> findByActiveTrue();

    List<Room> findByOperationalStatusAndActiveTrue(RoomOperationalStatus status);

    /**
     * Motor de Disponibilidad: Encuentra todas las habitaciones activas y en estado DISPONIBLE
     * que NO tengan reservas solapadas en el rango [checkIn, checkOut] con estados activos.
     */
    @Query("""
        SELECT r FROM Room r
        WHERE r.active = true
          AND r.operationalStatus = 'DISPONIBLE'
          AND r.capacity >= :guests
          AND (:roomTypeId IS NULL OR r.roomType.id = :roomTypeId)
          AND r.id NOT IN (
              SELECT b.room.id FROM Booking b
              WHERE b.status IN ('PENDIENTE', 'CONFIRMADA', 'CHECKED_IN')
                AND b.checkInDate < :checkOutDate
                AND b.checkOutDate > :checkInDate
          )
        ORDER BY r.pricePerNight ASC
    """)
    List<Room> findAvailableRooms(
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate,
        @Param("guests") Integer guests,
        @Param("roomTypeId") Long roomTypeId
    );

    /**
     * Verifica si una habitación específica está disponible para un rango de fechas dado.
     */
    @Query("""
        SELECT CASE WHEN COUNT(b) = 0 THEN TRUE ELSE FALSE END
        FROM Booking b
        WHERE b.room.id = :roomId
          AND b.status IN ('PENDIENTE', 'CONFIRMADA', 'CHECKED_IN')
          AND b.checkInDate < :checkOutDate
          AND b.checkOutDate > :checkInDate
    """)
    boolean isRoomAvailable(
        @Param("roomId") Long roomId,
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate
    );
}

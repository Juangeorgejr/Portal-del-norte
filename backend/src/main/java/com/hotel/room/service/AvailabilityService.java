package com.hotel.room.service;

import com.hotel.common.exception.BusinessException;
import com.hotel.room.dto.RoomResponse;
import com.hotel.room.entity.Room;
import com.hotel.room.mapper.RoomMapper;
import com.hotel.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;

    @Transactional(readOnly = true)
    public List<RoomResponse> searchAvailableRooms(
            LocalDate checkInDate,
            LocalDate checkOutDate,
            Integer guestCount,
            Long roomTypeId
    ) {
        validateDates(checkInDate, checkOutDate);

        int guests = (guestCount != null && guestCount > 0) ? guestCount : 1;

        List<Room> availableRooms = roomRepository.findAvailableRooms(
                checkInDate,
                checkOutDate,
                guests,
                roomTypeId
        );

        log.info("Búsqueda de disponibilidad para {} a {} ({} huéspedes): {} habitaciones encontradas",
                checkInDate, checkOutDate, guests, availableRooms.size());

        return availableRooms.stream()
                .map(roomMapper::toRoomResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isRoomAvailableForDates(Long roomId, LocalDate checkInDate, LocalDate checkOutDate) {
        validateDates(checkInDate, checkOutDate);
        return roomRepository.isRoomAvailable(roomId, checkInDate, checkOutDate);
    }

    private void validateDates(LocalDate checkInDate, LocalDate checkOutDate) {
        if (checkInDate == null || checkOutDate == null) {
            throw new BusinessException("Las fechas de check-in y check-out son obligatorias");
        }

        if (checkInDate.isBefore(LocalDate.now())) {
            throw new BusinessException("La fecha de check-in no puede ser anterior a la fecha actual");
        }

        if (!checkOutDate.isAfter(checkInDate)) {
            throw new BusinessException("La fecha de check-out debe ser posterior a la fecha de check-in");
        }
    }
}

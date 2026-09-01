package com.hotel.room.service;

import com.hotel.common.exception.BusinessException;
import com.hotel.room.dto.RoomResponse;
import com.hotel.room.entity.Room;
import com.hotel.room.entity.RoomOperationalStatus;
import com.hotel.room.entity.RoomType;
import com.hotel.room.mapper.RoomMapper;
import com.hotel.room.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AvailabilityServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomMapper roomMapper;

    @InjectMocks
    private AvailabilityService availabilityService;

    private Room mockRoom;
    private RoomResponse mockResponse;

    @BeforeEach
    void setUp() {
        RoomType type = RoomType.builder().id(1L).name("Individual Standard").build();
        mockRoom = Room.builder()
                .id(1L)
                .roomNumber("101")
                .roomType(type)
                .capacity(2)
                .pricePerNight(new BigDecimal("120000.00"))
                .operationalStatus(RoomOperationalStatus.DISPONIBLE)
                .active(true)
                .amenities(Set.of())
                .build();

        mockResponse = RoomResponse.builder()
                .id(1L)
                .roomNumber("101")
                .capacity(2)
                .pricePerNight(new BigDecimal("120000.00"))
                .build();
    }

    @Test
    @DisplayName("Debe lanzar BusinessException si la fecha de check-in es anterior a hoy")
    void searchAvailableRooms_WithPastCheckInDate_ShouldThrowException() {
        LocalDate pastCheckIn = LocalDate.now().minusDays(1);
        LocalDate futureCheckOut = LocalDate.now().plusDays(2);

        assertThrows(BusinessException.class, () ->
                availabilityService.searchAvailableRooms(pastCheckIn, futureCheckOut, 2, null)
        );
    }

    @Test
    @DisplayName("Debe lanzar BusinessException si check-out es igual o anterior a check-in")
    void searchAvailableRooms_WithInvalidDateRange_ShouldThrowException() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(2); // Mismo día

        assertThrows(BusinessException.class, () ->
                availabilityService.searchAvailableRooms(checkIn, checkOut, 2, null)
        );
    }

    @Test
    @DisplayName("Debe retornar habitaciones disponibles cuando las fechas son válidas")
    void searchAvailableRooms_WithValidDates_ShouldReturnAvailableRooms() {
        LocalDate checkIn = LocalDate.now().plusDays(3);
        LocalDate checkOut = LocalDate.now().plusDays(6);

        when(roomRepository.findAvailableRooms(eq(checkIn), eq(checkOut), eq(2), eq(null)))
                .thenReturn(List.of(mockRoom));
        when(roomMapper.toRoomResponse(any(Room.class))).thenReturn(mockResponse);

        List<RoomResponse> result = availabilityService.searchAvailableRooms(checkIn, checkOut, 2, null);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("101", result.get(0).getRoomNumber());
    }
}

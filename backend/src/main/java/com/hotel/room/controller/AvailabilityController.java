package com.hotel.room.controller;

import com.hotel.room.dto.RoomResponse;
import com.hotel.room.service.AvailabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
@Tag(name = "Disponibilidad", description = "Motor de búsqueda de habitaciones disponibles en tiempo real")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping
    @Operation(summary = "Consultar habitaciones disponibles por rango de fechas y huéspedes")
    public ResponseEntity<List<RoomResponse>> searchAvailability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false, defaultValue = "1") Integer guests,
            @RequestParam(required = false) Long roomTypeId
    ) {
        List<RoomResponse> availableRooms = availabilityService.searchAvailableRooms(
                checkIn,
                checkOut,
                guests,
                roomTypeId
        );
        return ResponseEntity.ok(availableRooms);
    }

    @GetMapping("/check-room")
    @Operation(summary = "Verificar si una habitación específica está disponible para ciertas fechas")
    public ResponseEntity<Boolean> isRoomAvailable(
            @RequestParam Long roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        boolean available = availabilityService.isRoomAvailableForDates(roomId, checkIn, checkOut);
        return ResponseEntity.ok(available);
    }
}

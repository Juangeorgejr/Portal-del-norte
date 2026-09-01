package com.hotel.room.controller;

import com.hotel.room.dto.AmenityResponse;
import com.hotel.room.dto.CreateRoomRequest;
import com.hotel.room.dto.RoomResponse;
import com.hotel.room.dto.RoomTypeResponse;
import com.hotel.room.dto.UpdateRoomStatusRequest;
import com.hotel.room.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "Habitaciones", description = "Endpoints de catálogo y administración de habitaciones")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    @Operation(summary = "Obtener todas las habitaciones activas")
    public ResponseEntity<List<RoomResponse>> getAllActiveRooms() {
        return ResponseEntity.ok(roomService.getAllActiveRooms());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de una habitación por ID")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    @Operation(summary = "Obtener todas las habitaciones (incluidas inactivas/mantenimiento)")
    public ResponseEntity<List<RoomResponse>> getAllRoomsForAdmin() {
        return ResponseEntity.ok(roomService.getAllRoomsForAdmin());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear una nueva habitación (Solo Admin)")
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody CreateRoomRequest request) {
        RoomResponse response = roomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar información de una habitación (Solo Admin)")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Long id, @Valid @RequestBody CreateRoomRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    @Operation(summary = "Cambiar estado operativo de una habitación (Recepción/Limpieza/Admin)")
    public ResponseEntity<RoomResponse> updateOperationalStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoomStatusRequest request
    ) {
        return ResponseEntity.ok(roomService.updateOperationalStatus(id, request.getStatus()));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activar o desactivar una habitación del catálogo")
    public ResponseEntity<Void> toggleActive(@PathVariable Long id, @RequestParam boolean active) {
        roomService.toggleActiveStatus(id, active);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/types")
    @Operation(summary = "Listar todos los tipos de habitación activos")
    public ResponseEntity<List<RoomTypeResponse>> getAllRoomTypes() {
        return ResponseEntity.ok(roomService.getAllRoomTypes());
    }

    @GetMapping("/amenities")
    @Operation(summary = "Listar todas las comodidades (amenities) activas")
    public ResponseEntity<List<AmenityResponse>> getAllAmenities() {
        return ResponseEntity.ok(roomService.getAllAmenities());
    }
}

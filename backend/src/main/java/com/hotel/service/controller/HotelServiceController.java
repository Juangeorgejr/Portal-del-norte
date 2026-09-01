package com.hotel.service.controller;

import com.hotel.service.entity.HotelService;
import com.hotel.service.entity.ServiceCategory;
import com.hotel.service.service.HotelServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Tag(name = "Servicios del Hotel", description = "Servicios adicionales como desayuno, lavandería, parqueadero y tours")
public class HotelServiceController {

    private final HotelServiceService hotelServiceService;

    @GetMapping
    @Operation(summary = "Listar todos los servicios del hotel activos")
    public ResponseEntity<List<HotelService>> getAllActiveServices() {
        return ResponseEntity.ok(hotelServiceService.getAllActiveServices());
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Listar servicios por categoría")
    public ResponseEntity<List<HotelService>> getServicesByCategory(@PathVariable ServiceCategory category) {
        return ResponseEntity.ok(hotelServiceService.getServicesByCategory(category));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear nuevo servicio (Solo Admin)")
    public ResponseEntity<HotelService> createService(@RequestBody HotelService service) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hotelServiceService.createService(service));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar servicio existente (Solo Admin)")
    public ResponseEntity<HotelService> updateService(@PathVariable Long id, @RequestBody HotelService service) {
        return ResponseEntity.ok(hotelServiceService.updateService(id, service));
    }
}

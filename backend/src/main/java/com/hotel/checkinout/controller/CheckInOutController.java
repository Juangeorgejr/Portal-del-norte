package com.hotel.checkinout.controller;

import com.hotel.booking.dto.BookingResponse;
import com.hotel.checkinout.service.CheckInOutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/management/check-in-out")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
@Tag(name = "Check-in / Check-out", description = "Operaciones de recepción: registro de llegadas, salidas y control de habitaciones")
public class CheckInOutController {

    private final CheckInOutService checkInOutService;
    private final com.hotel.booking.service.NoShowSchedulerService noShowSchedulerService;

    @PostMapping("/check-in/{bookingId}")
    @Operation(summary = "Registrar Check-in de un huésped (marca habitación como OCUPADA)")
    public ResponseEntity<BookingResponse> checkIn(@PathVariable Long bookingId) {
        return ResponseEntity.ok(checkInOutService.performCheckIn(bookingId));
    }

    @PostMapping("/check-out/{bookingId}")
    @Operation(summary = "Registrar Check-out de un huésped (transfiere habitación a LIMPIEZA)")
    public ResponseEntity<BookingResponse> checkOut(@PathVariable Long bookingId) {
        return ResponseEntity.ok(checkInOutService.performCheckOut(bookingId));
    }

    @GetMapping("/today/check-ins")
    @Operation(summary = "Consultar llegadas (Check-ins) programadas para el día de hoy")
    public ResponseEntity<List<BookingResponse>> getExpectedCheckInsToday() {
        return ResponseEntity.ok(checkInOutService.getExpectedCheckInsToday());
    }

    @GetMapping("/today/check-outs")
    @Operation(summary = "Consultar salidas (Check-outs) programadas para el día de hoy")
    public ResponseEntity<List<BookingResponse>> getExpectedCheckOutsToday() {
        return ResponseEntity.ok(checkInOutService.getExpectedCheckOutsToday());
    }

    @PostMapping("/process-no-shows")
    @Operation(summary = "Ejecutar proceso manual de verificación y asignación de NO-SHOW para reservas vencidas")
    public ResponseEntity<String> processNoShows() {
        int count = noShowSchedulerService.processNoShowsNow();
        return ResponseEntity.ok("Proceso completado. Se marcaron " + count + " reservas como NO_SHOW.");
    }
}

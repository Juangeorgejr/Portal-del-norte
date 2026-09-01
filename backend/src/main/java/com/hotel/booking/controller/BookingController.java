package com.hotel.booking.controller;

import com.hotel.booking.dto.BookingResponse;
import com.hotel.booking.dto.CreateBookingRequest;
import com.hotel.booking.dto.PriceCalculationRequest;
import com.hotel.booking.dto.PriceCalculationResponse;
import com.hotel.booking.service.BookingService;
import com.hotel.booking.service.PricingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Reservas", description = "Endpoints de cotización, creación, consulta y cancelación de reservas")
public class BookingController {

    private final BookingService bookingService;
    private final PricingService pricingService;

    @PostMapping("/calculate")
    @Operation(summary = "Calcular precio y desglose oficial de una reserva en COP")
    public ResponseEntity<PriceCalculationResponse> calculatePrice(@Valid @RequestBody PriceCalculationRequest request) {
        PriceCalculationResponse response = pricingService.calculatePrice(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Crear una nueva reserva")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        BookingResponse response = bookingService.createBooking(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de una reserva por ID")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/code/{bookingCode}")
    @Operation(summary = "Obtener detalle de una reserva por código (ej. PN-20260901-A1B2)")
    public ResponseEntity<BookingResponse> getBookingByCode(@PathVariable String bookingCode) {
        return ResponseEntity.ok(bookingService.getBookingByCode(bookingCode));
    }

    @GetMapping("/my")
    @Operation(summary = "Listar reservas del cliente autenticado")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookingService.getMyBookings(userDetails.getUsername()));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    @Operation(summary = "Listar todas las reservas del hotel (Recepción/Admin)")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookingsForAdmin());
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancelar una reserva existente")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String reason = body != null ? body.get("reason") : null;
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(bookingService.cancelBooking(id, reason, email));
    }
}

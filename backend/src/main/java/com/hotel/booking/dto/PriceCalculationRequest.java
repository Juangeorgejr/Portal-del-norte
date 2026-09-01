package com.hotel.booking.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriceCalculationRequest {

    @NotNull(message = "El ID de la habitación es obligatorio")
    private Long roomId;

    @NotNull(message = "La fecha de check-in es obligatoria")
    @FutureOrPresent(message = "El check-in no puede ser en el pasado")
    private LocalDate checkInDate;

    @NotNull(message = "La fecha de check-out es obligatoria")
    @Future(message = "El check-out debe ser en el futuro")
    private LocalDate checkOutDate;

    @Min(value = 1, message = "Debe haber al menos 1 huésped")
    private Integer guestCount = 1;

    private List<ServiceSelectionDto> services;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceSelectionDto {
        private Long serviceId;
        private Integer quantity = 1;
    }
}

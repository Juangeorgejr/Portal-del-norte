package com.hotel.booking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

    @NotNull(message = "El ID de la habitación es obligatorio")
    private Long roomId;

    @NotNull(message = "La fecha de check-in es obligatoria")
    @FutureOrPresent(message = "El check-in no puede ser en el pasado")
    private LocalDate checkInDate;

    @NotNull(message = "La fecha de check-out es obligatoria")
    @Future(message = "El check-out debe ser en el futuro")
    private LocalDate checkOutDate;

    @NotNull(message = "La cantidad de huéspedes es obligatoria")
    @Min(value = 1, message = "Debe haber al menos 1 huésped")
    private Integer guestCount;

    @Valid
    @NotNull(message = "Los datos del huésped son obligatorios")
    private GuestDetailsDto guest;

    private List<PriceCalculationRequest.ServiceSelectionDto> services;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuestDetailsDto {
        @NotBlank(message = "El nombre es obligatorio")
        private String firstName;

        @NotBlank(message = "El apellido es obligatorio")
        private String lastName;

        @NotBlank(message = "El correo electrónico es obligatorio")
        private String email;

        @NotBlank(message = "El teléfono es obligatorio")
        private String phone;

        private String documentType = "CC";

        @NotBlank(message = "El número de documento es obligatorio")
        private String documentNumber;
    }
}

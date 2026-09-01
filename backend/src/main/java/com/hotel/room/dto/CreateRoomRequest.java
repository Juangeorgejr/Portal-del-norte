package com.hotel.room.dto;

import com.hotel.room.entity.RoomOperationalStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomRequest {

    @NotBlank(message = "El número de habitación es obligatorio")
    private String roomNumber;

    @NotNull(message = "El tipo de habitación es obligatorio")
    private Long roomTypeId;

    private String description;

    @NotNull(message = "La capacidad es obligatoria")
    @Min(value = 1, message = "La capacidad mínima es 1")
    private Integer capacity;

    @NotNull(message = "La cantidad de camas es obligatoria")
    @Min(value = 1, message = "Debe tener al menos 1 cama")
    private Integer bedCount;

    @NotNull(message = "El precio por noche es obligatorio")
    @Min(value = 1000, message = "El precio por noche debe ser válido en COP")
    private BigDecimal pricePerNight;

    private RoomOperationalStatus operationalStatus = RoomOperationalStatus.DISPONIBLE;
    private String floor = "1";
    private String imageUrl;
    private Set<Long> amenityIds;
}

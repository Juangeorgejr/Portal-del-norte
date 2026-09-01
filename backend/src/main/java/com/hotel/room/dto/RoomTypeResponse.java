package com.hotel.room.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeResponse {
    private Long id;
    private String name;
    private String description;
    private Integer baseCapacity;
    private Integer baseBeds;
    private BigDecimal basePricePerNight;
    private boolean active;
}

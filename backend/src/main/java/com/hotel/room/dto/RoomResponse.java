package com.hotel.room.dto;

import com.hotel.room.entity.RoomOperationalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private Long id;
    private String roomNumber;
    private RoomTypeResponse roomType;
    private String description;
    private Integer capacity;
    private Integer bedCount;
    private BigDecimal pricePerNight;
    private RoomOperationalStatus operationalStatus;
    private String floor;
    private String imageUrl;
    private boolean active;
    private Set<AmenityResponse> amenities;
}

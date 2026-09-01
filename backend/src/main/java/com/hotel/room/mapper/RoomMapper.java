package com.hotel.room.mapper;

import com.hotel.room.dto.AmenityResponse;
import com.hotel.room.dto.RoomResponse;
import com.hotel.room.dto.RoomTypeResponse;
import com.hotel.room.entity.Amenity;
import com.hotel.room.entity.Room;
import com.hotel.room.entity.RoomType;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class RoomMapper {

    public RoomTypeResponse toRoomTypeResponse(RoomType type) {
        if (type == null) return null;
        return RoomTypeResponse.builder()
                .id(type.getId())
                .name(type.getName())
                .description(type.getDescription())
                .baseCapacity(type.getBaseCapacity())
                .baseBeds(type.getBaseBeds())
                .basePricePerNight(type.getBasePricePerNight())
                .active(type.isActive())
                .build();
    }

    public AmenityResponse toAmenityResponse(Amenity amenity) {
        if (amenity == null) return null;
        return AmenityResponse.builder()
                .id(amenity.getId())
                .name(amenity.getName())
                .icon(amenity.getIcon())
                .active(amenity.isActive())
                .build();
    }

    public RoomResponse toRoomResponse(Room room) {
        if (room == null) return null;
        return RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomType(toRoomTypeResponse(room.getRoomType()))
                .description(room.getDescription())
                .capacity(room.getCapacity())
                .bedCount(room.getBedCount())
                .pricePerNight(room.getPricePerNight())
                .operationalStatus(room.getOperationalStatus())
                .floor(room.getFloor())
                .imageUrl(room.getImageUrl())
                .active(room.isActive())
                .amenities(room.getAmenities().stream()
                        .map(this::toAmenityResponse)
                        .collect(Collectors.toSet()))
                .build();
    }
}

package com.hotel.room.service;

import com.hotel.common.exception.ConflictException;
import com.hotel.common.exception.ResourceNotFoundException;
import com.hotel.room.dto.*;
import com.hotel.room.entity.Amenity;
import com.hotel.room.entity.Room;
import com.hotel.room.entity.RoomOperationalStatus;
import com.hotel.room.entity.RoomType;
import com.hotel.room.mapper.RoomMapper;
import com.hotel.room.repository.AmenityRepository;
import com.hotel.room.repository.RoomRepository;
import com.hotel.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final AmenityRepository amenityRepository;
    private final RoomMapper roomMapper;

    @Transactional(readOnly = true)
    public List<RoomResponse> getAllActiveRooms() {
        return roomRepository.findByActiveTrue().stream()
                .map(roomMapper::toRoomResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRoomsForAdmin() {
        return roomRepository.findAll().stream()
                .map(roomMapper::toRoomResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habitación no encontrada con ID: " + id));
        return roomMapper.toRoomResponse(room);
    }

    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request) {
        if (roomRepository.findByRoomNumber(request.getRoomNumber()).isPresent()) {
            throw new ConflictException("Ya existe una habitación registrada con el número: " + request.getRoomNumber());
        }

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de habitación no encontrado con ID: " + request.getRoomTypeId()));

        Set<Amenity> amenities = new HashSet<>();
        if (request.getAmenityIds() != null && !request.getAmenityIds().isEmpty()) {
            amenities = new HashSet<>(amenityRepository.findAllById(request.getAmenityIds()));
        }

        Room room = Room.builder()
                .roomNumber(request.getRoomNumber().trim())
                .roomType(roomType)
                .description(request.getDescription())
                .capacity(request.getCapacity())
                .bedCount(request.getBedCount())
                .pricePerNight(request.getPricePerNight())
                .operationalStatus(request.getOperationalStatus() != null ? request.getOperationalStatus() : RoomOperationalStatus.DISPONIBLE)
                .floor(request.getFloor())
                .imageUrl(request.getImageUrl())
                .active(true)
                .amenities(amenities)
                .build();

        Room saved = roomRepository.save(room);
        return roomMapper.toRoomResponse(saved);
    }

    @Transactional
    public RoomResponse updateRoom(Long id, CreateRoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habitación no encontrada con ID: " + id));

        if (!room.getRoomNumber().equals(request.getRoomNumber()) &&
                roomRepository.findByRoomNumber(request.getRoomNumber()).isPresent()) {
            throw new ConflictException("El número de habitación ya está en uso por otra habitación.");
        }

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de habitación no encontrado con ID: " + request.getRoomTypeId()));

        Set<Amenity> amenities = new HashSet<>();
        if (request.getAmenityIds() != null) {
            amenities = new HashSet<>(amenityRepository.findAllById(request.getAmenityIds()));
        }

        room.setRoomNumber(request.getRoomNumber().trim());
        room.setRoomType(roomType);
        room.setDescription(request.getDescription());
        room.setCapacity(request.getCapacity());
        room.setBedCount(request.getBedCount());
        room.setPricePerNight(request.getPricePerNight());
        if (request.getOperationalStatus() != null) {
            room.setOperationalStatus(request.getOperationalStatus());
        }
        room.setFloor(request.getFloor());
        room.setImageUrl(request.getImageUrl());
        room.setAmenities(amenities);

        Room updated = roomRepository.save(room);
        return roomMapper.toRoomResponse(updated);
    }

    @Transactional
    public RoomResponse updateOperationalStatus(Long id, RoomOperationalStatus status) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habitación no encontrada con ID: " + id));

        room.setOperationalStatus(status);
        Room updated = roomRepository.save(room);
        return roomMapper.toRoomResponse(updated);
    }

    @Transactional
    public void toggleActiveStatus(Long id, boolean active) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habitación no encontrada con ID: " + id));
        room.setActive(active);
        roomRepository.save(room);
    }

    @Transactional(readOnly = true)
    public List<RoomTypeResponse> getAllRoomTypes() {
        return roomTypeRepository.findByActiveTrue().stream()
                .map(roomMapper::toRoomTypeResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AmenityResponse> getAllAmenities() {
        return amenityRepository.findByActiveTrue().stream()
                .map(roomMapper::toAmenityResponse)
                .collect(Collectors.toList());
    }
}

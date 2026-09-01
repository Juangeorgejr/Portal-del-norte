package com.hotel.service.service;

import com.hotel.common.exception.ResourceNotFoundException;
import com.hotel.service.entity.HotelService;
import com.hotel.service.entity.ServiceCategory;
import com.hotel.service.repository.HotelServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelServiceService {

    private final HotelServiceRepository hotelServiceRepository;

    @Transactional(readOnly = true)
    public List<HotelService> getAllActiveServices() {
        return hotelServiceRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<HotelService> getServicesByCategory(ServiceCategory category) {
        return hotelServiceRepository.findByCategoryAndActiveTrue(category);
    }

    @Transactional
    public HotelService createService(HotelService service) {
        service.setActive(true);
        return hotelServiceRepository.save(service);
    }

    @Transactional
    public HotelService updateService(Long id, HotelService updated) {
        HotelService existing = hotelServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado con ID: " + id));

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setCategory(updated.getCategory());
        if (updated.isActive() != existing.isActive()) {
            existing.setActive(updated.isActive());
        }
        return hotelServiceRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public List<HotelService> getAllServicesForAdmin() {
        return hotelServiceRepository.findAll();
    }

    @Transactional
    public void toggleActiveStatus(Long id, boolean active) {
        HotelService service = hotelServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado con ID: " + id));
        service.setActive(active);
        hotelServiceRepository.save(service);
    }
}

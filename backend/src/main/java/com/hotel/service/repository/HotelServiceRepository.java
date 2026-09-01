package com.hotel.service.repository;

import com.hotel.service.entity.HotelService;
import com.hotel.service.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelServiceRepository extends JpaRepository<HotelService, Long> {
    List<HotelService> findByActiveTrue();
    List<HotelService> findByCategoryAndActiveTrue(ServiceCategory category);
}

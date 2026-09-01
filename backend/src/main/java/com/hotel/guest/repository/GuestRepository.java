package com.hotel.guest.repository;

import com.hotel.guest.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {
    Optional<Guest> findByEmail(String email);
    Optional<Guest> findByUserId(Long userId);
    Optional<Guest> findByDocumentTypeAndDocumentNumber(String documentType, String documentNumber);
}

package com.hotel.payment.repository;

import com.hotel.payment.entity.Payment;
import com.hotel.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPaymentReference(String paymentReference);
    Optional<Payment> findByBookingId(Long bookingId);
    List<Payment> findByStatus(PaymentStatus status);
}

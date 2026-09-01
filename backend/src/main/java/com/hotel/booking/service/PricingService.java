package com.hotel.booking.service;

import com.hotel.booking.dto.PriceCalculationRequest;
import com.hotel.booking.dto.PriceCalculationResponse;
import com.hotel.common.exception.ResourceNotFoundException;
import com.hotel.room.entity.Room;
import com.hotel.room.repository.RoomRepository;
import com.hotel.service.entity.HotelService;
import com.hotel.service.repository.HotelServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PricingService {

    private final RoomRepository roomRepository;
    private final HotelServiceRepository hotelServiceRepository;

    @Value("${hotel.tax.iva-rate:0.19}")
    private BigDecimal ivaRate;

    @Value("${hotel.cancellation.free-cancellation-hours:48}")
    private int freeCancellationHours;

    public PriceCalculationResponse calculatePrice(PriceCalculationRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Habitación no encontrada con ID: " + request.getRoomId()));

        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        if (nights <= 0) {
            nights = 1;
        }

        BigDecimal pricePerNight = room.getPricePerNight();
        BigDecimal subtotalRoom = pricePerNight.multiply(BigDecimal.valueOf(nights));

        BigDecimal servicesTotal = BigDecimal.ZERO;
        if (request.getServices() != null && !request.getServices().isEmpty()) {
            Map<Long, Integer> serviceQuantities = new HashMap<>();
            for (var item : request.getServices()) {
                serviceQuantities.put(item.getServiceId(), item.getQuantity() != null ? item.getQuantity() : 1);
            }

            List<HotelService> services = hotelServiceRepository.findAllById(serviceQuantities.keySet());
            for (HotelService service : services) {
                int qty = serviceQuantities.getOrDefault(service.getId(), 1);
                servicesTotal = servicesTotal.add(service.getPrice().multiply(BigDecimal.valueOf(qty)));
            }
        }

        BigDecimal subtotal = subtotalRoom.add(servicesTotal);
        BigDecimal taxAmount = subtotal.multiply(ivaRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal total = subtotal.add(taxAmount).subtract(discountAmount);

        // Cálculo de política de cancelación
        LocalDateTime checkInDateTime = request.getCheckInDate().atTime(LocalTime.of(15, 0)); // Check-in standard 15:00 hrs
        LocalDateTime freeCancellationUntil = checkInDateTime.minusHours(freeCancellationHours);
        BigDecimal penaltyIfLate = pricePerNight; // Penalidad estándar: valor de la 1ra noche

        PriceCalculationResponse.CancellationPolicyDto policyDto = PriceCalculationResponse.CancellationPolicyDto.builder()
                .freeCancellationUntil(freeCancellationUntil)
                .policyDescription(String.format("Cancelación gratuita hasta 48 horas antes de la llegada (%s). " +
                        "Cancelaciones posteriores o no-show incurren en penalidad equivalente a la primera noche.",
                        freeCancellationUntil.toLocalDate()))
                .penaltyIfLate(penaltyIfLate)
                .build();

        return PriceCalculationResponse.builder()
                .pricePerNight(pricePerNight)
                .numberOfNights((int) nights)
                .subtotalRoom(subtotalRoom)
                .servicesTotal(servicesTotal)
                .subtotal(subtotal)
                .taxRate(ivaRate)
                .taxAmount(taxAmount)
                .discountAmount(discountAmount)
                .total(total)
                .cancellationPolicy(policyDto)
                .build();
    }
}

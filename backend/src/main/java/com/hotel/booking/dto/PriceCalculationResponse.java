package com.hotel.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceCalculationResponse {

    private BigDecimal pricePerNight;
    private Integer numberOfNights;
    private BigDecimal subtotalRoom;
    private BigDecimal servicesTotal;
    private BigDecimal subtotal;
    private BigDecimal taxRate; // 0.19 (19% IVA)
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal total;
    private CancellationPolicyDto cancellationPolicy;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CancellationPolicyDto {
        private LocalDateTime freeCancellationUntil;
        private String policyDescription;
        private BigDecimal penaltyIfLate;
    }
}

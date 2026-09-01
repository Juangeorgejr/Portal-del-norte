package com.hotel.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAnalyticsResponse {

    private BigDecimal totalRevenueCOP;
    private BigDecimal monthlyRevenueCOP;
    private long totalBookings;
    private long activeGuestsCount;
    private double occupancyRatePercent;

    private List<MonthlyRevenueItem> revenueHistory;
    private List<RoomTypePopularityItem> roomTypeDistribution;
    private List<RecentActivityItem> recentActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenueItem {
        private String month;
        private BigDecimal revenue;
        private long bookingsCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomTypePopularityItem {
        private String roomTypeName;
        private long totalBookings;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivityItem {
        private String id;
        private String type; // BOOKING, CHECK_IN, CHECK_OUT, PAYMENT
        private String description;
        private String timestamp;
        private String amount;
    }
}

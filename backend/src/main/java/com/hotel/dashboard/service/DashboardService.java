package com.hotel.dashboard.service;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.BookingStatus;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.dashboard.dto.DashboardAnalyticsResponse;
import com.hotel.payment.entity.Payment;
import com.hotel.payment.entity.PaymentStatus;
import com.hotel.payment.repository.PaymentRepository;
import com.hotel.room.entity.Room;
import com.hotel.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final RoomRepository roomRepository;

    @Transactional(readOnly = true)
    public DashboardAnalyticsResponse getAnalytics() {
        List<Booking> allBookings = bookingRepository.findAll();
        List<Payment> approvedPayments = paymentRepository.findByStatus(PaymentStatus.APPROVED);
        List<Room> allRooms = roomRepository.findAll();

        // 1. Ingresos Totales
        BigDecimal totalRevenue = approvedPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Ingresos del Mes Actual
        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();

        BigDecimal monthlyRevenue = approvedPayments.stream()
                .filter(p -> p.getPaidAt() != null &&
                        p.getPaidAt().getYear() == currentYear &&
                        p.getPaidAt().getMonthValue() == currentMonth)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Ocupación Actual
        long occupiedRoomsCount = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_IN)
                .count();

        double occupancyRate = 0.0;
        if (!allRooms.isEmpty()) {
            occupancyRate = ((double) occupiedRoomsCount / allRooms.size()) * 100.0;
        }

        // 4. Historial Mensual de Ingresos (Últimos 6 meses)
        List<DashboardAnalyticsResponse.MonthlyRevenueItem> revenueHistory = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy", new Locale("es", "CO"));

        for (int i = 5; i >= 0; i--) {
            LocalDate targetDate = now.minusMonths(i);
            int y = targetDate.getYear();
            int m = targetDate.getMonthValue();

            List<Payment> monthPayments = approvedPayments.stream()
                    .filter(p -> p.getPaidAt() != null &&
                            p.getPaidAt().getYear() == y &&
                            p.getPaidAt().getMonthValue() == m)
                    .collect(Collectors.toList());

            BigDecimal sum = monthPayments.stream()
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            revenueHistory.add(DashboardAnalyticsResponse.MonthlyRevenueItem.builder()
                    .month(targetDate.format(monthFormatter))
                    .revenue(sum)
                    .bookingsCount(monthPayments.size())
                    .build());
        }

        // 5. Popularidad y distribución por Tipo de Habitación
        Map<String, List<Booking>> bookingsByType = allBookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELADA)
                .collect(Collectors.groupingBy(b -> b.getRoom().getRoomType().getName()));

        List<DashboardAnalyticsResponse.RoomTypePopularityItem> typeDistribution = new ArrayList<>();
        bookingsByType.forEach((typeName, bList) -> {
            BigDecimal rev = bList.stream()
                    .map(Booking::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            typeDistribution.add(DashboardAnalyticsResponse.RoomTypePopularityItem.builder()
                    .roomTypeName(typeName)
                    .totalBookings(bList.size())
                    .revenue(rev)
                    .build());
        });

        // 6. Actividad Reciente
        List<DashboardAnalyticsResponse.RecentActivityItem> recentActivities = allBookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
                .limit(6)
                .map(b -> DashboardAnalyticsResponse.RecentActivityItem.builder()
                        .id(b.getBookingCode())
                        .type(b.getStatus().name())
                        .description(String.format("Reserva %s - Hab. %s (%s %s)",
                                b.getBookingCode(), b.getRoom().getRoomNumber(),
                                b.getGuest().getFirstName(), b.getGuest().getLastName()))
                        .timestamp(b.getCreatedAt().toString())
                        .amount(b.getTotal().toString())
                        .build())
                .collect(Collectors.toList());

        return DashboardAnalyticsResponse.builder()
                .totalRevenueCOP(totalRevenue)
                .monthlyRevenueCOP(monthlyRevenue)
                .totalBookings(allBookings.size())
                .activeGuestsCount(occupiedRoomsCount)
                .occupancyRatePercent(BigDecimal.valueOf(occupancyRate).setScale(1, RoundingMode.HALF_UP).doubleValue())
                .revenueHistory(revenueHistory)
                .roomTypeDistribution(typeDistribution)
                .recentActivity(recentActivities)
                .build();
    }
}

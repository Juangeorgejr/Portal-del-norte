package com.hotel.booking.service;

import com.hotel.booking.dto.PriceCalculationRequest;
import com.hotel.booking.dto.PriceCalculationResponse;
import com.hotel.room.entity.Room;
import com.hotel.room.repository.RoomRepository;
import com.hotel.service.entity.HotelService;
import com.hotel.service.entity.ServiceCategory;
import com.hotel.service.repository.HotelServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PricingServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private HotelServiceRepository hotelServiceRepository;

    @InjectMocks
    private PricingService pricingService;

    private Room mockRoom;
    private HotelService mockBreakfast;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(pricingService, "ivaRate", new BigDecimal("0.19"));
        ReflectionTestUtils.setField(pricingService, "freeCancellationHours", 48);

        mockRoom = Room.builder()
                .id(1L)
                .roomNumber("101")
                .pricePerNight(new BigDecimal("120000.00")) // COP 120.000 / noche
                .build();

        mockBreakfast = HotelService.builder()
                .id(1L)
                .name("Desayuno Buffet Gourmet")
                .price(new BigDecimal("28000.00")) // COP 28.000
                .category(ServiceCategory.FOOD)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Debe calcular correctamente el precio de 3 noches con IVA 19% en COP")
    void calculatePrice_WithoutServices_ShouldCalculateExactTaxes() {
        // Arrange
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = checkIn.plusDays(3); // 3 noches

        when(roomRepository.findById(1L)).thenReturn(Optional.of(mockRoom));

        PriceCalculationRequest request = new PriceCalculationRequest(
                1L, checkIn, checkOut, 2, List.of()
        );

        // Act
        PriceCalculationResponse response = pricingService.calculatePrice(request);

        // Assert: 3 noches * 120.000 = 360.000 subtotal. IVA 19% = 68.400. Total = 428.400 COP
        assertNotNull(response);
        assertEquals(3, response.getNumberOfNights());
        assertEquals(new BigDecimal("360000.00"), response.getSubtotalRoom());
        assertEquals(BigDecimal.ZERO, response.getServicesTotal());
        assertEquals(new BigDecimal("360000.00"), response.getSubtotal());
        assertEquals(new BigDecimal("68400.00"), response.getTaxAmount());
        assertEquals(new BigDecimal("428400.00"), response.getTotal());
        assertNotNull(response.getCancellationPolicy());
    }

    @Test
    @DisplayName("Debe incluir servicios adicionales en el subtotal y total de la cotización")
    void calculatePrice_WithAdditionalServices_ShouldIncludeServicePrices() {
        // Arrange
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = checkIn.plusDays(2); // 2 noches

        when(roomRepository.findById(1L)).thenReturn(Optional.of(mockRoom));
        when(hotelServiceRepository.findAllById(org.mockito.ArgumentMatchers.anySet()))
                .thenReturn(List.of(mockBreakfast));

        PriceCalculationRequest.ServiceSelectionDto serviceDto = 
                new PriceCalculationRequest.ServiceSelectionDto(1L, 2); // 2 desayunos = 56.000

        PriceCalculationRequest request = new PriceCalculationRequest(
                1L, checkIn, checkOut, 2, List.of(serviceDto)
        );

        // Act
        PriceCalculationResponse response = pricingService.calculatePrice(request);

        // Assert:
        // Habitación: 2 * 120.000 = 240.000
        // Servicios: 2 * 28.000 = 56.000
        // Subtotal = 296.000
        // IVA 19% de 296.000 = 56.240
        // Total = 352.240 COP
        assertNotNull(response);
        assertEquals(new BigDecimal("240000.00"), response.getSubtotalRoom());
        assertEquals(new BigDecimal("56000.00"), response.getServicesTotal());
        assertEquals(new BigDecimal("296000.00"), response.getSubtotal());
        assertEquals(new BigDecimal("56240.00"), response.getTaxAmount());
        assertEquals(new BigDecimal("352240.00"), response.getTotal());
    }
}

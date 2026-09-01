package com.hotel.booking.service;

import com.hotel.auth.dto.UserResponse;
import com.hotel.booking.dto.BookingResponse;
import com.hotel.booking.dto.CreateBookingRequest;
import com.hotel.booking.dto.PriceCalculationRequest;
import com.hotel.booking.dto.PriceCalculationResponse;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.BookingServiceItem;
import com.hotel.booking.entity.BookingStatus;
import com.hotel.booking.mapper.BookingMapper;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.common.exception.BusinessException;
import com.hotel.common.exception.ConflictException;
import com.hotel.common.exception.ResourceNotFoundException;
import com.hotel.guest.entity.Guest;
import com.hotel.guest.repository.GuestRepository;
import com.hotel.payment.entity.Payment;
import com.hotel.payment.repository.PaymentRepository;
import com.hotel.room.entity.Room;
import com.hotel.room.repository.RoomRepository;
import com.hotel.service.entity.HotelService;
import com.hotel.service.repository.HotelServiceRepository;
import com.hotel.user.entity.User;
import com.hotel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final GuestRepository guestRepository;
    private final HotelServiceRepository hotelServiceRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PricingService pricingService;
    private final BookingMapper bookingMapper;

    @Value("${hotel.cancellation.free-cancellation-hours:48}")
    private int freeCancellationHours;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, String currentUserEmail) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Habitación no encontrada con ID: " + request.getRoomId()));

        if (!room.isActive()) {
            throw new BusinessException("La habitación no se encuentra activa para reservas.");
        }

        // Verificación anti-solapamiento estricta en base de datos
        boolean available = roomRepository.isRoomAvailable(room.getId(), request.getCheckInDate(), request.getCheckOutDate());
        if (!available) {
            throw new ConflictException("La habitación seleccionada ya no está disponible para las fechas solicitadas.");
        }

        // Cálculo y validación de precios directamente en el backend
        PriceCalculationRequest calcReq = new PriceCalculationRequest(
                request.getRoomId(),
                request.getCheckInDate(),
                request.getCheckOutDate(),
                request.getGuestCount(),
                request.getServices()
        );
        PriceCalculationResponse pricing = pricingService.calculatePrice(calcReq);

        // Registro o búsqueda de datos del Huésped
        User currentUser = null;
        if (currentUserEmail != null) {
            currentUser = userRepository.findByEmail(currentUserEmail).orElse(null);
        }

        Guest guest = findOrCreateGuest(request.getGuest(), currentUser);

        // Código de reserva amigable: PN-YYYYMMDD-XXXX
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String bookingCode = String.format("PN-%s-%s", datePrefix, randomSuffix);

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .guest(guest)
                .room(room)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .guestCount(request.getGuestCount())
                .pricePerNight(pricing.getPricePerNight())
                .numberOfNights(pricing.getNumberOfNights())
                .subtotal(pricing.getSubtotal())
                .taxAmount(pricing.getTaxAmount())
                .discountAmount(pricing.getDiscountAmount())
                .total(pricing.getTotal())
                .status(BookingStatus.PENDIENTE)
                .createdByUser(currentUser)
                .build();

        // Agregar servicios adicionales
        if (request.getServices() != null && !request.getServices().isEmpty()) {
            List<BookingServiceItem> serviceItems = new ArrayList<>();
            for (var itemReq : request.getServices()) {
                HotelService hService = hotelServiceRepository.findById(itemReq.getServiceId())
                        .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado con ID: " + itemReq.getServiceId()));

                int qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : 1;
                BookingServiceItem serviceItem = BookingServiceItem.builder()
                        .booking(booking)
                        .service(hService)
                        .quantity(qty)
                        .unitPrice(hService.getPrice())
                        .total(hService.getPrice().multiply(java.math.BigDecimal.valueOf(qty)))
                        .build();
                serviceItems.add(serviceItem);
            }
            booking.setServices(serviceItems);
        }

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Reserva creada con éxito: {} para el huésped {}", savedBooking.getBookingCode(), guest.getEmail());

        return bookingMapper.toBookingResponse(savedBooking, null);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + id));
        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        return bookingMapper.toBookingResponse(booking, payment);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String code) {
        Booking booking = bookingRepository.findByBookingCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con código: " + code));
        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        return bookingMapper.toBookingResponse(booking, payment);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Guest guest = guestRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de huésped no encontrado"));

        List<Booking> bookings = bookingRepository.findByGuestIdOrderByCreatedAtDesc(guest.getId());
        return bookings.stream()
                .map(b -> {
                    Payment p = paymentRepository.findByBookingId(b.getId()).orElse(null);
                    return bookingMapper.toBookingResponse(b, p);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookingsForAdmin() {
        return bookingRepository.findAll().stream()
                .map(b -> {
                    Payment p = paymentRepository.findByBookingId(b.getId()).orElse(null);
                    return bookingMapper.toBookingResponse(b, p);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, String reason, String requestingUserEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + id));

        if (booking.getStatus() == BookingStatus.CANCELADA) {
            throw new BusinessException("La reserva ya se encuentra cancelada.");
        }

        if (booking.getStatus() == BookingStatus.CHECKED_IN || booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new BusinessException("No es posible cancelar una reserva que ya completó o inició su estancia.");
        }

        booking.setStatus(BookingStatus.CANCELADA);
        booking.setCancellationReason(reason != null ? reason : "Cancelación solicitada por el usuario");

        Booking updated = bookingRepository.save(booking);
        Payment payment = paymentRepository.findByBookingId(updated.getId()).orElse(null);

        log.info("Reserva cancelada: {}. Motivo: {}", updated.getBookingCode(), booking.getCancellationReason());
        return bookingMapper.toBookingResponse(updated, payment);
    }

    private Guest findOrCreateGuest(CreateBookingRequest.GuestDetailsDto dto, User user) {
        if (user != null) {
            var existingGuest = guestRepository.findByUserId(user.getId());
            if (existingGuest.isPresent()) {
                Guest g = existingGuest.get();
                g.setPhone(dto.getPhone());
                g.setDocumentType(dto.getDocumentType());
                g.setDocumentNumber(dto.getDocumentNumber());
                return guestRepository.save(g);
            }
        }

        var existingByDoc = guestRepository.findByDocumentTypeAndDocumentNumber(dto.getDocumentType(), dto.getDocumentNumber());
        if (existingByDoc.isPresent()) {
            return existingByDoc.get();
        }

        Guest newGuest = Guest.builder()
                .user(user)
                .firstName(dto.getFirstName().trim())
                .lastName(dto.getLastName().trim())
                .email(dto.getEmail().toLowerCase().trim())
                .phone(dto.getPhone().trim())
                .documentType(dto.getDocumentType())
                .documentNumber(dto.getDocumentNumber().trim())
                .build();

        return guestRepository.save(newGuest);
    }
}

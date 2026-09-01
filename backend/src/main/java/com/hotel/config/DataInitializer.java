package com.hotel.config;

import com.hotel.guest.entity.Guest;
import com.hotel.guest.repository.GuestRepository;
import com.hotel.room.entity.Amenity;
import com.hotel.room.entity.Room;
import com.hotel.room.entity.RoomOperationalStatus;
import com.hotel.room.entity.RoomType;
import com.hotel.room.repository.AmenityRepository;
import com.hotel.room.repository.RoomRepository;
import com.hotel.room.repository.RoomTypeRepository;
import com.hotel.service.entity.HotelService;
import com.hotel.service.entity.ServiceCategory;
import com.hotel.service.repository.HotelServiceRepository;
import com.hotel.user.entity.Role;
import com.hotel.user.entity.RoleName;
import com.hotel.user.entity.User;
import com.hotel.user.repository.RoleRepository;
import com.hotel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Set;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final GuestRepository guestRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final AmenityRepository amenityRepository;
    private final RoomRepository roomRepository;
    private final HotelServiceRepository hotelServiceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (roleRepository.count() > 0) {
            log.info("Datos ya inicializados en la base de datos.");
            return;
        }

        log.info("Inicializando datos semilla en base de datos de desarrollo (H2)...");

        // 1. Roles
        Role roleAdmin = roleRepository.save(new Role(null, RoleName.ROLE_ADMIN));
        Role roleEmpleado = roleRepository.save(new Role(null, RoleName.ROLE_EMPLEADO));
        Role roleCliente = roleRepository.save(new Role(null, RoleName.ROLE_CLIENTE));

        // 2. Usuarios Demo
        User admin = User.builder()
                .email("admin@portaldelnorte.com")
                .passwordHash(passwordEncoder.encode("Admin123*"))
                .active(true)
                .roles(Set.of(roleAdmin))
                .build();
        userRepository.save(admin);
        guestRepository.save(new Guest(null, admin, "Super", "Admin", "admin@portaldelnorte.com", "+57 300 000 0001", "CC", "1000000001"));

        User recepcion = User.builder()
                .email("recepcion@portaldelnorte.com")
                .passwordHash(passwordEncoder.encode("Recepcion123*"))
                .active(true)
                .roles(Set.of(roleEmpleado))
                .build();
        userRepository.save(recepcion);
        guestRepository.save(new Guest(null, recepcion, "Andrés", "Recepción", "recepcion@portaldelnorte.com", "+57 300 000 0002", "CC", "1000000002"));

        User cliente = User.builder()
                .email("carlos.gomez@gmail.com")
                .passwordHash(passwordEncoder.encode("Cliente123*"))
                .active(true)
                .roles(Set.of(roleCliente))
                .build();
        userRepository.save(cliente);
        guestRepository.save(new Guest(null, cliente, "Carlos", "Gómez", "carlos.gomez@gmail.com", "+57 310 456 7890", "CC", "1098765432"));

        // 3. Tipos de Habitación
        RoomType tIndividual = roomTypeRepository.save(RoomType.builder().name("Individual Standard").description("Habitación individual cómoda con escritorio de trabajo.").baseCapacity(1).baseBeds(1).basePricePerNight(new BigDecimal("120000.00")).active(true).build());
        RoomType tDoble = roomTypeRepository.save(RoomType.builder().name("Doble Standard").description("Habitación con dos camas individuales ideal para viajes de negocios o amigos.").baseCapacity(2).baseBeds(2).basePricePerNight(new BigDecimal("190000.00")).active(true).build());
        RoomType tMatrimonial = roomTypeRepository.save(RoomType.builder().name("Matrimonial Superior").description("Cama King Size con vista panorámica y balcón privado.").baseCapacity(2).baseBeds(1).basePricePerNight(new BigDecimal("240000.00")).active(true).build());
        RoomType tSuite = roomTypeRepository.save(RoomType.builder().name("Suite Ejecutiva").description("Suite de lujo con sala de estar, jacuzzi y minibar prémium.").baseCapacity(3).baseBeds(2).basePricePerNight(new BigDecimal("380000.00")).active(true).build());
        RoomType tFamiliar = roomTypeRepository.save(RoomType.builder().name("Familiar Confort").description("Espacio amplio para familias con 2 camas dobles y área infantil.").baseCapacity(4).baseBeds(3).basePricePerNight(new BigDecimal("320000.00")).active(true).build());

        // 4. Amenidades
        Amenity aWifi = amenityRepository.save(Amenity.builder().name("Wi-Fi de Alta Velocidad").icon("wifi").active(true).build());
        Amenity aAc = amenityRepository.save(Amenity.builder().name("Aire Acondicionado").icon("air-vent").active(true).build());
        Amenity aTv = amenityRepository.save(Amenity.builder().name("Smart TV 55\"").icon("tv").active(true).build());
        Amenity aJacuzzi = amenityRepository.save(Amenity.builder().name("Jacuzzi Privado").icon("sparkles").active(true).build());
        Amenity aMinibar = amenityRepository.save(Amenity.builder().name("Minibar Prémium").icon("coffee").active(true).build());

        // 5. Habitaciones Físicas
        roomRepository.save(Room.builder().roomNumber("101").roomType(tIndividual).capacity(1).bedCount(1).pricePerNight(new BigDecimal("120000.00")).operationalStatus(RoomOperationalStatus.DISPONIBLE).floor("1").imageUrl("https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80").active(true).amenities(Set.of(aWifi, aAc, aTv)).build());
        roomRepository.save(Room.builder().roomNumber("102").roomType(tDoble).capacity(2).bedCount(2).pricePerNight(new BigDecimal("190000.00")).operationalStatus(RoomOperationalStatus.DISPONIBLE).floor("1").imageUrl("https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80").active(true).amenities(Set.of(aWifi, aAc, aTv)).build());
        roomRepository.save(Room.builder().roomNumber("201").roomType(tMatrimonial).capacity(2).bedCount(1).pricePerNight(new BigDecimal("240000.00")).operationalStatus(RoomOperationalStatus.DISPONIBLE).floor("2").imageUrl("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80").active(true).amenities(Set.of(aWifi, aAc, aTv, aMinibar)).build());
        roomRepository.save(Room.builder().roomNumber("202").roomType(tMatrimonial).capacity(2).bedCount(1).pricePerNight(new BigDecimal("240000.00")).operationalStatus(RoomOperationalStatus.DISPONIBLE).floor("2").imageUrl("https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80").active(true).amenities(Set.of(aWifi, aAc, aTv, aMinibar)).build());
        roomRepository.save(Room.builder().roomNumber("301").roomType(tSuite).capacity(3).bedCount(2).pricePerNight(new BigDecimal("380000.00")).operationalStatus(RoomOperationalStatus.DISPONIBLE).floor("3").imageUrl("https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80").active(true).amenities(Set.of(aWifi, aAc, aTv, aJacuzzi, aMinibar)).build());
        roomRepository.save(Room.builder().roomNumber("302").roomType(tSuite).capacity(3).bedCount(2).pricePerNight(new BigDecimal("380000.00")).operationalStatus(RoomOperationalStatus.DISPONIBLE).floor("3").imageUrl("https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80").active(true).amenities(Set.of(aWifi, aAc, aTv, aJacuzzi, aMinibar)).build());
        roomRepository.save(Room.builder().roomNumber("401").roomType(tFamiliar).capacity(4).bedCount(3).pricePerNight(new BigDecimal("320000.00")).operationalStatus(RoomOperationalStatus.DISPONIBLE).floor("4").imageUrl("https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80").active(true).amenities(Set.of(aWifi, aAc, aTv)).build());
        roomRepository.save(Room.builder().roomNumber("402").roomType(tFamiliar).capacity(4).bedCount(3).pricePerNight(new BigDecimal("320000.00")).operationalStatus(RoomOperationalStatus.DISPONIBLE).floor("4").imageUrl("https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80").active(true).amenities(Set.of(aWifi, aAc, aTv)).build());

        // 6. Servicios Adicionales
        hotelServiceRepository.save(new HotelService(null, "Desayuno Buffet Gourmet", "Desayuno continental y típico con frutas tropicales, huevos al gusto y café de origen.", new BigDecimal("28000.00"), ServiceCategory.FOOD, true));
        hotelServiceRepository.save(new HotelService(null, "Transporte Aeropuerto (Van)", "Traslado privado desde o hacia el aeropuerto en vehículo climatizado.", new BigDecimal("85000.00"), ServiceCategory.TRANSPORT, true));
        hotelServiceRepository.save(new HotelService(null, "Servicio de Lavandería Express", "Lavado y planchado prémium con entrega el mismo día.", new BigDecimal("35000.00"), ServiceCategory.LAUNDRY, true));
        hotelServiceRepository.save(new HotelService(null, "Tour Histórico de la Ciudad", "Recorrido guiado por el centro histórico y museos con guía bilingüe.", new BigDecimal("65000.00"), ServiceCategory.TOUR, true));
        hotelServiceRepository.save(new HotelService(null, "Parqueadero Cubierto 24h", "Estacionamiento privado con vigilancia por circuito cerrado.", new BigDecimal("20000.00"), ServiceCategory.PARKING, true));

        log.info("Datos semilla cargados exitosamente en H2.");
    }
}

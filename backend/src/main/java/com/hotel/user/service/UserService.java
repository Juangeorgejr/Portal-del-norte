package com.hotel.user.service;

import com.hotel.auth.dto.UserResponse;
import com.hotel.common.exception.ConflictException;
import com.hotel.common.exception.ResourceNotFoundException;
import com.hotel.guest.entity.Guest;
import com.hotel.guest.repository.GuestRepository;
import com.hotel.user.dto.CreateEmployeeRequest;
import com.hotel.user.dto.UserDetailResponse;
import com.hotel.user.entity.Role;
import com.hotel.user.entity.RoleName;
import com.hotel.user.entity.User;
import com.hotel.user.repository.RoleRepository;
import com.hotel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final GuestRepository guestRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserDetailResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDetailResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDetailResponse createEmployee(CreateEmployeeRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new ConflictException("Ya existe un usuario registrado con el correo: " + request.getEmail());
        }

        final RoleName roleName = "ROLE_ADMIN".equalsIgnoreCase(request.getRole())
                ? RoleName.ROLE_ADMIN
                : RoleName.ROLE_EMPLEADO;

        Role assignedRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + roleName));

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .roles(Set.of(assignedRole))
                .build();

        User savedUser = userRepository.save(user);

        Guest guest = Guest.builder()
                .user(savedUser)
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone().trim())
                .documentType(request.getDocumentType())
                .documentNumber(request.getDocumentNumber().trim())
                .build();

        guestRepository.save(guest);
        savedUser.setGuest(guest);

        log.info("Nuevo empleado registrado por Admin: {} con rol {}", savedUser.getEmail(), roleName);
        return mapToUserDetailResponse(savedUser);
    }

    @Transactional
    public UserDetailResponse toggleUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));

        user.setActive(active);
        User updated = userRepository.save(user);
        log.info("Estado de usuario {} actualizado a activo={}", user.getEmail(), active);
        return mapToUserDetailResponse(updated);
    }

    private UserDetailResponse mapToUserDetailResponse(User user) {
        Guest guest = guestRepository.findByUserId(user.getId()).orElse(null);
        UserResponse.GuestDto guestDto = null;
        if (guest != null) {
            guestDto = UserResponse.GuestDto.builder()
                    .id(guest.getId())
                    .firstName(guest.getFirstName())
                    .lastName(guest.getLastName())
                    .email(guest.getEmail())
                    .phone(guest.getPhone())
                    .documentType(guest.getDocumentType())
                    .documentNumber(guest.getDocumentNumber())
                    .build();
        }

        return UserDetailResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .active(user.isActive())
                .roles(user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()))
                .profile(guestDto)
                .createdAt(user.getCreatedAt())
                .build();
    }
}

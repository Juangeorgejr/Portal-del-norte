package com.hotel.auth.service;

import com.hotel.auth.dto.AuthResponse;
import com.hotel.auth.dto.LoginRequest;
import com.hotel.auth.dto.RegisterRequest;
import com.hotel.auth.dto.UserResponse;
import com.hotel.common.exception.ConflictException;
import com.hotel.common.exception.ResourceNotFoundException;
import com.hotel.guest.entity.Guest;
import com.hotel.guest.repository.GuestRepository;
import com.hotel.security.jwt.JwtTokenProvider;
import com.hotel.user.entity.Role;
import com.hotel.user.entity.RoleName;
import com.hotel.user.entity.User;
import com.hotel.user.repository.RoleRepository;
import com.hotel.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final GuestRepository guestRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Ya existe una cuenta registrada con el correo: " + request.getEmail());
        }

        Role clientRole = roleRepository.findByName(RoleName.ROLE_CLIENTE)
                .orElseThrow(() -> new ResourceNotFoundException("Rol ROLE_CLIENTE no configurado"));

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .roles(Set.of(clientRole))
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

        Guest savedGuest = guestRepository.save(guest);
        savedUser.setGuest(savedGuest);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(savedUser, savedGuest))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Guest guest = guestRepository.findByUserId(user.getId()).orElse(null);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user, guest))
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Guest guest = guestRepository.findByUserId(user.getId()).orElse(null);
        return mapToUserResponse(user, guest);
    }

    private UserResponse mapToUserResponse(User user, Guest guest) {
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

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()))
                .guestProfile(guestDto)
                .build();
    }
}

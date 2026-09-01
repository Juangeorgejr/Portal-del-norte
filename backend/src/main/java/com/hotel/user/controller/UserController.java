package com.hotel.user.controller;

import com.hotel.user.dto.CreateEmployeeRequest;
import com.hotel.user.dto.UserDetailResponse;
import com.hotel.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Administración de Usuarios", description = "Endpoints exclusivos de ADMIN para gestión de personal y usuarios")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Listar todos los usuarios registrados con sus roles")
    public ResponseEntity<List<UserDetailResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/employees")
    @Operation(summary = "Crear nuevo empleado o administrador")
    public ResponseEntity<UserDetailResponse> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createEmployee(request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Activar o desactivar cuenta de usuario")
    public ResponseEntity<UserDetailResponse> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        return ResponseEntity.ok(userService.toggleUserStatus(id, active));
    }
}

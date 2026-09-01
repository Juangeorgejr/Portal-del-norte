package com.hotel.dashboard.controller;

import com.hotel.dashboard.dto.DashboardAnalyticsResponse;
import com.hotel.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Dashboard & Estadísticas", description = "Reportes ejecutivos de ingresos, ocupación y ventas (Solo ADMIN)")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/analytics")
    @Operation(summary = "Obtener consolidado de métricas financieras y ocupación")
    public ResponseEntity<DashboardAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(dashboardService.getAnalytics());
    }
}

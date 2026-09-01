package com.hotel.invoice.controller;

import com.hotel.auth.service.AuthService;
import com.hotel.invoice.entity.Invoice;
import com.hotel.invoice.service.InvoicePdfService;
import com.hotel.invoice.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Facturación", description = "Emisión y consulta de facturas electrónicas")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final InvoicePdfService invoicePdfService;
    private final AuthService authService;

    @GetMapping("/my")
    @Operation(summary = "Obtener facturas del cliente autenticado")
    public ResponseEntity<List<Invoice>> getMyInvoices(@AuthenticationPrincipal UserDetails userDetails) {
        var user = authService.getCurrentUser(userDetails.getUsername());
        if (user.getGuestProfile() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(invoiceService.getInvoicesByGuestId(user.getGuestProfile().getId()));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    @Operation(summary = "Listar todas las facturas emitidas por el hotel")
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Descargar comprobante de factura electrónica en formato PDF")
    public ResponseEntity<byte[]> getInvoicePdf(@org.springframework.web.bind.annotation.PathVariable Long id) {
        Invoice invoice = invoiceService.getInvoiceById(id);
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/pdf")
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"Factura-" + invoice.getInvoiceNumber() + ".pdf\"")
                .body(pdfBytes);
    }
}

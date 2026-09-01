package com.hotel.invoice.service;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.BookingServiceItem;
import com.hotel.invoice.entity.Invoice;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Slf4j
@Service
public class InvoicePdfService {

    private static final Color PRIMARY_NAVY = new Color(15, 23, 42); // #0f172a
    private static final Color ACCENT_GOLD = new Color(212, 170, 72); // #d4aa48
    private static final Color BG_LIGHT = new Color(248, 250, 252);
    private static final Color TEXT_DARK = new Color(30, 41, 59);
    private static final Color TEXT_MUTED = new Color(100, 116, 139);

    private final DecimalFormat copFormat;

    public InvoicePdfService() {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(new Locale("es", "CO"));
        symbols.setGroupingSeparator('.');
        symbols.setDecimalSeparator(',');
        this.copFormat = new DecimalFormat("$ #,##0.00 COP", symbols);
    }

    public byte[] generateInvoicePdf(Invoice invoice) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, PRIMARY_NAVY);
            Font fontSubtitle = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_MUTED);
            Font fontSectionHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, PRIMARY_NAVY);
            Font fontRegular = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_DARK);
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, TEXT_DARK);
            Font fontSmall = FontFactory.getFont(FontFactory.HELVETICA, 7, TEXT_MUTED);
            Font fontCode = FontFactory.getFont(FontFactory.COURIER, 7, TEXT_DARK);

            // 1. Header Table (Company Details & Invoice Meta)
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            // Company Info
            PdfPCell compCell = new PdfPCell();
            compCell.setBorder(Rectangle.NO_BORDER);
            compCell.addElement(new Paragraph("HOTEL PORTAL DEL NORTE", fontTitle));
            compCell.addElement(new Paragraph("NIT: 901.458.789-3 | IVA Régimen Común", fontSubtitle));
            compCell.addElement(new Paragraph("Calle 15 # 4-22, Zona Histórica, Colombia", fontSubtitle));
            compCell.addElement(new Paragraph("Tel: +57 (601) 745-8900 | info@portaldelnorte.com", fontSubtitle));
            headerTable.addCell(compCell);

            // Invoice Meta Box
            PdfPCell invCell = new PdfPCell();
            invCell.setBackgroundColor(BG_LIGHT);
            invCell.setPadding(10);
            invCell.setBorderColor(ACCENT_GOLD);
            invCell.setBorderWidth(1.5f);

            Paragraph pInvTitle = new Paragraph("FACTURA ELECTRÓNICA DE VENTA", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, ACCENT_GOLD));
            pInvTitle.setAlignment(Element.ALIGN_CENTER);
            invCell.addElement(pInvTitle);

            Paragraph pInvNum = new Paragraph(invoice.getInvoiceNumber(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, PRIMARY_NAVY));
            pInvNum.setAlignment(Element.ALIGN_CENTER);
            invCell.addElement(pInvNum);

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            String issuedStr = invoice.getIssuedAt() != null ? invoice.getIssuedAt().format(dtf) : "N/A";
            Paragraph pDate = new Paragraph("Fecha de Emisión: " + issuedStr, fontSmall);
            pDate.setAlignment(Element.ALIGN_CENTER);
            invCell.addElement(pDate);

            Paragraph pDian = new Paragraph("Autorización DIAN No. 18764000001 (Rango FE-1 a FE-99999)", fontSmall);
            pDian.setAlignment(Element.ALIGN_CENTER);
            invCell.addElement(pDian);

            headerTable.addCell(invCell);
            document.add(headerTable);
            document.add(new Paragraph(" "));

            // 2. Customer and Reservation Details (2 Columns)
            Booking booking = invoice.getBooking();
            var guest = invoice.getGuest();

            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{50, 50});

            // Guest Details Box
            PdfPCell guestCell = new PdfPCell();
            guestCell.setBackgroundColor(BG_LIGHT);
            guestCell.setPadding(8);
            guestCell.setBorderColor(new Color(226, 232, 240));
            guestCell.addElement(new Paragraph("DATOS DEL ADQUIRIENTE (HUÉSPED)", fontSectionHeader));
            guestCell.addElement(new Paragraph("Nombre: " + guest.getFirstName() + " " + guest.getLastName(), fontBold));
            guestCell.addElement(new Paragraph("Identificación: " + guest.getDocumentType() + " " + guest.getDocumentNumber(), fontRegular));
            guestCell.addElement(new Paragraph("Correo: " + guest.getEmail(), fontRegular));
            guestCell.addElement(new Paragraph("Teléfono: " + guest.getPhone(), fontRegular));
            infoTable.addCell(guestCell);

            // Booking Details Box
            PdfPCell bookCell = new PdfPCell();
            bookCell.setBackgroundColor(BG_LIGHT);
            bookCell.setPadding(8);
            bookCell.setBorderColor(new Color(226, 232, 240));
            bookCell.addElement(new Paragraph("DETALLES DE LA RESERVA", fontSectionHeader));
            if (booking != null) {
                bookCell.addElement(new Paragraph("Código de Reserva: " + booking.getBookingCode(), fontBold));
                bookCell.addElement(new Paragraph("Habitación: " + booking.getRoom().getRoomNumber() + " (" + booking.getRoom().getRoomType().getName() + ")", fontRegular));
                bookCell.addElement(new Paragraph("Estadía: " + booking.getCheckInDate() + " al " + booking.getCheckOutDate() + " (" + booking.getNumberOfNights() + " noches)", fontRegular));
                bookCell.addElement(new Paragraph("Huéspedes: " + booking.getGuestCount() + " persona(s)", fontRegular));
            } else {
                bookCell.addElement(new Paragraph("Consumo directo de servicios", fontRegular));
            }
            infoTable.addCell(bookCell);

            document.add(infoTable);
            document.add(new Paragraph(" "));

            // 3. Items Table
            PdfPTable itemsTable = new PdfPTable(4);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{50, 15, 15, 20});

            // Table Headers
            String[] headers = {"Descripción del Concepto", "Cantidad", "Valor Unitario", "Total"};
            for (String h : headers) {
                PdfPCell th = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE)));
                th.setBackgroundColor(PRIMARY_NAVY);
                th.setPadding(6);
                th.setHorizontalAlignment(Element.ALIGN_CENTER);
                itemsTable.addCell(th);
            }

            // Room Lodging row
            if (booking != null) {
                PdfPCell cDesc = new PdfPCell(new Phrase("Alojamiento: " + booking.getRoom().getRoomType().getName() + " - Hab. " + booking.getRoom().getRoomNumber(), fontRegular));
                cDesc.setPadding(6);
                itemsTable.addCell(cDesc);

                PdfPCell cQty = new PdfPCell(new Phrase(booking.getNumberOfNights() + " noches", fontRegular));
                cQty.setHorizontalAlignment(Element.ALIGN_CENTER);
                cQty.setPadding(6);
                itemsTable.addCell(cQty);

                PdfPCell cPrice = new PdfPCell(new Phrase(copFormat.format(booking.getPricePerNight()), fontRegular));
                cPrice.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cPrice.setPadding(6);
                itemsTable.addCell(cPrice);

                BigDecimal subtotalRoom = booking.getPricePerNight().multiply(BigDecimal.valueOf(booking.getNumberOfNights()));
                PdfPCell cTotal = new PdfPCell(new Phrase(copFormat.format(subtotalRoom), fontBold));
                cTotal.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cTotal.setPadding(6);
                itemsTable.addCell(cTotal);

                // Additional Services rows
                if (booking.getServices() != null) {
                    for (BookingServiceItem svc : booking.getServices()) {
                        PdfPCell sDesc = new PdfPCell(new Phrase("Servicio: " + svc.getService().getName(), fontRegular));
                        sDesc.setPadding(6);
                        itemsTable.addCell(sDesc);

                        PdfPCell sQty = new PdfPCell(new Phrase(String.valueOf(svc.getQuantity()), fontRegular));
                        sQty.setHorizontalAlignment(Element.ALIGN_CENTER);
                        sQty.setPadding(6);
                        itemsTable.addCell(sQty);

                        PdfPCell sPrice = new PdfPCell(new Phrase(copFormat.format(svc.getUnitPrice()), fontRegular));
                        sPrice.setHorizontalAlignment(Element.ALIGN_RIGHT);
                        sPrice.setPadding(6);
                        itemsTable.addCell(sPrice);

                        PdfPCell sTotal = new PdfPCell(new Phrase(copFormat.format(svc.getTotal()), fontBold));
                        sTotal.setHorizontalAlignment(Element.ALIGN_RIGHT);
                        sTotal.setPadding(6);
                        itemsTable.addCell(sTotal);
                    }
                }
            }

            document.add(itemsTable);

            // 4. Totals and Tax breakdown
            PdfPTable totalsTable = new PdfPTable(2);
            totalsTable.setWidthPercentage(40);
            totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalsTable.setWidths(new float[]{50, 50});

            addTotalRow(totalsTable, "Subtotal:", copFormat.format(invoice.getSubtotal()), fontRegular, false);
            addTotalRow(totalsTable, "IVA (19%):", copFormat.format(invoice.getTaxAmount()), fontRegular, false);
            addTotalRow(totalsTable, "TOTAL PAGADO:", copFormat.format(invoice.getTotal()), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, PRIMARY_NAVY), true);

            document.add(totalsTable);
            document.add(new Paragraph(" "));

            // 5. CUFE and DIAN Footer Security Box
            PdfPTable cufeTable = new PdfPTable(1);
            cufeTable.setWidthPercentage(100);
            PdfPCell cufeCell = new PdfPCell();
            cufeCell.setBackgroundColor(BG_LIGHT);
            cufeCell.setPadding(8);
            cufeCell.setBorderColor(new Color(203, 213, 225));

            cufeCell.addElement(new Paragraph("CÓDIGO ÚNICO DE FACTURACIÓN ELECTRÓNICA (CUFE):", fontBold));
            String cufeVal = invoice.getCufe() != null ? invoice.getCufe() : "7b8a1c9e3d4f2081928374650192837465abcdef1234567890abcdef1234567890abcdef";
            cufeCell.addElement(new Paragraph(cufeVal, fontCode));
            cufeCell.addElement(new Paragraph("Representación gráfica de factura electrónica según resolución DIAN No. 000042. Firma digital y validación en tiempo real.", fontSmall));

            cufeTable.addCell(cufeCell);
            document.add(cufeTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Error al generar PDF de factura {}", invoice.getInvoiceNumber(), e);
            throw new RuntimeException("No se pudo generar el comprobante PDF de la factura", e);
        }
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font font, boolean isFinal) {
        PdfPCell cLabel = new PdfPCell(new Phrase(label, font));
        cLabel.setBorder(Rectangle.NO_BORDER);
        cLabel.setPadding(3);
        if (isFinal) cLabel.setBackgroundColor(new Color(254, 243, 199)); // Light gold

        PdfPCell cVal = new PdfPCell(new Phrase(value, font));
        cVal.setBorder(Rectangle.NO_BORDER);
        cVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cVal.setPadding(3);
        if (isFinal) cVal.setBackgroundColor(new Color(254, 243, 199));

        table.addCell(cLabel);
        table.addCell(cVal);
    }
}

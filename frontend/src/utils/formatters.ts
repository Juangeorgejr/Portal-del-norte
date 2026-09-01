import type { BookingStatus, RoomOperationalStatus } from '../types';

/**
 * Formatea un valor numérico a moneda colombiana (COP)
 * Ejemplo: 120000 -> "$ 120.000 COP"
 */
export const formatCOP = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount) + ' COP';
};

/**
 * Formatea una fecha ISO a formato legible en Colombia (ej. "15 Sep 2026")
 */
export const formatDateShort = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Clases de estilo Tailwind para estados de reserva
 */
export const getBookingStatusBadge = (status: BookingStatus) => {
  switch (status) {
    case 'CONFIRMADA':
      return { label: 'Confirmada', classes: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'PENDIENTE':
      return { label: 'Pendiente de Pago', classes: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'CHECKED_IN':
      return { label: 'Huésped en Hotel', classes: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'CHECKED_OUT':
      return { label: 'Completada', classes: 'bg-slate-100 text-slate-700 border-slate-200' };
    case 'CANCELADA':
      return { label: 'Cancelada', classes: 'bg-rose-100 text-rose-800 border-rose-200' };
    case 'NO_SHOW':
      return { label: 'No Show', classes: 'bg-purple-100 text-purple-800 border-purple-200' };
    default:
      return { label: status, classes: 'bg-slate-100 text-slate-800 border-slate-200' };
  }
};

/**
 * Clases de estilo Tailwind para estados operativos de habitación
 */
export const getRoomStatusBadge = (status: RoomOperationalStatus) => {
  switch (status) {
    case 'DISPONIBLE':
      return { label: 'Disponible', classes: 'bg-emerald-500 text-white' };
    case 'OCUPADA':
      return { label: 'Ocupada', classes: 'bg-rose-500 text-white' };
    case 'LIMPIEZA':
      return { label: 'En Limpieza', classes: 'bg-sky-500 text-white' };
    case 'MANTENIMIENTO':
      return { label: 'Mantenimiento', classes: 'bg-amber-500 text-white' };
    case 'FUERA_DE_SERVICIO':
      return { label: 'Fuera de Servicio', classes: 'bg-slate-600 text-white' };
    default:
      return { label: status, classes: 'bg-slate-500 text-white' };
  }
};

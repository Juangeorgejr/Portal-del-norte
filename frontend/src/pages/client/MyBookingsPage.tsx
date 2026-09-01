import React, { useState, useEffect } from 'react';
import type { Booking } from '../../types';
import { api } from '../../services/api';
import { formatCOP, formatDateShort, getBookingStatusBadge } from '../../utils/formatters';
import { Calendar, Ban, BedDouble } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    api.get<Booking[]>('/bookings/my')
      .then((res) => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('¿Está seguro de que desea cancelar esta reserva?')) return;

    try {
      await api.patch(`/bookings/${bookingId}/cancel`, {
        reason: 'Cancelación solicitada por el huésped desde portal web',
      });
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cancelar la reserva');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-gold-600 uppercase">
            Portal del Huésped
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 mt-1">
            Mis Reservas
          </h1>
        </div>

        <Link
          to="/rooms"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 gold-gradient shadow-md shadow-gold-500/20"
        >
          <BedDouble className="w-4 h-4" />
          Nueva Reserva
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-slate-800">
            No tiene reservas activas
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore nuestras habitaciones y suites disponibles para planificar su próxima estadía.
          </p>
          <Link
            to="/rooms"
            className="inline-block px-6 py-3 rounded-xl text-xs font-bold gold-gradient text-slate-950"
          >
            Ver Habitaciones
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const badge = getBookingStatusBadge(booking.status);
            const canCancel = booking.status === 'PENDIENTE' || booking.status === 'CONFIRMADA';

            return (
              <div
                key={booking.id}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                      {booking.bookingCode}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.classes}`}>
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-medium">
                    Reservado el {formatDateShort(booking.createdAt)}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Habitación</span>
                    <p className="font-bold text-slate-900 text-sm">
                      Hab. {booking.room?.roomNumber}
                    </p>
                    <p className="text-slate-600">{booking.room?.roomType?.name}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Estadía ({booking.numberOfNights} noches)</span>
                    <p className="font-semibold text-slate-900">
                      {formatDateShort(booking.checkInDate)} → {formatDateShort(booking.checkOutDate)}
                    </p>
                    <p className="text-slate-500">{booking.guestCount} {booking.guestCount === 1 ? 'huésped' : 'huéspedes'}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Total Pagado</span>
                    <p className="font-serif font-bold text-base text-gold-700">
                      {formatCOP(booking.total)}
                    </p>
                    <p className="text-[11px] text-slate-400">Incluye IVA (19%)</p>
                  </div>

                  <div className="flex items-center md:justify-end gap-2">
                    {canCancel && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Cancelar Reserva
                      </button>
                    )}
                  </div>
                </div>

                {booking.cancellationReason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-[11px]">
                    <strong>Motivo de cancelación:</strong> {booking.cancellationReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

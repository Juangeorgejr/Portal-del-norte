import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Booking } from '../../types';
import { formatCOP, formatDateShort, getBookingStatusBadge } from '../../utils/formatters';
import { Search, Filter, LogIn, LogOut } from 'lucide-react';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchBookings = () => {
    api.get<Booking[]>('/bookings/admin/all')
      .then((res) => setBookings(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePerformCheckIn = async (id: number) => {
    try {
      await api.post(`/management/check-in-out/check-in/${id}`);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al hacer check-in');
    }
  };

  const handlePerformCheckOut = async (id: number) => {
    try {
      await api.post(`/management/check-in-out/check-out/${id}`);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al hacer check-out');
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guest?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guest?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guest?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold tracking-widest text-gold-600 uppercase">
          Auditoría & Recepción
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 mt-1">
          Registro General de Reservas
        </h1>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, huésped, hab..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-gold-500 font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 outline-none cursor-pointer"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="CONFIRMADA">CONFIRMADA</option>
            <option value="CHECKED_IN">CHECKED_IN</option>
            <option value="CHECKED_OUT">CHECKED_OUT</option>
            <option value="CANCELADA">CANCELADA</option>
            <option value="NO_SHOW">NO_SHOW</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Huésped</th>
                <th className="px-6 py-4">Habitación</th>
                <th className="px-6 py-4">Fechas</th>
                <th className="px-6 py-4">Total (COP)</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Operación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((booking) => {
                const badge = getBookingStatusBadge(booking.status);
                return (
                  <tr key={booking.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {booking.bookingCode}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{booking.guest?.firstName} {booking.guest?.lastName}</p>
                      <p className="text-[11px] text-slate-400">{booking.guest?.email}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      Hab. {booking.room?.roomNumber} ({booking.room?.roomType?.name})
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDateShort(booking.checkInDate)} → {formatDateShort(booking.checkOutDate)}
                    </td>
                    <td className="px-6 py-4 font-serif font-bold text-slate-900">
                      {formatCOP(booking.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.status === 'CONFIRMADA' && (
                        <button
                          onClick={() => handlePerformCheckIn(booking.id)}
                          className="px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          Check-In
                        </button>
                      )}
                      {booking.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handlePerformCheckOut(booking.id)}
                          className="px-3 py-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Check-Out
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

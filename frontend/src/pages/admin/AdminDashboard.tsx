import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Room, Booking } from '../../types';
import { getRoomStatusBadge } from '../../utils/formatters';
import { 
  Users, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  LogOut,
  LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [checkInsToday, setCheckInsToday] = useState<Booking[]>([]);
  const [checkOutsToday, setCheckOutsToday] = useState<Booking[]>([]);

  const fetchDashboardData = async () => {
    try {
      const [roomsRes, checkInsRes, checkOutsRes] = await Promise.all([
        api.get<Room[]>('/rooms/admin/all'),
        api.get<Booking[]>('/management/check-in-out/today/check-ins'),
        api.get<Booking[]>('/management/check-in-out/today/check-outs'),
      ]);
      setRooms(roomsRes.data);
      setCheckInsToday(checkInsRes.data);
      setCheckOutsToday(checkOutsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePerformCheckIn = async (bookingId: number) => {
    try {
      await api.post(`/management/check-in-out/check-in/${bookingId}`);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al ejecutar Check-in');
    }
  };

  const handlePerformCheckOut = async (bookingId: number) => {
    try {
      await api.post(`/management/check-in-out/check-out/${bookingId}`);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al ejecutar Check-out');
    }
  };

  const handleQuickStatusChange = async (roomId: number, status: string) => {
    try {
      await api.patch(`/rooms/${roomId}/status`, { status });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const availableCount = rooms.filter(r => r.operationalStatus === 'DISPONIBLE').length;
  const occupiedCount = rooms.filter(r => r.operationalStatus === 'OCUPADA').length;
  const cleaningCount = rooms.filter(r => r.operationalStatus === 'LIMPIEZA').length;
  const maintenanceCount = rooms.filter(r => r.operationalStatus === 'MANTENIMIENTO').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-gold-600 uppercase">
            Panel de Control Hotelero
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 mt-1">
            Recepción & Operaciones
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/rooms"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-sm"
          >
            Gestionar Habitaciones
          </Link>
          <Link
            to="/admin/bookings"
            className="px-4 py-2.5 rounded-xl gold-gradient text-xs font-bold text-slate-950 shadow-md shadow-gold-500/20"
          >
            Todas las Reservas
          </Link>
        </div>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Disponibles</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-emerald-600">{availableCount}</p>
          <p className="text-[11px] text-slate-400">Listas para reservar</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Ocupadas</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-rose-600">{occupiedCount}</p>
          <p className="text-[11px] text-slate-400">Huéspedes en casa</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">En Limpieza</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-sky-600">{cleaningCount}</p>
          <p className="text-[11px] text-slate-400">Por camarería</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Mantenimiento</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-amber-600">{maintenanceCount}</p>
          <p className="text-[11px] text-slate-400">Fuera de servicio</p>
        </div>
      </div>

      {/* Check-ins & Check-outs of Today */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Expected Check-ins */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <LogIn className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Check-ins Esperados Hoy ({checkInsToday.length})
              </h3>
            </div>
          </div>

          {checkInsToday.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No hay más check-ins pendientes para la fecha de hoy.
            </p>
          ) : (
            <div className="space-y-3">
              {checkInsToday.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {booking.guest?.firstName} {booking.guest?.lastName}
                    </p>
                    <p className="text-slate-500">
                      Habitación <strong>{booking.room?.roomNumber}</strong> ({booking.room?.roomType?.name})
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{booking.bookingCode}</p>
                  </div>

                  <button
                    onClick={() => handlePerformCheckIn(booking.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Hacer Check-In
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expected Check-outs */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Check-outs Esperados Hoy ({checkOutsToday.length})
              </h3>
            </div>
          </div>

          {checkOutsToday.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No hay huéspedes programados para check-out hoy.
            </p>
          ) : (
            <div className="space-y-3">
              {checkOutsToday.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {booking.guest?.firstName} {booking.guest?.lastName}
                    </p>
                    <p className="text-slate-500">
                      Habitación <strong>{booking.room?.roomNumber}</strong> ({booking.room?.roomType?.name})
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{booking.bookingCode}</p>
                  </div>

                  <button
                    onClick={() => handlePerformCheckOut(booking.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Hacer Check-Out
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Room Operational Status Board */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900">
            Tablero de Estado Operativo de Habitaciones
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cambie rápidamente el estado operativo de cada habitación física con un click.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rooms.map((room) => {
            const badge = getRoomStatusBadge(room.operationalStatus);
            return (
              <div
                key={room.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg font-bold text-slate-900">
                      Hab. {room.roomNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.classes}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {room.roomType.name} (Piso {room.floor})
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cambiar Estado:</label>
                  <select
                    value={room.operationalStatus}
                    onChange={(e) => handleQuickStatusChange(room.id, e.target.value)}
                    className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-white outline-none cursor-pointer focus:border-gold-500"
                  >
                    <option value="DISPONIBLE">DISPONIBLE</option>
                    <option value="OCUPADA">OCUPADA</option>
                    <option value="LIMPIEZA">LIMPIEZA</option>
                    <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                    <option value="FUERA_DE_SERVICIO">FUERA DE SERVICIO</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

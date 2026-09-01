import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Room, RoomType } from '../../types';
import { api } from '../../services/api';
import { AvailabilitySearchBar } from '../../components/booking/AvailabilitySearchBar';
import { RoomCard } from '../../components/rooms/RoomCard';
import { BookingCheckoutModal } from '../../components/booking/BookingCheckoutModal';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

export const RoomsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const guestsParam = searchParams.get('guests');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedType, setSelectedType] = useState<number | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  // Load Room Types
  useEffect(() => {
    api.get<RoomType[]>('/rooms/types')
      .then((res) => setRoomTypes(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch Rooms based on Search Params or Catalog
  useEffect(() => {
    setLoading(true);

    if (checkInParam && checkOutParam) {
      api.get<Room[]>('/availability', {
        params: {
          checkIn: checkInParam,
          checkOut: checkOutParam,
          guests: guestsParam ? Number(guestsParam) : 1,
        }
      })
        .then((res) => setRooms(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      api.get<Room[]>('/rooms')
        .then((res) => setRooms(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [checkInParam, checkOutParam, guestsParam]);

  const handleSearch = (params: { checkIn: string; checkOut: string; guests: number }) => {
    setSearchParams({
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guests: params.guests.toString(),
    });
  };

  // Filter & Sort
  const filteredRooms = rooms
    .filter((room) => selectedType === 'ALL' || room.roomType.id === selectedType)
    .sort((a, b) => {
      if (sortOrder === 'ASC') return Number(a.pricePerNight) - Number(b.pricePerNight);
      return Number(b.pricePerNight) - Number(a.pricePerNight);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-gold-600 uppercase">
          Hotel Portal del Norte
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
          Catálogo de Habitaciones & Suites
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Encuentre el espacio perfecto para su viaje. Todas las tarifas en Pesos Colombianos (COP) con impuestos DIAN incluidos.
        </p>
      </div>

      {/* Interactive Search Bar */}
      <AvailabilitySearchBar
        onSearch={handleSearch}
        initialCheckIn={checkInParam || undefined}
        initialCheckOut={checkOutParam || undefined}
        initialGuests={guestsParam ? Number(guestsParam) : 2}
      />

      {/* Filter & Sorting Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        
        {/* Room Type Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedType === 'ALL'
                ? 'bg-slate-950 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({rooms.length})
          </button>
          {roomTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedType === type.id
                  ? 'bg-slate-950 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200 outline-none cursor-pointer"
          >
            <option value="ASC">Precio: Menor a Mayor</option>
            <option value="DESC">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-slate-900">
            No se encontraron habitaciones disponibles
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Pruebe modificando las fechas de estancia o la cantidad de huéspedes solicitados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onSelect={(selected) => setSelectedRoom(selected)}
            />
          ))}
        </div>
      )}

      {/* Booking Checkout Modal */}
      {selectedRoom && (
        <BookingCheckoutModal
          room={selectedRoom}
          initialCheckIn={checkInParam || undefined}
          initialCheckOut={checkOutParam || undefined}
          initialGuests={guestsParam ? Number(guestsParam) : 2}
          onClose={() => setSelectedRoom(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

import React from 'react';
import type { Room } from '../../types';
import { formatCOP, getRoomStatusBadge } from '../../utils/formatters';
import { Users, Bed, CheckCircle2, ArrowRight } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onSelect: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect }) => {
  const statusBadge = getRoomStatusBadge(room.operationalStatus);
  const isAvailable = room.operationalStatus === 'DISPONIBLE';

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-slate-900/10 transition-all duration-300 flex flex-col">
      
      {/* Image & Status Badge */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={room.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'}
          alt={room.roomType.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 backdrop-blur-md text-white border border-white/10">
            Habitación {room.roomNumber}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusBadge.classes}`}>
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold tracking-widest text-gold-600 uppercase">
              {room.roomType.name}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <span>Piso {room.floor}</span>
            </div>
          </div>

          <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-gold-600 transition-colors">
            {room.description || room.roomType.name}
          </h3>

          {/* Quick Specs */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gold-600" />
              Hasta {room.capacity} {room.capacity === 1 ? 'persona' : 'personas'}
            </span>
            <span className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-gold-600" />
              {room.bedCount} {room.bedCount === 1 ? 'cama' : 'camas'}
            </span>
          </div>

          {/* Amenities Badges */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {room.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {amenity.name}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 bg-slate-50">
                +{room.amenities.length - 4} más
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Tarifa por noche</p>
            <p className="text-lg font-bold text-slate-900 font-serif">
              {formatCOP(room.pricePerNight)}
            </p>
          </div>

          <button
            onClick={() => onSelect(room)}
            disabled={!isAvailable}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all transform active:scale-95 ${
              isAvailable
                ? 'gold-gradient text-slate-950 hover:opacity-95 shadow-md shadow-gold-500/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{isAvailable ? 'Reservar' : 'No disponible'}</span>
            {isAvailable && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

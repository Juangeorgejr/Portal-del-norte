import React, { useState } from 'react';
import { Calendar, Users, Search } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface AvailabilitySearchBarProps {
  onSearch: (params: { checkIn: string; checkOut: string; guests: number; roomTypeId?: number }) => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

export const AvailabilitySearchBar: React.FC<AvailabilitySearchBarProps> = ({
  onSearch,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
}) => {
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const dayAfterTomorrow = format(addDays(new Date(), 3), 'yyyy-MM-dd');

  const [checkIn, setCheckIn] = useState<string>(initialCheckIn || tomorrow);
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut || dayAfterTomorrow);
  const [guests, setGuests] = useState<number>(initialGuests);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      checkIn,
      checkOut,
      guests,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-2xl shadow-slate-950/10 border border-slate-200/80 grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
      >
        {/* Check-In */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 focus-within:border-gold-500 transition-colors">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gold-600" />
            Llegada (Check-in)
          </label>
          <input
            type="date"
            value={checkIn}
            min={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (e.target.value >= checkOut) {
                setCheckOut(format(addDays(new Date(e.target.value), 1), 'yyyy-MM-dd'));
              }
            }}
            className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
            required
          />
        </div>

        {/* Check-Out */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 focus-within:border-gold-500 transition-colors">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gold-600" />
            Salida (Check-out)
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn ? format(addDays(new Date(checkIn), 1), 'yyyy-MM-dd') : tomorrow}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
            required
          />
        </div>

        {/* Guests Selection */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 focus-within:border-gold-500 transition-colors">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gold-600" />
            Huéspedes
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
          >
            <option value={1}>1 Huésped</option>
            <option value={2}>2 Huéspedes</option>
            <option value={3}>3 Huéspedes</option>
            <option value={4}>4 Huéspedes</option>
            <option value={5}>5+ Huéspedes</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="h-full flex items-end">
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl text-slate-950 font-bold text-sm gold-gradient hover:opacity-95 shadow-lg shadow-gold-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Consultar Disponibilidad
          </button>
        </div>
      </form>
    </div>
  );
};

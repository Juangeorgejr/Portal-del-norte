import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Room } from '../../types';
import { api } from '../../services/api';
import { AvailabilitySearchBar } from '../../components/booking/AvailabilitySearchBar';
import { RoomCard } from '../../components/rooms/RoomCard';
import { BookingCheckoutModal } from '../../components/booking/BookingCheckoutModal';
import { 
  Sparkles, 
  ShieldCheck, 
  Coffee, 
  UtensilsCrossed, 
  Wifi, 
  Clock, 
  Award,
  ArrowRight,
  HeartHandshake
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Room[]>('/rooms')
      .then((res) => {
        setFeaturedRooms(res.data.slice(0, 4));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (params: { checkIn: string; checkOut: string; guests: number }) => {
    navigate(`/rooms?checkIn=${params.checkIn}&checkOut=${params.checkOut}&guests=${params.guests}`);
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section with Luxury Backdrop */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950">
        {/* Background Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 pt-12 pb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Experiencias de Hospitalidad en Colombia
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
            El arte de descansar con <span className="gold-text-gradient">elegancia y confort</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Bienvenido al <strong className="font-semibold text-white">Hotel Portal del Norte</strong>. Disfrute de suites exclusivas, gastronomía de autor y atención personalizada en cada detalle.
          </p>

          {/* Integrated Search Bar */}
          <div className="pt-4">
            <AvailabilitySearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Highlights & Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              icon: Award,
              title: 'Estándar 5 Estrellas',
              desc: 'Suites climatizadas con camas de alta gama, sábanas de 400 hilos y diseño premium.',
            },
            {
              icon: UtensilsCrossed,
              title: 'Gastronomía Local',
              desc: 'Desayuno buffet incluido con lo mejor del café y frutas frescas colombianas.',
            },
            {
              icon: ShieldCheck,
              title: 'Reserva 100% Segura',
              desc: 'Pagos electrónicos encriptados en COP y facturación electrónica DIAN inmediata.',
            },
            {
              icon: HeartHandshake,
              title: 'Cancelación Flexible',
              desc: 'Garantía de cancelación sin costo hasta 48 horas previas al día de llegada.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-gold-300 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600 mb-6 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Rooms Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest text-gold-600 uppercase">
              Colección Exclusiva
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
              Nuestras Habitaciones & Suites
            </h2>
          </div>

          <button
            onClick={() => navigate('/rooms')}
            className="inline-flex items-center gap-2 text-xs font-bold text-gold-700 hover:text-gold-800 transition-colors group"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-slate-200 rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onSelect={(selected) => setSelectedRoom(selected)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Services & Amenities Banner */}
      <section className="bg-hotel-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold tracking-widest text-gold-400 uppercase">
              Servicios Premium
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
              Diseñado para hacer su estancia inolvidable
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              En el Hotel Portal del Norte ponemos a su disposición una amplia gama de amenidades pensadas tanto para estadías de descanso familiar como viajes de negocios de alto nivel.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: Wifi, text: 'WiFi 6 de Ultra Alta Velocidad' },
                { icon: Coffee, text: 'Café & Desayuno Gourmet' },
                { icon: Clock, text: 'Recepción & Seguridad 24 Horas' },
                { icon: Sparkles, text: 'Servicio a la Habitación' },
              ].map((serv, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gold-400">
                    <serv.icon className="w-4 h-4" />
                  </div>
                  <span>{serv.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
              alt="Hotel Portal del Norte Ambiente"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Booking Checkout Modal */}
      {selectedRoom && (
        <BookingCheckoutModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSuccess={() => {
            // Callback opcional
          }}
        />
      )}
    </div>
  );
};

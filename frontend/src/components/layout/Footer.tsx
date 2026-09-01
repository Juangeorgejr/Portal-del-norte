import React from 'react';
import { Building2, Phone, Mail, MapPin, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-hotel-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand & About */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
                <Building2 className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-serif text-xl font-bold text-white">
                Portal del Norte
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Distinción, confort y hospitalidad de clase mundial. Disfrute de una experiencia inolvidable en su estancia en Colombia.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Facturación Electrónica DIAN</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Navegación
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-gold-400 transition-colors">Inicio</Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-gold-400 transition-colors">Habitaciones & Suites</Link>
              </li>
              <li>
                <Link to="/rooms?search=true" className="hover:text-gold-400 transition-colors">Consultar Disponibilidad</Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-gold-400 transition-colors">Portal del Huésped</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contacto y Ubicación
            </h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>Avenida Principal #45-12, Sector Norte, Colombia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span>+57 (601) 456-7890 / +57 310 456 7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span>reservas@portaldelnorte.com</span>
              </li>
            </ul>
          </div>

          {/* Policies & Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Políticas y Garantías
            </h3>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <p className="font-semibold text-gold-300 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" />
                Cancelación Flexible
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Cancelaciones gratuitas hasta 48 horas antes del check-in oficial. Precios transparentes en COP con IVA incluido.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Hotel Portal del Norte S.A.S. Todos los derechos reservados. NIT: 900.123.456-7</p>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  Building2, 
  Calendar, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X, 
  BedDouble,
  ReceiptText,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdminOrStaff = hasRole('ROLE_ADMIN') || hasRole('ROLE_EMPLEADO');

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Hotel Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <span className="block font-serif text-xl font-bold tracking-tight text-slate-900 group-hover:text-gold-600 transition-colors">
                Portal del Norte
              </span>
              <span className="block text-xs font-semibold tracking-widest text-gold-600 uppercase">
                Hotel Boutique • Colombia
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-sm font-medium text-slate-700 hover:text-gold-600 transition-colors"
            >
              Inicio
            </Link>
            <Link 
              to="/rooms" 
              className="text-sm font-medium text-slate-700 hover:text-gold-600 transition-colors flex items-center gap-1.5"
            >
              <BedDouble className="w-4 h-4" />
              Habitaciones
            </Link>
            <Link 
              to="/rooms?search=true" 
              className="text-sm font-medium text-slate-700 hover:text-gold-600 transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              Disponibilidad
            </Link>

            {/* Currency Tag */}
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gold-50 text-gold-800 border border-gold-200">
              🇨🇴 COP
            </div>
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100/80 transition-colors border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-hotel-900 text-white flex items-center justify-center font-bold text-sm">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                      {user.guestProfile?.firstName || user.email.split('@')[0]}
                    </p>
                    <span className="inline-block text-[10px] font-semibold text-gold-600 uppercase tracking-wider">
                      {user.roles[0]?.replace('ROLE_', '')}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">Conectado como</p>
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.email}</p>
                    </div>

                    {isAdminOrStaff && (
                      <div className="py-1 border-b border-slate-100">
                        <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Administración
                        </p>
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 gap-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                          Recepción & Estados
                        </Link>
                        <Link
                          to="/admin/rooms"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 gap-2"
                        >
                          <BedDouble className="w-3.5 h-3.5 text-gold-600" />
                          Habitaciones
                        </Link>
                        <Link
                          to="/admin/bookings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 gap-2"
                        >
                          <Calendar className="w-3.5 h-3.5 text-gold-600" />
                          Registro de Reservas
                        </Link>
                        <Link
                          to="/admin/services"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                          Servicios del Hotel
                        </Link>
                        {user.roles.includes('ROLE_ADMIN') && (
                          <>
                            <Link
                              to="/admin/reports"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 gap-2"
                            >
                              <ReceiptText className="w-3.5 h-3.5 text-gold-600" />
                              Reportes & Finanzas
                            </Link>
                            <Link
                              to="/admin/users"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 gap-2"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                              Gestión Personal
                            </Link>
                          </>
                        )}
                      </div>
                    )}

                    <div className="py-1">
                      <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Área de Huésped
                      </p>
                      <Link
                        to="/my-bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50 gap-2"
                      >
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Mis Reservas
                      </Link>

                      <Link
                        to="/my-invoices"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50 gap-2"
                      >
                        <ReceiptText className="w-3.5 h-3.5 text-slate-400" />
                        Mis Facturas
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 gap-2.5 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-950 gold-gradient hover:opacity-95 shadow-md shadow-gold-500/20 transition-all transform hover:-translate-y-0.5"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg px-4 pt-4 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-800 rounded-lg hover:bg-slate-50"
          >
            Inicio
          </Link>
          <Link
            to="/rooms"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-800 rounded-lg hover:bg-slate-50"
          >
            Habitaciones
          </Link>

          {isAuthenticated ? (
            <>
              {isAdminOrStaff && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-semibold text-amber-700 rounded-lg bg-amber-50"
                >
                  Panel Administrativo
                </Link>
              )}
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-800 rounded-lg hover:bg-slate-50"
              >
                Mis Reservas
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-base font-medium text-rose-600 rounded-lg hover:bg-rose-50"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-medium text-slate-800 bg-slate-100 rounded-xl"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-slate-950 gold-gradient rounded-xl shadow"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

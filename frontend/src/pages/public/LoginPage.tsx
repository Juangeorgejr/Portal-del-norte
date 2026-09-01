import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import type { AuthResponse } from '../../types';
import { Building2, Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      setAuth(res.data.user, res.data.accessToken);

      // Redireccionar según el rol
      if (res.data.user.roles.includes('ROLE_ADMIN') || res.data.user.roles.includes('ROLE_EMPLEADO')) {
        navigate('/admin');
      } else {
        navigate('/my-bookings');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas. Por favor verifique sus datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/5">
        
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center mx-auto shadow-md shadow-gold-500/20">
            <Building2 className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-slate-500">
            Acceda a su cuenta en el Hotel Portal del Norte
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="su.correo@ejemplo.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-slate-950 font-bold text-xs gold-gradient hover:opacity-95 shadow-lg shadow-gold-500/25 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Entrar al Sistema'}
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            Accesos Rápidos de Prueba (1 Click)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@portaldelnorte.com', 'Admin123*')}
              className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition-colors"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('recepcion@portaldelnorte.com', 'Recepcion123*')}
              className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-900 hover:bg-blue-100 transition-colors"
            >
              🛎️ Empleado
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('carlos.gomez@gmail.com', 'Cliente123*')}
              className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900 hover:bg-emerald-100 transition-colors"
            >
              👤 Cliente
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2">
          ¿Aún no tiene una cuenta?{' '}
          <Link to="/register" className="font-bold text-gold-700 hover:underline">
            Regístrese aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

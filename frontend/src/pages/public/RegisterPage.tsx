import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import type { AuthResponse } from '../../types';
import { Building2, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    documentType: 'CC',
    documentNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post<AuthResponse>('/auth/register', formData);
      setAuth(res.data.user, res.data.accessToken);
      navigate('/my-bookings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar la cuenta. Verifique los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/5">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center mx-auto shadow-md shadow-gold-500/20">
            <Building2 className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Crear Cuenta de Huésped
          </h2>
          <p className="text-xs text-slate-500">
            Regístrese para gestionar sus reservas y facturas en línea
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Nombre *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Carlos"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Apellido *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Gómez"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Correo Electrónico *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="carlos.gomez@gmail.com"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Contraseña (Mínimo 6 caracteres) *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
              minLength={6}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Tipo de Documento</label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
              >
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="NIT">NIT Empresa</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Número de Documento *</label>
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                placeholder="1098765432"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Teléfono / WhatsApp *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+57 310 456 7890"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-slate-950 font-bold text-xs gold-gradient hover:opacity-95 shadow-lg shadow-gold-500/25 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Completar Registro'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          ¿Ya tiene una cuenta registrada?{' '}
          <Link to="/login" className="font-bold text-gold-700 hover:underline">
            Inicie sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

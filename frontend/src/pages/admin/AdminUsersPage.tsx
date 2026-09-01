import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatDateShort } from '../../utils/formatters';
import { UserCheck, UserX, UserPlus, X, Shield, Phone, Mail } from 'lucide-react';

interface UserDetail {
  id: number;
  email: string;
  active: boolean;
  roles: string[];
  profile?: {
    firstName: string;
    lastName: string;
    phone: string;
    documentType: string;
    documentNumber: string;
  };
  createdAt: string;
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    documentType: 'CC',
    documentNumber: '',
    role: 'ROLE_EMPLEADO',
  });

  const fetchUsers = () => {
    api.get<UserDetail[]>('/admin/users')
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users/employees', formData);
      setShowModal(false);
      fetchUsers();
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        documentType: 'CC',
        documentNumber: '',
        role: 'ROLE_EMPLEADO',
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear el empleado');
    }
  };

  const handleToggleStatus = async (userId: number, currentActive: boolean) => {
    const actionText = currentActive ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Está seguro de ${actionText} la cuenta de este usuario?`)) return;

    try {
      await api.patch(`/admin/users/${userId}/status?active=${!currentActive}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-gold-600 uppercase">
            Administración & Seguridad
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 mt-1">
            Gestión de Empleados y Usuarios
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 gold-gradient shadow-md shadow-gold-500/20"
        >
          <UserPlus className="w-4 h-4" />
          Registrar Empleado
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Usuario / Nombre</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Roles Asignados</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha Registro</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">
                      {u.profile?.firstName ? `${u.profile.firstName} ${u.profile.lastName}` : 'Sin Perfil'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                  </td>

                  <td className="px-6 py-4 text-slate-600 font-mono">
                    {u.profile?.documentType} {u.profile?.documentNumber || '—'}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.profile?.phone || '—'}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => {
                        let color = 'bg-slate-100 text-slate-700 border-slate-200';
                        if (r.includes('ADMIN')) color = 'bg-amber-100 text-amber-800 border-amber-200';
                        if (r.includes('EMPLEADO')) color = 'bg-blue-100 text-blue-800 border-blue-200';
                        return (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${color}`}
                          >
                            {r.replace('ROLE_', '')}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {u.active ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        Inactivo
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {formatDateShort(u.createdAt)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id, u.active)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 ${
                        u.active
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {u.active ? (
                        <>
                          <UserX className="w-3.5 h-3.5" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          Activar
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create Employee */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gold-600" />
                Registrar Nuevo Personal
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Nombre *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Andrés"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-gold-500 font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Apellido *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Mendoza"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-gold-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Correo Electrónico (Acceso) *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="andres.mendoza@portaldelnorte.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-gold-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Contraseña Temporal *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-gold-500 font-semibold"
                  minLength={6}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Tipo de Documento</label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-gold-500 font-semibold"
                  >
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Número de Documento *</label>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    placeholder="1098765432"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-gold-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Teléfono / Celular *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+57 311 000 0000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-gold-500 font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Rol del Sistema</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-gold-500 font-semibold bg-gold-50"
                  >
                    <option value="ROLE_EMPLEADO">🛎️ Empleado / Recepción</option>
                    <option value="ROLE_ADMIN">👑 Administrador Total</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl gold-gradient font-bold text-slate-950 shadow-md"
                >
                  Crear Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

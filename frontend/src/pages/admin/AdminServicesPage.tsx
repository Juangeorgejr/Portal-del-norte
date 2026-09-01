import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { HotelServiceItem } from '../../types';
import { formatCOP } from '../../utils/formatters';
import { Plus, X, Edit, Sparkles, Coffee, Car, Dumbbell, Compass, Package, Check, Ban } from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<HotelServiceItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<HotelServiceItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 25000,
    category: 'FOOD',
    active: true,
  });

  const fetchServices = () => {
    api.get<HotelServiceItem[]>('/services/admin/all')
      .then((res) => setServices(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: 25000,
      category: 'FOOD',
      active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (svc: HotelServiceItem) => {
    setEditingService(svc);
    setFormData({
      name: svc.name,
      description: svc.description || '',
      price: svc.price,
      category: svc.category || 'FOOD',
      active: svc.active,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/services/${editingService.id}`, formData);
      } else {
        await api.post('/services', formData);
      }
      setShowModal(false);
      fetchServices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar el servicio');
    }
  };

  const handleToggleStatus = async (id: number, currentActive: boolean) => {
    try {
      await api.patch(`/services/${id}/status?active=${!currentActive}`);
      fetchServices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FOOD':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'TRANSPORTATION':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'WELLNESS':
        return <Dumbbell className="w-4 h-4 text-emerald-600" />;
      case 'EXPERIENCE':
        return <Compass className="w-4 h-4 text-purple-600" />;
      default:
        return <Package className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-gold-600 uppercase">
            Catálogo de Experiencias
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 mt-1">
            Servicios Adicionales del Hotel
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 gold-gradient shadow-md shadow-gold-500/20"
        >
          <Plus className="w-4 h-4" />
          Nuevo Servicio
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Servicio</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Tarifa Unitaria (COP)</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">{svc.name}</p>
                    <p className="text-[11px] text-slate-400 max-w-sm">{svc.description}</p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700">
                      {getCategoryIcon(svc.category)}
                      <span>{svc.category}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-serif font-bold text-slate-900 text-sm">
                    {formatCOP(svc.price)}
                  </td>

                  <td className="px-6 py-4">
                    {svc.active ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Disponible
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Pausado
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(svc)}
                      className="px-3 py-1.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(svc.id, svc.active)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-colors ${
                        svc.active
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {svc.active ? <Ban className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                      {svc.active ? 'Pausar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-600" />
                {editingService ? `Editar ${editingService.name}` : 'Crear Nuevo Servicio'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600">Nombre del Servicio *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Tour Histórico Guiado"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-gold-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-gold-500 font-semibold"
                  >
                    <option value="FOOD">Gastronomía / Restaurante</option>
                    <option value="TRANSPORTATION">Transporte / Transfer</option>
                    <option value="WELLNESS">Bienestar & Spa</option>
                    <option value="EXPERIENCE">Tours & Experiencias</option>
                    <option value="OTHER">Otros Servicios</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Precio Unitario (COP) *</label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-gold-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Descripción detallada</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles sobre lo que incluye el servicio..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-gold-500"
                />
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
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

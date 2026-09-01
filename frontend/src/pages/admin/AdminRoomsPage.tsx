import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Room, RoomType, Amenity } from '../../types';
import { formatCOP, getRoomStatusBadge } from '../../utils/formatters';
import { Plus, X, Edit } from 'lucide-react';

export const AdminRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [_amenities, setAmenities] = useState<Amenity[]>([]);
  const [_loading, setLoading] = useState(true);
  
  // Modal state for Create / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [formData, setFormData] = useState({
    roomNumber: '',
    roomTypeId: 1,
    description: '',
    capacity: 2,
    bedCount: 1,
    pricePerNight: 190000,
    operationalStatus: 'DISPONIBLE',
    floor: '1',
    imageUrl: '',
    amenityIds: [] as number[],
  });

  const fetchRooms = () => {
    setLoading(true);
    Promise.all([
      api.get<Room[]>('/rooms/admin/all'),
      api.get<RoomType[]>('/rooms/types'),
      api.get<Amenity[]>('/rooms/amenities'),
    ])
      .then(([roomsRes, typesRes, amenitiesRes]) => {
        setRooms(roomsRes.data);
        setRoomTypes(typesRes.data);
        setAmenities(amenitiesRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      roomTypeId: roomTypes[0]?.id || 1,
      description: '',
      capacity: 2,
      bedCount: 1,
      pricePerNight: 190000,
      operationalStatus: 'DISPONIBLE',
      floor: '1',
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      amenityIds: [1, 2, 3],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      roomTypeId: room.roomType.id,
      description: room.description || '',
      capacity: room.capacity,
      bedCount: room.bedCount,
      pricePerNight: Number(room.pricePerNight),
      operationalStatus: room.operationalStatus,
      floor: room.floor || '1',
      imageUrl: room.imageUrl || '',
      amenityIds: room.amenities.map(a => a.id),
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, formData);
      } else {
        await api.post('/rooms', formData);
      }
      setShowModal(false);
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar la habitación');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-gold-600 uppercase">
            Administración
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 mt-1">
            Inventario de Habitaciones
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 gold-gradient shadow-md shadow-gold-500/20"
        >
          <Plus className="w-4 h-4" />
          Nueva Habitación
        </button>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Habitación</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Capacidad / Camas</th>
                <th className="px-6 py-4">Tarifa / Noche</th>
                <th className="px-6 py-4">Estado Operativo</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map((room) => {
                const badge = getRoomStatusBadge(room.operationalStatus);
                return (
                  <tr key={room.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={room.imageUrl}
                          alt={room.roomNumber}
                          className="w-12 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Hab. {room.roomNumber}</p>
                          <p className="text-[11px] text-slate-400">Piso {room.floor}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {room.roomType.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {room.capacity} personas • {room.bedCount} camas
                    </td>
                    <td className="px-6 py-4 font-serif font-bold text-slate-900">
                      {formatCOP(room.pricePerNight)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(room)}
                        className="px-3 py-1.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                {editingRoom ? `Editar Habitación ${editingRoom.roomNumber}` : 'Crear Nueva Habitación'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Número de Habitación *</label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="Ej. 104"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-gold-500 font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Tipo de Habitación *</label>
                  <select
                    value={formData.roomTypeId}
                    onChange={(e) => setFormData({ ...formData, roomTypeId: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-gold-500 font-semibold"
                  >
                    {roomTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Capacidad Máx.</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Camas</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.bedCount}
                    onChange={(e) => setFormData({ ...formData, bedCount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Piso</label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Tarifa por Noche (COP) *</label>
                <input
                  type="number"
                  step="1000"
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">URL de Imagen</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

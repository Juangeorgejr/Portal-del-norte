import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatCOP } from '../../utils/formatters';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  PieChart, 
  Activity,
  ArrowUpRight
} from 'lucide-react';

interface AnalyticsData {
  totalRevenueCOP: number;
  monthlyRevenueCOP: number;
  totalBookings: number;
  activeGuestsCount: number;
  occupancyRatePercent: number;
  revenueHistory: {
    month: string;
    revenue: number;
    bookingsCount: number;
  }[];
  roomTypeDistribution: {
    roomTypeName: string;
    totalBookings: number;
    revenue: number;
  }[];
  recentActivity: {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    amount: string;
  }[];
}

export const AdminReportsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AnalyticsData>('/admin/dashboard/analytics')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 font-semibold animate-pulse">
        Cargando reportes y estadísticas financieras...
      </div>
    );
  }

  // Encontrar el valor máximo de ingresos para escalar las barras
  const maxMonthlyRevenue = Math.max(...data.revenueHistory.map((h) => Number(h.revenue)), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold tracking-widest text-gold-600 uppercase">
          Inteligencia de Negocio & Finanzas
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 mt-1">
          Reportes & Estadísticas Financieras
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Métricas consolidadas de facturación, ocupación hotelera y rendimiento de habitaciones.
        </p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Ingresos Históricos</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-gold-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {formatCOP(data.totalRevenueCOP)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Pagos confirmados
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Ingresos del Mes</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {formatCOP(data.monthlyRevenueCOP)}
          </p>
          <p className="text-[11px] text-slate-400">Facturación mes en curso</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Tasa de Ocupación</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-blue-600">
            {data.occupancyRatePercent}%
          </p>
          <p className="text-[11px] text-slate-400">{data.activeGuestsCount} habitaciones ocupadas hoy</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Reservas</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {data.totalBookings}
          </p>
          <p className="text-[11px] text-slate-400">Registradas en el sistema</p>
        </div>
      </div>

      {/* Monthly Revenue Chart & Room Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Monthly Revenue Histogram */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Evolución de Ingresos (Últimos 6 Meses)
              </h3>
              <p className="text-xs text-slate-400">Total en Pesos Colombianos (COP)</p>
            </div>
            <TrendingUp className="w-5 h-5 text-gold-600" />
          </div>

          <div className="space-y-4 pt-4">
            {data.revenueHistory.map((item, idx) => {
              const percentage = Math.max((Number(item.revenue) / maxMonthlyRevenue) * 100, 4);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="capitalize">{item.month}</span>
                    <span className="font-serif text-slate-900">{formatCOP(item.revenue)} ({item.bookingsCount} reservas)</span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full gold-gradient rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room Type Performance */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Rendimiento por Habitación
            </h3>
            <p className="text-xs text-slate-400">Distribución de ingresos generados</p>
          </div>

          <div className="space-y-3">
            {data.roomTypeDistribution.map((type, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{type.roomTypeName}</p>
                  <p className="text-[11px] text-slate-400">{type.totalBookings} reservas</p>
                </div>
                <p className="font-serif font-bold text-slate-900">
                  {formatCOP(type.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Stream */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-gold-600" />
          <h3 className="font-serif text-lg font-bold text-slate-900">
            Registro de Auditoría y Transacciones Recientes
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {data.recentActivity.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between text-xs gap-4">
              <div>
                <p className="font-bold text-slate-900">{act.description}</p>
                <p className="text-[11px] text-slate-400 font-mono">Código: {act.id}</p>
              </div>
              <div className="text-right">
                <span className="font-serif font-bold text-slate-900 block">
                  {formatCOP(Number(act.amount))}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {act.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

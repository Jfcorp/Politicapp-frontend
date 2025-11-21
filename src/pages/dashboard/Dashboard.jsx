import { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Users, Target, MapPin, Award } from 'lucide-react';

// Componente para Tarjetas de KPI (Key Performance Indicators)
const KpiCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Error cargando dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Cargando inteligencia de campaña...</div>;
  }

  // Preparar datos para gráficos
  const dataPie = [
    { name: 'Voto Duro', value: parseInt(stats?.segmentacion?.duro || 0), color: '#22c55e' }, // Verde (Semáforo)
    { name: 'Voto Blando', value: parseInt(stats?.segmentacion?.blando || 0), color: '#eab308' }, // Amarillo
    { name: 'Posible', value: parseInt(stats?.segmentacion?.posible || 0), color: '#94a3b8' }, // Gris
  ];

  // Filtrar valores cero para que el gráfico no se vea vacío
  const activeDataPie = dataPie.filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">War Room Digital</h2>
        <p className="text-slate-500">Resumen estratégico y avance de metas.</p>
      </div>

      {/* Sección de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Electores"
          value={stats?.resumen?.electores_registrados}
          icon={Users}
          color="bg-blue-500"
        />
        <KpiCard
          title="Meta de Campaña"
          value={stats?.resumen?.meta_campana}
          subtext="Votos objetivo totales"
          icon={Target}
          color="bg-indigo-500"
        />
        <KpiCard
          title="Avance General"
          value={stats?.resumen?.avance_global}
          subtext="Progreso vs Meta"
          icon={Award}
          color="bg-emerald-500"
        />
        <KpiCard
          title="Red de Líderes"
          value={stats?.resumen?.total_lideres}
          subtext={`En ${stats?.resumen?.zonas_activas} zonas activas`}
          icon={MapPin}
          color="bg-orange-500"
        />
      </div>

      {/* Sección de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Segmentación (El Semáforo) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Segmentación del Voto</h3>
          <div style={{ width: '100%', height: 300 }}>
            {activeDataPie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeDataPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {activeDataPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No hay datos suficientes para graficar
              </div>
            )}
          </div>
        </div>

        {/* Panel de Acciones Rápidas o Notas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Estado de la Campaña</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800">Objetivo Inmediato</h4>
              <p className="text-sm text-blue-600 mt-1">
                Incrementar el registro de voto duro en las zonas con mayor abstención.
              </p>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Días para elecciones</span>
              <span className="font-bold text-slate-800">154</span>
            </div>
            {/* Aquí se podrían agregar alertas o notificaciones del backend */}
          </div>
        </div>
      </div>
    </div>
  );
}
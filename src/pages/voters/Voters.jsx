import { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  Search, UserPlus, Filter, MapPin, User, Phone
} from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Voters() {
  // Estados de Datos
  const [voters, setVoters] = useState([]);
  const [zones, setZones] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de UI
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', tipo_voto: '', zoneId: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Estado del Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    direccion: '',
    tipo_voto: 'posible',
    zoneId: '',
    leaderId: '',
    notas_iniciales: ''
  });

  // 1. Cargar Datos Auxiliares (Zonas y Líderes para los Selects)
  const fetchAuxData = async () => {
    try {
      const [zonesRes, leadersRes] = await Promise.all([
        api.get('/zones'),
        api.get('/leaders')
      ]);
      setZones(zonesRes.data);
      setLeaders(leadersRes.data);
    } catch (error) {
      console.error("Error cargando datos auxiliares:", error);
    }
  };

  // 2. Cargar Electores (con filtros)
  const fetchVoters = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 10, // Paginación de 10 en 10
        search: filters.search,
        tipo_voto: filters.tipo_voto !== 'todos' ? filters.tipo_voto : undefined,
        zoneId: filters.zoneId !== 'todas' ? filters.zoneId : undefined
      };

      const { data } = await api.get('/voters', { params });
      setVoters(data.electores);
      setPagination(prev => ({ ...prev, totalPages: data.pages }));
    } catch (error) {
      console.error("Error cargando electores:", error);
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    fetchAuxData();
  }, []);

  useEffect(() => {
    // Debounce simple para búsqueda
    const timer = setTimeout(() => {
      fetchVoters();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, pagination.page]);

  // Manejadores
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/voters', formData);
      setIsDialogOpen(false);
      setFormData({ // Reset
        nombre: '', cedula: '', telefono: '', direccion: '',
        tipo_voto: 'posible', zoneId: '', leaderId: '', notas_iniciales: ''
      });
      fetchVoters(); // Recargar lista
    } catch (error) {
      console.error("Error creando elector:", error);
      alert(error.response?.data?.message || "Error al registrar elector");
    }
  };

  // Helper para colores de Badge según tipo de voto
  const getVoteBadge = (type) => {
    const styles = {
      duro: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
      blando: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200",
      posible: "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200"
    };
    return <Badge className={styles[type] || styles.posible}>{type?.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Base de Datos de Electores</h2>
          <p className="text-slate-500">Gestión de contactos y fidelización.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="mr-2 h-4 w-4" /> Nuevo Elector
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Elector</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Datos Personales */}
              <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <Input
                  required
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label>Cédula / ID</Label>
                <Input
                  required
                  value={formData.cedula}
                  onChange={e => setFormData({...formData, cedula: e.target.value})}
                  placeholder="12345678"
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={formData.telefono}
                  onChange={e => setFormData({...formData, telefono: e.target.value})}
                  placeholder="300 123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input
                  value={formData.direccion}
                  onChange={e => setFormData({...formData, direccion: e.target.value})}
                  placeholder="Calle 1 # 2-3"
                />
              </div>

              {/* Clasificación y Estructura */}
              <div className="space-y-2">
                <Label>Zona Electoral</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950"
                  value={formData.zoneId}
                  onChange={e => setFormData({...formData, zoneId: e.target.value})}
                  required
                >
                  <option value="">Seleccionar Zona...</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Líder Responsable</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950"
                  value={formData.leaderId}
                  onChange={e => setFormData({...formData, leaderId: e.target.value})}
                >
                  <option value="">Sin líder asignado</option>
                  {leaders.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Intención de Voto</Label>
                <div className="flex gap-4 mt-2">
                  {['duro', 'blando', 'posible'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="voteType"
                        checked={formData.tipo_voto === type}
                        onChange={() => setFormData({...formData, tipo_voto: type})}
                        className="accent-blue-600"
                      />
                      <span className="capitalize text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Notas Iniciales (Contexto)</Label>
                <Textarea
                  placeholder="Ej: Necesita transporte el día D. Fue contactado en visita puerta a puerta."
                  value={formData.notas_iniciales}
                  onChange={e => setFormData({...formData, notas_iniciales: e.target.value})}
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <Button type="submit" className="w-full bg-blue-600">Registrar Elector</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o cédula..."
            className="pl-10"
            value={filters.search}
            onChange={e => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm min-w-[150px]"
            value={filters.zoneId}
            onChange={e => setFilters({...filters, zoneId: e.target.value})}
          >
            <option value="todas">Todas las Zonas</option>
            {zones.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
          </select>
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm min-w-[150px]"
            value={filters.tipo_voto}
            onChange={e => setFilters({...filters, tipo_voto: e.target.value})}
          >
            <option value="todos">Todos los Votos</option>
            <option value="duro">Voto Duro</option>
            <option value="blando">Voto Blando</option>
            <option value="posible">Posible</option>
          </select>
        </div>
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Elector</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Estructura</TableHead>
              <TableHead className="text-right">Clasificación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">Cargando datos...</TableCell>
              </TableRow>
            ) : voters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                  No se encontraron electores con estos filtros.
                </TableCell>
              </TableRow>
            ) : (
              voters.map((voter) => (
                <TableRow key={voter.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="font-medium text-slate-900">{voter.nombre}</div>
                    <div className="text-xs text-slate-500">CC: {voter.cedula}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                      {voter.Zone?.nombre || 'Sin Zona'}
                    </div>
                    <div className="text-xs text-slate-400 pl-4">{voter.direccion}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="h-3 w-3 mr-1 text-slate-400" />
                      {voter.telefono || '--'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {voter.lider?.nombre ? (
                      <div className="flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full w-fit">
                        <User className="h-3 w-3 mr-1" />
                        {voter.lider.nombre}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin líder</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {getVoteBadge(voter.tipo_voto)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Paginación Simple */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-sm text-slate-500">
            Página {pagination.page} de {pagination.totalPages || 1}
          </span>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
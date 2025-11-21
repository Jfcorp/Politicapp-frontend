import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BARRIOS_POR_COMUNA } from '../../lib/valledupar-data';
import { AddressBuilder } from '../../components/AddressBuilder';
import {
  Search, UserPlus, Filter, MapPin, User, Phone, Briefcase, Calendar, Users
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
  const [voters, setVoters] = useState([]);
  const [zones, setZones] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filtros y Paginación
  const [filters, setFilters] = useState({ search: '', tipo_voto: 'todos', zoneId: 'todas' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Lista plana de barrios (para el buscador del formulario)
  const [allBarrios, setAllBarrios] = useState([]);

  // Estado Formulario Completo
  const [formData, setFormData] = useState({
    nombre: '', cedula: '', telefono: '', email: '',
    direccion: '', barrio: '', comuna_display: '', zoneId: '', // Ubicación
    fecha_nacimiento: '', oficio: '', profesion: '', // Perfil
    leaderId: '', tipo_voto: 'posible', notas_iniciales: '' // Campaña
  });

  // 1. Cargar Datos
  const fetchAuxData = async () => {
    try {
      const [zonesRes, leadersRes] = await Promise.all([
        api.get('/zones'),
        api.get('/leaders')
      ]);
      setZones(zonesRes.data);
      setLeaders(leadersRes.data);

      // Preparar barrios
      const lista = [];
      Object.entries(BARRIOS_POR_COMUNA).forEach(([com, barrs]) => {
        barrs.forEach(b => lista.push({ nombre: b, comuna: com }));
      });
      setAllBarrios(lista.sort((a, b) => a.nombre.localeCompare(b.nombre)));

    } catch (error) {
      console.error("Error loading aux data:", error);
    }
  };

  const fetchVoters = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 10,
        search: filters.search,
        tipo_voto: filters.tipo_voto !== 'todos' ? filters.tipo_voto : undefined,
        zoneId: filters.zoneId !== 'todas' ? filters.zoneId : undefined
      };
      const { data } = await api.get('/voters', { params });
      setVoters(data.electores);
      setPagination(prev => ({ ...prev, totalPages: data.pages }));
    } catch (error) {
      console.error("Error loading voters:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAuxData(); }, []);
  useEffect(() => {
    const timer = setTimeout(() => fetchVoters(), 300);
    return () => clearTimeout(timer);
  }, [filters, pagination.page]);

  // 2. Manejadores de Formulario (Idénticos a Leaders.jsx)
  const handleBarrioChange = (barrioSeleccionado) => {
    const info = allBarrios.find(b => b.nombre === barrioSeleccionado);
    const comuna = info ? info.comuna : '';
    const zonaMatch = zones.find(z => z.nombre === barrioSeleccionado && z.numero_comuna === comuna);

    setFormData(prev => ({
      ...prev,
      barrio: barrioSeleccionado,
      comuna_display: comuna,
      zoneId: zonaMatch ? zonaMatch.id : '' // Vincula ID si existe la zona
    }));
  };

  const handleInputChange = (field, value) => {
    let val = value;
    if (field === 'telefono' || field === 'cedula') val = value.replace(/[^0-9]/g, '');
    if (field === 'nombre') val = value.toUpperCase();
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.zoneId) {
      // Aquí podrías implementar la lógica de crear zona al vuelo si quisieras,
      // pero por ahora mantenemos el aviso para orden.
      if(!window.confirm(`El barrio "${formData.barrio}" no está habilitado como Zona. ¿Desea continuar sin zona geográfica estricta?`)) return;
    }

    try {
      await api.post('/voters', { ...formData, zonaId: formData.zoneId || null });

      setFormData({
        nombre: '', cedula: '', telefono: '', email: '', direccion: '', barrio: '', comuna_display: '', zoneId: '',
        fecha_nacimiento: '', oficio: '', profesion: '',
        leaderId: '', tipo_voto: 'posible', notas_iniciales: ''
      });
      setIsDialogOpen(false);
      fetchVoters();
    } catch (error) {
      alert(error.response?.data?.message || "Error al registrar");
    }
  };

  const getVoteBadge = (type) => {
    const styles = {
      duro: "bg-green-100 text-green-800 border-green-200",
      blando: "bg-yellow-100 text-yellow-800 border-yellow-200",
      posible: "bg-slate-100 text-slate-800 border-slate-200"
    };
    return <Badge className={styles[type] || styles.posible}>{type?.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Electores</h2>
          <p className="text-slate-500 dark:text-slate-400">Base de datos general.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white"><UserPlus className="mr-2 h-4 w-4"/> Nuevo Elector</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Ficha de Elector</DialogTitle></DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* IDENTIFICACIÓN */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Datos Personales</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Cédula</Label><Input required value={formData.cedula} onChange={e => handleInputChange('cedula', e.target.value)} /></div>
                  <div><Label>Nombre Completo</Label><Input required value={formData.nombre} onChange={e => handleInputChange('nombre', e.target.value)} /></div>
                </div>
              </div>

              {/* UBICACIÓN */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Ubicación</h4>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <Label>Barrio</Label>
                    <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:bg-slate-950 dark:border-slate-800"
                      value={formData.barrio} onChange={e => handleBarrioChange(e.target.value)} required>
                      <option value="">Buscar Barrio...</option>
                      {allBarrios.map((b, i) => <option key={i} value={b.nombre}>{b.nombre}</option>)}
                    </select>
                  </div>
                  <div><Label>Comuna</Label><Input disabled value={formData.comuna_display} className="bg-slate-100"/></div>
                </div>
                <AddressBuilder onChange={val => handleInputChange('direccion', val)} />
              </div>

              {/* PERFIL */}
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Celular</Label><Input value={formData.telefono} onChange={e => handleInputChange('telefono', e.target.value)} /></div>
                <div><Label>Profesión/Oficio</Label><Input value={formData.profesion} onChange={e => handleInputChange('profesion', e.target.value)} /></div>
                <div><Label>Cumpleaños</Label><Input type="date" value={formData.fecha_nacimiento} onChange={e => handleInputChange('fecha_nacimiento', e.target.value)} /></div>
              </div>

              {/* ESTRUCTURA Y VOTO */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                <h4 className="text-xs font-bold text-blue-600 uppercase mb-2">Estrategia</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Líder Responsable</Label>
                    <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:bg-slate-950"
                      value={formData.leaderId} onChange={e => setFormData({...formData, leaderId: e.target.value})}>
                      <option value="">-- Sin Asignar --</option>
                      {leaders.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Intención de Voto</Label>
                    <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:bg-slate-950"
                      value={formData.tipo_voto} onChange={e => setFormData({...formData, tipo_voto: e.target.value})}>
                      <option value="posible">Posible</option>
                      <option value="blando">Voto Blando</option>
                      <option value="duro">Voto Duro</option>
                    </select>
                  </div>
                </div>
                <div className="mt-2">
                  <Label>Notas</Label>
                  <Textarea placeholder="Observaciones..." value={formData.notas_iniciales} onChange={e => setFormData({...formData, notas_iniciales: e.target.value})} />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 h-11">Guardar Elector</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="flex gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Buscar elector..." className="pl-10" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
        </div>
        {/* Selectores de filtro aquí (zona, tipo voto) igual que antes */}
      </div>

      {/* TABLA */}
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Elector</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Estructura</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {voters.map((voter) => (
              <TableRow key={voter.id}>
                <TableCell>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{voter.nombre}</div>
                  <div className="text-xs text-slate-500">CC: {voter.cedula}</div>
                  <div className="text-xs text-slate-500 flex items-center mt-1"><Phone className="h-3 w-3 mr-1"/> {voter.telefono}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-bold">{voter.Zone?.numero_comuna ? `Comuna ${voter.Zone.numero_comuna}` : ''}</div>
                  <div className="text-xs text-slate-600">{voter.barrio || voter.Zone?.nombre}</div>
                  <div className="text-xs text-slate-400 truncate max-w-[150px]">{voter.direccion}</div>
                </TableCell>
                <TableCell>
                  {voter.lider ? (
                    <Badge variant="secondary" className="flex w-fit gap-1">
                      <User className="h-3 w-3"/> {voter.lider.nombre}
                    </Badge>
                  ) : <span className="text-xs text-slate-400 italic">Sin líder</span>}
                </TableCell>
                <TableCell className="text-right">
                  {getVoteBadge(voter.tipo_voto)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
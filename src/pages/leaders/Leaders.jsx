import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BARRIOS_POR_COMUNA, COMUNAS } from '../../lib/valledupar-data';
import { AddressBuilder } from '../../components/AddressBuilder';
import {
  Plus, MapPin, TrendingUp, Phone, Briefcase, User, Calendar,
  Search, Filter, Pencil, Trash2, Mail
} from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export default function Leaders() {
  const [leaders, setLeaders] = useState([]);
  const [filteredLeaders, setFilteredLeaders] = useState([]); // Lista filtrada
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filterComuna, setFilterComuna] = useState('Todas');

  // Lista plana de barrios
  const [allBarrios, setAllBarrios] = useState([]);

  // Estado Formulario (Modo Edición)
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    cedula: '', nombre: '', telefono: '', email: '', direccion: '',
    zoneId: '', barrio: '', comuna_display: '', fecha_nacimiento: '',
    oficio: '', profesion: '', meta_votos: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // 1. Cargar Datos
  const fetchData = async () => {
    try {
      const [leadersRes, zonesRes] = await Promise.all([
        api.get('/leaders'),
        api.get('/zones')
      ]);
      setLeaders(leadersRes.data);
      setFilteredLeaders(leadersRes.data); // Inicialmente todos
      setZones(zonesRes.data);

      // Preparar lista de barrios
      const listaBarrios = [];
      Object.entries(BARRIOS_POR_COMUNA).forEach(([comuna, barrios]) => {
        barrios.forEach(barrio => listaBarrios.push({ nombre: barrio, comuna }));
      });
      setAllBarrios(listaBarrios.sort((a, b) => a.nombre.localeCompare(b.nombre)));

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Lógica de Filtrado (Buscador + Comuna)
  useEffect(() => {
    let result = leaders;

    // Filtro Texto (Nombre o Cédula)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(l =>
        l.nombre.toLowerCase().includes(lowerTerm) ||
        l.cedula.includes(lowerTerm)
      );
    }

    // Filtro Comuna
    if (filterComuna !== 'Todas') {
      result = result.filter(l => l.numero_comuna === filterComuna);
    }

    setFilteredLeaders(result);
  }, [searchTerm, filterComuna, leaders]);


  // 3. Manejadores del Formulario
  const handleBarrioChange = (barrioSeleccionado) => {
    const infoBarrio = allBarrios.find(b => b.nombre === barrioSeleccionado);
    const comuna = infoBarrio ? infoBarrio.comuna : '';
    const zonaCorrespondiente = zones.find(z => z.nombre === barrioSeleccionado && z.numero_comuna === comuna);

    setFormData(prev => ({
      ...prev,
      barrio: barrioSeleccionado,
      comuna_display: comuna,
      zoneId: zonaCorrespondiente ? zonaCorrespondiente.id : ''
    }));
  };

  const handleInputChange = (field, value) => {
    let cleanValue = value;
    if (field === 'telefono' || field === 'cedula') cleanValue = value.replace(/[^0-9]/g, '');
    if (field === 'nombre') cleanValue = value.toUpperCase();
    setFormData(prev => ({ ...prev, [field]: cleanValue }));
  };

  // 4. CRUD Actions
  const handleEdit = (leader) => {
    setIsEditing(true);
    setEditingId(leader.id);
    setFormData({
      cedula: leader.cedula,
      nombre: leader.nombre,
      telefono: leader.telefono || '',
      email: leader.email || '',
      direccion: leader.direccion || '',
      zoneId: leader.zoneId || '',
      barrio: leader.barrio || '',
      comuna_display: leader.numero_comuna || '', // Visual
      fecha_nacimiento: leader.fecha_nacimiento || '',
      oficio: leader.oficio || '',
      profesion: leader.profesion || '',
      meta_votos: leader.meta_votos
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este líder? Sus electores quedarán huérfanos.")) return;
    try {
      await api.delete(`/leaders/${id}`);
      fetchData();
    } catch (error) {
      alert("Error al eliminar: " + (error.response?.data?.message || "Error desconocido"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación Frontend previa
    if (!formData.zoneId && !formData.barrio) {
      toast.warning("Falta información de ubicación", {
        description: "Debes seleccionar un barrio para continuar."
      });
      return;
    }

    try {
      // Loading state visual (opcional)
      const promise = api.post('/leaders', formData)

      toast.promise(promise, {
        loading: 'Registrando líder...',
        success: (data) => {
          // Resetear formulario solo si fue exitoso
          setFormData({
            cedula: '', nombre: '', telefono: '', email: '', direccion: '',
            zoneId: '', barrio: '', comuna_display: '', fecha_nacimiento: '', oficio: '',
            profesion: '', meta_votos: ''
          });
          setIsDialogOpen(false);
          fetchData();
          return `¡Líder ${data.data.nombre} registrado correctamente!`;
        },
        error: (error) => {
          console.error("Error detallado:", error);

          // Lógica mejorada para leer el error real del Backend
          const serverMessage = error.response?.data?.message;
          const serverError = error.response?.data?.error;
          const validationErrors = error.response?.data?.errors; // Si es un array

          let displayMessage = "Verifica los datos e intenta nuevamente.";

          if (serverMessage) displayMessage = serverMessage;
          else if (serverError) displayMessage = serverError;
          else if (Array.isArray(validationErrors)) displayMessage = validationErrors.join(", ");

          return `Error: ${displayMessage}`;
        }
      })
    } catch (error) {
      console.error("Error catch:", error)
    }
  };

  // Abrir modal limpio para crear
  const openCreateModal = () => {
    setIsEditing(false);
    setFormData(initialFormState);
    setIsDialogOpen(true);
  };

  const getEffectivenessColor = (pct) => {
    const val = parseFloat(pct);
    if (val >= 80) return "text-green-600";
    if (val >= 40) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Red Política</h2>
          <p className="text-slate-500 dark:text-slate-400">Gestión de líderes y metas.</p>
        </div>

        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Líder
        </Button>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar líder por nombre o cédula..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-blue-500"
            value={filterComuna}
            onChange={e => setFilterComuna(e.target.value)}
          >
            <option value="Todas">Todas las Comunas</option>
            {COMUNAS.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Líder / Contacto</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead className="text-center">Meta</TableHead>
              <TableHead className="text-center">Real</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : filteredLeaders.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No se encontraron resultados.</TableCell></TableRow>
            ) : (
              filteredLeaders.map((leader) => (
                <TableRow key={leader.id}>
                  {/* COLUMNA 1: IDENTIFICACIÓN */}
                  <TableCell>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{leader.nombre}</div>
                    <div className="text-xs text-slate-500">CC: {leader.cedula}</div>
                    <div className="flex items-center text-xs text-slate-500 mt-1">
                      <Phone className="h-3 w-3 mr-1" /> {leader.telefono || '--'}
                    </div>
                  </TableCell>

                  {/* COLUMNA 2: UBICACIÓN */}
                  <TableCell>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {leader.numero_comuna ? `Comuna ${leader.numero_comuna}` : 'SC'}
                    </div>
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                      {leader.barrio || leader.zona_nombre}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 mt-1 truncate max-w-[150px]" title={leader.direccion}>
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      {leader.direccion || 'Sin dirección'}
                    </div>
                  </TableCell>

                  {/* COLUMNA 3: PERFIL (Ajustado como pediste) */}
                  <TableCell>
                    <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Briefcase className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                      {leader.profesion || leader.oficio || 'Sin Profesión'}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                      {leader.fecha_nacimiento ? new Date(leader.fecha_nacimiento).toLocaleDateString() : 'Sin fecha'}
                    </div>
                  </TableCell>

                  {/* COLUMNAS MÉTRICAS */}
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900">
                      {leader.meta_votos}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold text-lg text-slate-700 dark:text-slate-200">
                    {leader.votos_reales}
                  </TableCell>

                  {/* COLUMNA ACCIONES (CRUD) */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className={`text-xs font-bold mr-3 ${getEffectivenessColor(leader.efectividad_porcentaje)}`}>
                        {leader.efectividad_porcentaje}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(leader)} className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(leader.id)} className="h-8 w-8 text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* MODAL (Reutilizable Crear/Editar) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Líder' : 'Registrar Nuevo Líder'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* ... (Mismo formulario que tenías antes) ... */}
            {/* Solo asegúrate de copiar el contenido del form del paso anterior aquí */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center"><User className="h-3 w-3 mr-1"/> Identificación</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Cédula</Label><Input required value={formData.cedula} onChange={e => handleInputChange('cedula', e.target.value)} disabled={isEditing} /></div>
                  <div><Label>Nombres</Label><Input required value={formData.nombre} onChange={e => handleInputChange('nombre', e.target.value)} /></div>
                </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center"><MapPin className="h-3 w-3 mr-1"/> Ubicación</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div>
                    <Label>Barrio</Label>
                    <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:bg-slate-950 dark:border-slate-800"
                      value={formData.barrio} onChange={e => handleBarrioChange(e.target.value)} required>
                      <option value="">Buscar Barrio...</option>
                      {allBarrios.map((b, idx) => <option key={`${b.nombre}-${idx}`} value={b.nombre}>{b.nombre}</option>)}
                    </select>
                  </div>
                  <div><Label>Comuna</Label><Input value={formData.comuna_display} disabled className="bg-slate-100"/></div>
                </div>
                <AddressBuilder onChange={(val) => handleInputChange('direccion', val)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div><Label>Celular</Label><Input value={formData.telefono} onChange={e => handleInputChange('telefono', e.target.value)} /></div>
               <div className="md:col-span-2"><Label>Email</Label><Input value={formData.email} onChange={e => handleInputChange('email', e.target.value)} /></div>
               <div><Label>Cumpleaños</Label><Input type="date" value={formData.fecha_nacimiento} onChange={e => handleInputChange('fecha_nacimiento', e.target.value)} /></div>
               <div><Label>Oficio</Label><Input value={formData.oficio} onChange={e => handleInputChange('oficio', e.target.value)} /></div>
               <div><Label>Profesión</Label><Input value={formData.profesion} onChange={e => handleInputChange('profesion', e.target.value)} /></div>
            </div>

            <div><Label className="text-blue-600 font-bold">Meta de Votos</Label><Input type="number" required className="text-lg font-bold" value={formData.meta_votos} onChange={e => handleInputChange('meta_votos', e.target.value)} /></div>

            <Button type="submit" className="w-full bg-blue-600 h-11">{isEditing ? 'Guardar Cambios' : 'Registrar Líder'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
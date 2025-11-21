import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BARRIOS_POR_COMUNA } from '../../lib/valledupar-data';
import { AddressBuilder } from '../../components/AddressBuilder';
import {
  Plus, MapPin, TrendingUp, Phone, Briefcase, User, Calendar, AlertCircle
} from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export default function Leaders() {
  const [leaders, setLeaders] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Lista plana de todos los barrios para el buscador/dropdown
  const [allBarrios, setAllBarrios] = useState([]);

  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    zoneId: '', // Se llenará automáticamente si existe zona para el barrio
    barrio: '',
    comuna_display: '', // Solo visual
    fecha_nacimiento: '',
    oficio: '',
    profesion: '',
    meta_votos: ''
  });

  // Cargar Datos y Preparar Barrios
  const fetchData = async () => {
    try {
      const [leadersRes, zonesRes] = await Promise.all([
        api.get('/leaders'),
        api.get('/zones')
      ]);
      setLeaders(leadersRes.data);
      setZones(zonesRes.data);

      // Aplanar barrios para el dropdown único
      const listaBarrios = [];
      Object.entries(BARRIOS_POR_COMUNA).forEach(([comuna, barrios]) => {
        barrios.forEach(barrio => {
          listaBarrios.push({ nombre: barrio, comuna });
        });
      });
      // Ordenar alfabéticamente
      setAllBarrios(listaBarrios.sort((a, b) => a.nombre.localeCompare(b.nombre)));

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LÓGICA INTELIGENTE DE SELECCIÓN ---
  const handleBarrioChange = (barrioSeleccionado) => {
    // 1. Buscar a qué comuna pertenece
    const infoBarrio = allBarrios.find(b => b.nombre === barrioSeleccionado);
    const comuna = infoBarrio ? infoBarrio.comuna : '';

    // 2. Buscar si existe una Zona creada para este barrio específico
    // (Asumiendo que en Zones.jsx el 'nombre' de la zona es el barrio)
    const zonaCorrespondiente = zones.find(z =>
      z.nombre === barrioSeleccionado && z.numero_comuna === comuna
    );

    setFormData(prev => ({
      ...prev,
      barrio: barrioSeleccionado,
      comuna_display: comuna, // Se muestra automáticamente
      zoneId: zonaCorrespondiente ? zonaCorrespondiente.id : '' // Se vincula si existe
    }));
  };

  const handleInputChange = (field, value) => {
    let cleanValue = value;
    if (field === 'telefono' || field === 'cedula') cleanValue = value.replace(/[^0-9]/g, '');
    if (field === 'nombre') cleanValue = value.toUpperCase();
    setFormData(prev => ({ ...prev, [field]: cleanValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación extra: No permitir guardar si el barrio no tiene zona activa
    if (!formData.zoneId) {
      alert(`El barrio "${formData.barrio}" no ha sido habilitado como Zona en el sistema. Por favor vaya a "Zonas" y créela primero.`);
      return;
    }

    try {
      await api.post('/leaders', formData);

      setFormData({
        cedula: '', nombre: '', telefono: '', email: '', direccion: '',
        zoneId: '', barrio: '', comuna_display: '', fecha_nacimiento: '', oficio: '',
        profesion: '', meta_votos: ''
      });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Verifica los datos"));
    }
  };

  const getEffectivenessColor = (percentageString) => {
    const value = parseFloat(percentageString);
    if (value >= 80) return "text-green-600";
    if (value >= 40) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Red Política</h2>
          <p className="text-slate-500 dark:text-slate-400">Directorio de Líderes y Auditoría de Metas.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Líder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registro de Líder</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">

              {/* SECCIÓN 1: IDENTIFICACIÓN */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                  <User className="h-3 w-3 mr-1"/> Identificación
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Cédula</Label>
                    <Input required placeholder="12345678" value={formData.cedula} onChange={e => handleInputChange('cedula', e.target.value)} />
                  </div>
                  <div>
                    <Label>Nombres y Apellidos</Label>
                    <Input required placeholder="NOMBRE COMPLETO" value={formData.nombre} onChange={e => handleInputChange('nombre', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: UBICACIÓN (LÓGICA INVERTIDA) */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                  <MapPin className="h-3 w-3 mr-1"/> Ubicación Estratégica
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* 1. SELECCIONAR BARRIO PRIMERO */}
                  <div>
                    <Label className="text-blue-600 font-semibold">Barrio (Zona de Influencia)</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:bg-slate-950 dark:border-slate-800"
                      value={formData.barrio}
                      onChange={e => handleBarrioChange(e.target.value)}
                      required
                    >
                      <option value="">Buscar Barrio...</option>
                      {allBarrios.map((b, idx) => (
                        <option key={`${b.nombre}-${idx}`} value={b.nombre}>
                          {b.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. COMUNA AUTOMÁTICA (READ ONLY) */}
                  <div>
                    <Label>Comuna (Automática)</Label>
                    <Input
                      value={formData.comuna_display ? `Comuna ${formData.comuna_display}` : ''}
                      disabled
                      className="bg-slate-100 dark:bg-slate-800 font-medium"
                      placeholder="Se asigna según barrio"
                    />
                  </div>
                </div>

                {/* AVISO SI LA ZONA NO EXISTE */}
                {formData.barrio && !formData.zoneId && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2 text-yellow-800 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <strong>Zona no habilitada:</strong> El barrio "{formData.barrio}" no ha sido creado como Zona en el sistema.
                      No podrás guardar este líder hasta crear la zona correspondiente.
                    </div>
                  </div>
                )}

                <AddressBuilder onChange={(val) => handleInputChange('direccion', val)} />
              </div>

              {/* SECCIÓN 3: PERFIL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Celular</Label>
                  <Input placeholder="300..." maxLength={10} value={formData.telefono} onChange={e => handleInputChange('telefono', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
                </div>
                <div>
                  <Label>Cumpleaños</Label>
                  <Input type="date" value={formData.fecha_nacimiento} onChange={e => handleInputChange('fecha_nacimiento', e.target.value)} />
                </div>
                <div>
                  <Label>Oficio</Label>
                  <Input value={formData.oficio} onChange={e => handleInputChange('oficio', e.target.value)} />
                </div>
                <div>
                  <Label>Profesión</Label>
                  <Input value={formData.profesion} onChange={e => handleInputChange('profesion', e.target.value)} />
                </div>
              </div>

              {/* META */}
              <div>
                <Label className="text-blue-600 font-bold">Meta de Votos</Label>
                <Input type="number" required className="text-lg font-bold" value={formData.meta_votos} onChange={e => handleInputChange('meta_votos', e.target.value)} />
              </div>

              <Button type="submit" className="w-full bg-blue-600 h-11" disabled={!formData.zoneId}>
                {formData.zoneId ? 'Registrar Líder' : 'Zona no válida'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLA (Sin cambios mayores) */}
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Líder</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead className="text-center">Meta</TableHead>
              <TableHead className="text-center">Real</TableHead>
              <TableHead className="text-right">Efectividad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : leaders.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No hay registros.</TableCell></TableRow>
            ) : (
              leaders.map((leader) => (
                <TableRow key={leader.id}>
                  <TableCell>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{leader.nombre}</div>
                    <div className="text-xs text-slate-500">CC: {leader.cedula}</div>
                    <div className="flex items-center text-xs text-slate-500 mt-1">
                      <Phone className="h-3 w-3 mr-1" /> {leader.telefono || '--'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {leader.numero_comuna ? `Comuna ${leader.numero_comuna}` : 'Zona sin definir'}
                    </div>
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                      {leader.zona_nombre || leader.barrio}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 mt-1 truncate max-w-[180px]" title={leader.direccion}>
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      {leader.direccion || 'Sin dirección'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                      <Briefcase className="h-3 w-3 mr-1" /> {leader.profesion || leader.oficio || '--'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{leader.meta_votos}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {leader.votos_reales}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-bold ${getEffectivenessColor(leader.efectividad_porcentaje)}`}>
                      {leader.efectividad_porcentaje}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
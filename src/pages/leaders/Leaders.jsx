import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BARRIOS_POR_COMUNA } from '../../lib/valledupar-data'; // Importamos datos
import { AddressBuilder } from '../../components/AddressBuilder'; // Importamos builder
import {
  Target, Plus, MapPin, TrendingUp, Phone, Briefcase, User, Calendar
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

  // Estado del Formulario Extendido
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    zoneId: '', // Representa la Comuna
    barrio: '',
    fecha_nacimiento: '',
    oficio: '',
    profesion: '',
    meta_votos: ''
  });

  // Cargar Datos
  const fetchData = async () => {
    try {
      const [leadersRes, zonesRes] = await Promise.all([
        api.get('/leaders'),
        api.get('/zones')
      ]);
      setLeaders(leadersRes.data);
      setZones(zonesRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- MANEJO DE INPUTS CON VALIDACIÓN ---
  const handleInputChange = (field, value) => {
    let cleanValue = value;

    // REGLA: Teléfonos y Cédulas sin puntos ni espacios
    if (field === 'telefono' || field === 'cedula') {
      cleanValue = value.replace(/[^0-9]/g, '');
    }
    // REGLA: Nombres en Mayúscula
    if (field === 'nombre') {
      cleanValue = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [field]: cleanValue }));
  };

  // --- MANEJO DE ZONAS Y BARRIOS ---
  const handleZoneChange = (newZoneId) => {
    setFormData(prev => ({
      ...prev,
      zoneId: newZoneId,
      barrio: '' // Resetear barrio al cambiar zona
    }));
  };

  // Helper para obtener barrios según la zona seleccionada
  const getBarriosDisponibles = () => {
    if (!formData.zoneId) return [];

    const selectedZone = zones.find(z => z.id === formData.zoneId);
    if (!selectedZone) return [];

    // Lógica simple: Si el nombre de la zona contiene "1", muestra barrios de comuna 1
    // Ajusta esto según como nombres tus zonas en el backend
    const comunaId = selectedZone.numero_comuna; // Ej: "1", "5"

    return BARRIOS_POR_COMUNA[comunaId] || []; // Si no coincide, no muestra barrios (o podrías mostrar todos)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaders', formData);
      // Resetear form
      setFormData({
        cedula: '', nombre: '', telefono: '', email: '', direccion: '',
        zoneId: '', barrio: '', fecha_nacimiento: '', oficio: '',
        profesion: '', meta_votos: ''
      });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error creando líder:", error);
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
              <DialogTitle>Ficha de Registro - Líder de Opinión</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">

              {/* SECCIÓN 1: IDENTIFICACIÓN */}
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                  <User className="h-3 w-3 mr-1"/> Datos Personales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Cédula (Sin puntos)</Label>
                    <Input
                      required
                      placeholder="Ej: 12345678"
                      value={formData.cedula}
                      onChange={e => handleInputChange('cedula', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Nombres y Apellidos</Label>
                    <Input
                      required
                      placeholder="NOMBRE COMPLETO"
                      value={formData.nombre}
                      onChange={e => handleInputChange('nombre', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: CONTACTO Y PERFIL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Celular</Label>
                  <Input
                    placeholder="300..."
                    maxLength={10}
                    value={formData.telefono}
                    onChange={e => handleInputChange('telefono', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Correo Electrónico</Label>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Cumpleaños</Label>
                  <Input
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={e => handleInputChange('fecha_nacimiento', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Oficio</Label>
                  <Input
                    placeholder="Ej: Comerciante"
                    value={formData.oficio}
                    onChange={e => handleInputChange('oficio', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Profesión</Label>
                  <Input
                    placeholder="Ej: Abogado"
                    value={formData.profesion}
                    onChange={e => handleInputChange('profesion', e.target.value)}
                  />
                </div>
              </div>

              {/* SECCIÓN 3: UBICACIÓN (CASCADA COMUNA -> BARRIO) */}
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                  <MapPin className="h-3 w-3 mr-1"/> Ubicación Geográfica
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-blue-600">Comuna / Zona</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:bg-slate-950 dark:border-slate-800"
                      value={formData.zoneId}
                      onChange={e => handleZoneChange(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar Comuna...</option>
                      {zones.map(z => (
                        // MOSTRAMOS EL NOMBRE DESCRIPTIVO
                        <option key={z.id} value={z.id}>
                          {z.nombre}  ({z.municipio})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-blue-600">Barrio (Asociado a Comuna)</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:bg-slate-950 dark:border-slate-800 disabled:opacity-50"
                      value={formData.barrio}
                      onChange={e => handleInputChange('barrio', e.target.value)}
                      disabled={!formData.zoneId}
                      required
                    >
                      <option value="">Seleccionar Barrio...</option>
                      {getBarriosDisponibles().map(barrio => (
                        <option key={barrio} value={barrio}>{barrio}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Constructor de Dirección */}
                <AddressBuilder onChange={(val) => handleInputChange('direccion', val)} />
              </div>

              {/* SECCIÓN 4: META */}
              <div>
                <Label className="text-lg font-bold text-blue-700">Meta de Votos (Compromiso)</Label>
                <Input
                  type="number"
                  className="text-lg font-bold"
                  required
                  value={formData.meta_votos}
                  onChange={e => handleInputChange('meta_votos', e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 h-12 text-lg">
                Guardar Líder
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLA DE RESULTADOS */}
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
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No hay líderes registrados.</TableCell></TableRow>
            ) : (
              leaders.map((leader) => (
                <TableRow key={leader.id}>
                  <TableCell>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{leader.nombre}</div>
                    <div className="text-xs text-slate-500">CC: {leader.cedula || '--'}</div>
                    <div className="flex items-center text-xs text-slate-500 mt-1">
                      <Phone className="h-3 w-3 mr-1" /> {leader.telefono || '--'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{leader.barrio || 'Sin Barrio'}</div>
                    <div className="flex items-center text-xs text-slate-400">
                      <MapPin className="h-3 w-3 mr-1" />
                      {leader.zona_nombre || 'Sin Zona'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 truncate max-w-[150px]" title={leader.direccion}>
                      {leader.direccion}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                      <Briefcase className="h-3 w-3 mr-1" /> {leader.profesion || '--'}
                    </div>
                    <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
                      <Calendar className="h-3 w-3 mr-1" /> {leader.fecha_nacimiento || '--'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900 text-lg">
                      {leader.meta_votos}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-700 dark:text-slate-200 text-lg">
                    {leader.votos_reales}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`flex items-center justify-end font-bold text-lg ${getEffectivenessColor(leader.efectividad_porcentaje)}`}>
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {leader.efectividad_porcentaje}
                    </div>
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
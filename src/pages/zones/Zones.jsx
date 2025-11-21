import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BARRIOS_POR_COMUNA, COMUNAS } from '../../lib/valledupar-data'; // Importamos datos maestros
import {
  Plus, MapPin, TrendingUp, Users, UserCog
} from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function Zones() {
  const [zones, setZones] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Estado para Asignación de Gerente
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedManager, setSelectedManager] = useState('');

  // Estado del Formulario de Nueva Zona
  const [formData, setFormData] = useState({
    numero_comuna: '',
    barrio: '', // Ahora seleccionamos barrio, no escribimos nombre libre
    municipio: 'Valledupar',
    meta_votos: ''
  });

  // Cargar Datos Iniciales
  const fetchData = async () => {
    try {
      const [zonesRes, usersRes] = await Promise.all([
        api.get('/zones'),
        api.get('/users')
      ]);
      setZones(zonesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Helper para obtener barrios según la comuna seleccionada en el form
  const getBarriosDisponibles = () => {
    if (!formData.numero_comuna) return [];
    return BARRIOS_POR_COMUNA[formData.numero_comuna] || [];
  };

  // Manejar Creación de Zona
  const handleCreate = async (e) => {
    e.preventDefault();

    // Validación: Evitar crear duplicados en el frontend (opcional pero buena UX)
    const existe = zones.find(z =>
      z.numero_comuna === formData.numero_comuna &&
      z.nombre === formData.barrio
    );

    if (existe) {
      alert(`La zona "${formData.barrio}" ya está registrada.`);
      return;
    }

    try {
      // Enviamos al backend los datos estandarizados
      await api.post('/zones', {
        // Usamos el nombre del barrio como nombre de la zona
        nombre: formData.barrio,
        municipio: formData.municipio,
        meta_votos: formData.meta_votos,
        numero_comuna: formData.numero_comuna,
        // Opcional: Si quieres asignar gerente al crear, podrías agregarlo al form
      });

      // Reset y recarga
      setFormData({ numero_comuna: '', barrio: '', municipio: 'Valledupar', meta_votos: '' });
      setIsCreateOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Error al registrar la zona.");
    }
  };

  // Manejar Asignación de Gerente (Actualizar)
  const handleAssignManager = async () => {
    if (!selectedZone || !selectedManager) return;

    try {
      await api.put(`/zones/${selectedZone.id}/assign`, {
        managerId: selectedManager
      });
      setIsAssignOpen(false);
      fetchData(); // Recargar para ver el cambio
    } catch (error) {
      console.error(error);
      alert("Error al asignar gerente");
    }
  };

  // Abrir modal de asignación
  const openAssignModal = (zone) => {
    setSelectedZone(zone);
    setSelectedManager(zone.managerId || '');
    setIsAssignOpen(true);
  };

  if (loading) return <div className="p-8">Cargando territorio...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Zonas Electorales</h2>
          <p className="text-slate-500 dark:text-slate-400">Gestión de barrios priorizados y gerentes.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Agregar Zona/Barrio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Habilitar Nueva Zona</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">

              {/* SELECCIÓN DE COMUNA */}
              <div>
                <Label>Seleccionar Comuna</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:bg-slate-950 dark:border-slate-800"
                  value={formData.numero_comuna}
                  onChange={(e) => setFormData({...formData, numero_comuna: e.target.value, barrio: ''})}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {COMUNAS.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {/* SELECCIÓN DE BARRIO (CASCADA) */}
              <div>
                <Label>Seleccionar Barrio (Zona)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:bg-slate-950 dark:border-slate-800 disabled:opacity-50"
                  value={formData.barrio}
                  onChange={(e) => setFormData({...formData, barrio: e.target.value})}
                  disabled={!formData.numero_comuna}
                  required
                >
                  <option value="">
                    {formData.numero_comuna ? "Seleccionar Barrio..." : "Primero elija Comuna"}
                  </option>
                  {getBarriosDisponibles().map(barrio => (
                    <option key={barrio} value={barrio}>{barrio}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Meta de Votos</Label>
                <Input
                  type="number"
                  placeholder="Ej: 500"
                  value={formData.meta_votos}
                  onChange={e => setFormData({...formData, meta_votos: e.target.value})}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600">
                Habilitar Zona
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLA DE ZONAS */}
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Comuna</TableHead>
              <TableHead>Barrio / Zona</TableHead>
              <TableHead>Gerente</TableHead>
              <TableHead className="text-center">Registrados</TableHead>
              <TableHead className="text-center">Meta</TableHead>
              <TableHead className="text-right">Avance</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">No hay zonas habilitadas.</TableCell></TableRow>
            ) : (
              zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell>
                    <Badge variant="secondary">Comuna {zone.numero_comuna}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-2 text-blue-500" />
                      {zone.nombre}
                    </div>
                  </TableCell>
                  <TableCell>
                    {zone.gerente ? (
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {zone.gerente.nombre}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center text-slate-600 dark:text-slate-400">
                      <Users className="h-3 w-3 mr-1" /> {zone.registrados}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-slate-600 dark:text-slate-400">
                    {zone.meta_votos || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-blue-600">{zone.avance_porcentaje}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => openAssignModal(zone)}
                      title="Asignar Gerente"
                    >
                      <UserCog className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Asignación de Gerente */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Gerente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800 mb-2">
              <p className="text-sm text-slate-500">Zona seleccionada:</p>
              <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1 text-blue-500"/>
                {selectedZone?.nombre} (Comuna {selectedZone?.numero_comuna})
              </p>
            </div>

            <div>
              <Label>Usuario Responsable</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 mt-2 dark:bg-slate-950 dark:border-slate-800"
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
              >
                <option value="">Seleccionar usuario...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nombre} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancelar</Button>
              <Button onClick={handleAssignManager} className="bg-blue-600 hover:bg-blue-700">
                Guardar Asignación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
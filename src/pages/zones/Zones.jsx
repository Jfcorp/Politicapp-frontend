import { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  Plus, MapPin, TrendingUp, Users
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
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    municipio: 'Valledupar',
    meta_votos: '',
    numero_comuna: ''
  });

  // 1. Cargar Zonas desde el Backend
  const fetchZones = async () => {
    try {
      const { data } = await api.get('/zones');
      setZones(data);
    } catch (error) {
      console.error("Error cargando zonas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  // 2. Manejar Creación de Zona
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/zones', formData);

      // Resetear y recargar
      setFormData({ nombre: '', municipio: '', meta_votos: '' });
      setIsDialogOpen(false);
      fetchZones(); // Recargar la lista para ver la nueva zona
    } catch (error) {
      console.error("Error creando zona:", error);
      alert("Error al crear la zona. Verifica los datos.");
    }
  };

  if (loading) return <div className="p-8">Cargando territorio...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Zonas Electorales</h2>
          <p className="text-slate-500">Gestión de territorio y metas de votación.</p>
        </div>

        {/* Modal de Creación */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Nueva Zona
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nueva Zona</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label>Número de Comuna</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3"
                  value={formData.numero_comuna}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      numero_comuna: val,
                      // Autocompletar nombre para facilitar al usuario
                      nombre: val ? `Comuna ${val}` : ''
                    });
                  }}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="1">Comuna 1</option>
                  <option value="2">Comuna 2</option>
                  <option value="3">Comuna 3</option>
                  <option value="4">Comuna 4</option>
                  <option value="5">Comuna 5</option>
                  <option value="6">Comuna 6</option>
                </select>
              </div>
              <div>
                <Label htmlFor="nombre">Nombre del Barrio / Zona</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: OGB"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="municipio">Municipio</Label>
                <Input
                  id="municipio"
                  placeholder="Ej: Valledupar"
                  value={formData.municipio}
                  onChange={(e) => setFormData({...formData, municipio: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="meta">Meta de Votos</Label>
                <Input
                  id="meta"
                  type="number"
                  placeholder="Ej: 500"
                  value={formData.meta_votos}
                  onChange={(e) => setFormData({...formData, meta_votos: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600">Guardar Zona</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de Zonas */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Gerente</TableHead>
              <TableHead className="text-center">Registrados</TableHead>
              <TableHead className="text-center">Meta</TableHead>
              <TableHead className="text-right">Avance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No hay zonas registradas. Comienza creando una.
                </TableCell>
              </TableRow>
            ) : (
              zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-50 rounded-lg mr-3">
                        <MapPin className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-slate-900">{zone.nombre}</div>
                        <div className="text-xs text-slate-500">{zone.municipio}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {zone.gerente ? (
                      <Badge variant="outline" className="bg-slate-50">
                        {zone.gerente.nombre}
                      </Badge>
                    ) : (
                      <span className="text-slate-400 text-sm italic">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center text-slate-600">
                      <Users className="h-3 w-3 mr-1" /> {zone.registrados}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-slate-600">
                    {zone.meta}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end font-bold text-blue-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {zone.avance_porcentaje}
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
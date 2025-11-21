import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { MapPin, Users, UserCog, Filter } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search } from 'lucide-react';

export default function Zones() {
  const [allZones, setAllZones] = useState([]); // Todas las zonas cargadas
  const [filteredZones, setFilteredZones] = useState([]); // Zonas visibles
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('')

  // Filtros
  const [filterComuna, setFilterComuna] = useState('Todas');

  // Modal Gestión
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);

  // Formulario Gestión
  const [editForm, setEditForm] = useState({ managerId: '', meta_votos: '' });

  const fetchData = async () => {
    try {
      const [zRes, uRes] = await Promise.all([
        api.get('/zones'),
        api.get('/users')
      ]);
      setAllZones(zRes.data);
      setFilteredZones(zRes.data);
      setUsers(uRes.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filtrado local
  useEffect(() => {
    let result = allZones
    // Filtro por comuna
    if (filterComuna !== 'Todas') {
      result = result.filter(z => z.numero_comuna === filterComuna)
    }

    // 2. Filtro por Texto (Nombre del barrio)
    if (searchTerm) {
      result = result.filter(z =>
        z.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredZones(result)
  }, [filterComuna, allZones, searchTerm]);

  // Abrir Modal
  const openManageModal = (zone) => {
    setSelectedZone(zone);
    setEditForm({
      managerId: zone.managerId || '',
      meta_votos: zone.meta_votos || 0
    });
    setIsManageOpen(true);
  };

  // Guardar Cambios
  const handleSave = async () => {
    try {
      await api.put(`/zones/${selectedZone.id}/assign`, {
        managerId: editForm.managerId || null, // Enviar null si está vacío para desasignar
        meta_votos: editForm.meta_votos
      });
      setIsManageOpen(false);
      fetchData(); // Recargar
    } catch (error) {
      alert("Error al actualizar zona");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Territorio</h2>
          <p className="text-slate-500 dark:text-slate-400">Gestión de metas y responsables por barrio.</p>
        </div>

        {/* FILTRO POR COMUNA */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            className="bg-transparent text-sm font-medium outline-none text-slate-700 dark:text-slate-200"
            value={filterComuna}
            onChange={(e) => setFilterComuna(e.target.value)}
          >
            <option value="Todas">Todas las Comunas</option>
            {[1,2,3,4,5,6].map(n => <option key={n} value={`${n}`}>Comuna {n}</option>)}
          </select>
        </div>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="flex gap-2">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar barrio..."
            className="pl-8 h-9 w-[200px] bg-white dark:bg-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tu Select de Comuna existente */}
        <div className="flex items-center gap-2 bg-white ...">
          {/* ... */}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zona / Barrio</TableHead>
              <TableHead>Gerente</TableHead>
              <TableHead className="text-center">Meta</TableHead>
              <TableHead className="text-center">Real</TableHead>
              <TableHead className="text-right">Avance</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredZones.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{zone.nombre}</div>
                  <div className="flex items-center text-xs text-slate-500 mt-0.5">
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 mr-2">
                      C{zone.numero_comuna}
                    </Badge>
                    {zone.municipio}
                  </div>
                </TableCell>
                <TableCell>
                  {zone.gerente ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {zone.gerente.nombre.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{zone.gerente.nombre}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">-- Sin asignar --</span>
                  )}
                </TableCell>
                <TableCell className="text-center font-mono text-slate-600">
                  {zone.meta_votos}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold">
                    {zone.registrados}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-bold ${parseFloat(zone.avance_porcentaje) > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                    {zone.avance_porcentaje}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => openManageModal(zone)}
                    className="hover:bg-slate-100 dark:hover:bg-slate-900 text-blue-600"
                  >
                    {/** Asignar gerente */}
                    {/* <span>Asinar gerente</span> */}
                    <UserCog className="h-4 w-4" />

                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MODAL DE GESTIÓN */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestionar Zona: {selectedZone?.nombre}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg mb-2">
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold">Comuna</span>
                <p className="font-medium">{selectedZone?.numero_comuna}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold">Votos Actuales</span>
                <p className="font-medium">{selectedZone?.registrados}</p>
              </div>
            </div>

            <div>
              <Label>Gerente Responsable</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 mt-1.5 dark:bg-slate-950 dark:border-slate-800"
                value={editForm.managerId}
                onChange={(e) => setEditForm({...editForm, managerId: e.target.value})}
              >
                <option value="">-- Seleccionar Gerente --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Meta de Votos (Objetivo)</Label>
              <Input
                type="number"
                value={editForm.meta_votos}
                onChange={(e) => setEditForm({...editForm, meta_votos: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
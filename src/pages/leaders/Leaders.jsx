import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BARRIOS_POR_COMUNA } from '../../lib/valledupar-data';
import { AddressBuilder } from '../../components/AddressBuilder';
import { cn } from "@/lib/utils";
import {
  Plus, MapPin, TrendingUp, Phone, Briefcase, User, Calendar, AlertCircle,
  Check, ChevronsUpDown
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
// CORRECCIÓN 1: Importar CommandList
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Leaders() {
  const [leaders, setLeaders] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Estados para el Buscador
  const [openBarrio, setOpenBarrio] = useState(false);
  const [allBarrios, setAllBarrios] = useState([]);

  const [formData, setFormData] = useState({
    cedula: '', nombre: '', telefono: '', email: '', direccion: '',
    zoneId: '', barrio: '', comuna_display: '', numero_comuna: '',
    fecha_nacimiento: '', oficio: '', profesion: '', meta_votos: ''
  });

  const fetchData = async () => {
    try {
      const [leadersRes, zonesRes] = await Promise.all([
        api.get('/leaders'),
        api.get('/zones')
      ]);
      setLeaders(leadersRes.data);
      setZones(zonesRes.data);

      const lista = [];
      Object.entries(BARRIOS_POR_COMUNA).forEach(([com, barrs]) => {
        barrs.forEach(b => lista.push({ nombre: b, comuna: com }));
      });
      // Importante: el buscador de shadcn funciona mejor sin ordenar manualmente si el value es complejo
      // pero lo dejaremos ordenado para mejor visualización inicial
      setAllBarrios(lista.sort((a, b) => a.nombre.localeCompare(b.nombre)));

    } catch (error) {
      console.error("Error datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBarrioSelect = (nombreBarrio) => {
    const info = allBarrios.find(b => b.nombre === nombreBarrio);
    const comuna = info ? info.comuna : '';
    const zonaMatch = zones.find(z => z.nombre === nombreBarrio);

    setFormData(prev => ({
      ...prev,
      barrio: nombreBarrio,
      comuna_display: comuna,
      numero_comuna: comuna,
      zoneId: zonaMatch ? zonaMatch.id : ''
    }));
    setOpenBarrio(false);
  };

  const handleInputChange = (field, value) => {
    let val = value;
    if (field === 'telefono' || field === 'cedula') val = value.replace(/[^0-9]/g, '');
    if (field === 'nombre') val = value.toUpperCase();
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaders', formData);
      setFormData({
        cedula: '', nombre: '', telefono: '', email: '', direccion: '',
        zoneId: '', barrio: '', comuna_display: '', numero_comuna: '',
        fecha_nacimiento: '', oficio: '', profesion: '', meta_votos: ''
      });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Verifica los datos"));
    }
  };

  const getEffectivenessColor = (pct) => {
    const val = parseFloat(pct);
    if (val >= 80) return "text-green-600";
    if (val >= 40) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Red Política</h2>
          <p className="text-slate-500">Directorio de Líderes.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="mr-2 h-4 w-4"/> Nuevo Líder</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Registrar Líder</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center"><User className="h-3 w-3 mr-1"/> Identificación</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Cédula</Label><Input required value={formData.cedula} onChange={e => handleInputChange('cedula', e.target.value)} /></div>
                  <div><Label>Nombres</Label><Input required value={formData.nombre} onChange={e => handleInputChange('nombre', e.target.value)} /></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center"><MapPin className="h-3 w-3 mr-1"/> Ubicación</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-blue-600 font-semibold">Buscar Barrio</Label>
                    <Popover open={openBarrio} onOpenChange={setOpenBarrio}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openBarrio} className="w-full justify-between font-normal">
                          {formData.barrio || "Escribe para buscar..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Escribe para buscar..." />

                          {/* CORRECCIÓN 2: Envolver todo en CommandList */}
                          <CommandList>
                            <CommandEmpty>No se encontró el barrio.</CommandEmpty>
                            <CommandGroup>
                              {allBarrios.map((b) => (
                                <CommandItem
                                  key={`${b.nombre}-${b.comuna}`}
                                  value={b.nombre}
                                  onSelect={handleBarrioSelect}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", formData.barrio === b.nombre ? "opacity-100" : "opacity-0")} />
                                  {b.nombre}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>

                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div><Label>Comuna</Label><Input disabled value={formData.comuna_display ? `Comuna ${formData.comuna_display}` : ''} className="bg-slate-100"/></div>
                </div>

                {formData.barrio && !formData.zoneId && (
                  <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-xs rounded flex items-center gap-2">
                    <AlertCircle className="h-4 w-4"/>
                    <span>Zona nueva. Se creará automáticamente.</span>
                  </div>
                )}

                <AddressBuilder onChange={(val) => handleInputChange('direccion', val)} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div><Label>Celular</Label><Input value={formData.telefono} onChange={e => handleInputChange('telefono', e.target.value)} /></div>
                 <div className="col-span-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} /></div>
                 <div><Label>Cumpleaños</Label><Input type="date" value={formData.fecha_nacimiento} onChange={e => handleInputChange('fecha_nacimiento', e.target.value)} /></div>
                 <div><Label>Oficio</Label><Input value={formData.oficio} onChange={e => handleInputChange('oficio', e.target.value)} /></div>
                 <div><Label>Profesión</Label><Input value={formData.profesion} onChange={e => handleInputChange('profesion', e.target.value)} /></div>
              </div>

              <div><Label className="text-blue-600 font-bold">Meta de Votos</Label><Input type="number" required className="text-lg font-bold" value={formData.meta_votos} onChange={e => handleInputChange('meta_votos', e.target.value)} /></div>

              <Button type="submit" className="w-full bg-blue-600 h-11" disabled={!formData.barrio}>
                {formData.zoneId ? 'Registrar Líder' : 'Registrar y Crear Zona'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 overflow-hidden">
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
            {leaders.map((leader) => (
              <TableRow key={leader.id}>
                <TableCell>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{leader.nombre}</div>
                  <div className="text-xs text-slate-500">CC: {leader.cedula}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center"><Phone className="h-3 w-3 mr-1"/> {leader.telefono || '--'}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{leader.numero_comuna ? `Comuna ${leader.numero_comuna}` : 'SC'}</div>
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">{leader.zona_nombre || leader.barrio}</div>
                  <div className="flex items-center text-xs text-slate-500 mt-1 truncate max-w-[180px]" title={leader.direccion}><MapPin className="h-3 w-3 mr-1 flex-shrink-0"/> {leader.direccion || 'Sin dirección'}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-xs text-slate-600 dark:text-slate-400"><Briefcase className="h-3 w-3 mr-1"/> {leader.profesion || leader.oficio || '--'}</div>
                  <div className="flex items-center text-xs text-slate-600 mt-1"><Calendar className="h-3 w-3 mr-1"/> {leader.fecha_nacimiento || '--'}</div>
                </TableCell>
                <TableCell className="text-center"><Badge variant="outline">{leader.meta_votos}</Badge></TableCell>
                <TableCell className="text-center font-bold">{leader.votos_reales}</TableCell>
                <TableCell className="text-right"><span className={`font-bold ${getEffectivenessColor(leader.efectividad_porcentaje)}`}>{leader.efectividad_porcentaje}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
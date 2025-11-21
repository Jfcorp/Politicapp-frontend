import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddressBuilder({ onChange }) {
  const [parts, setParts] = useState({
    tipo: "Calle",
    numero1: "",
    letra1: "",
    numero2: "",
    letra2: "",
    placa: "",
    complemento: ""
  });

  // Cada vez que cambia una parte, armamos el string final
  useEffect(() => {
    // Formato estándar: "Calle 10A # 20B - 30 Apto 201"
    const direccion = `${parts.tipo} ${parts.numero1}${parts.letra1} # ${parts.numero2}${parts.letra2} - ${parts.placa} ${parts.complemento}`.trim();
    onChange(direccion);
  }, [parts]);

  const handleChange = (field, value) => {
    setParts(prev => ({ ...prev, [field]: value.toUpperCase() }));
  };

  return (
    <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
      <Label className="text-blue-600 font-semibold">Generador de Dirección (Estandarizada)</Label>

      {/* Fila 1: Tipo y Vía Principal */}
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-4 md:col-span-3">
          <select
            className="w-full h-10 rounded-md border border-slate-300 bg-white dark:bg-slate-950 px-2 text-sm"
            value={parts.tipo}
            onChange={(e) => handleChange("tipo", e.target.value)}
          >
            <option>Calle</option>
            <option>Carrera</option>
            <option>Avenida</option>
            <option>Transversal</option>
            <option>Diagonal</option>
            <option>Manzana</option>
          </select>
        </div>
        <div className="col-span-3 md:col-span-2">
          <Input placeholder="Num" value={parts.numero1} onChange={(e) => handleChange("numero1", e.target.value)} />
        </div>
        <div className="col-span-2 md:col-span-1">
          <Input placeholder="Ltr" value={parts.letra1} onChange={(e) => handleChange("letra1", e.target.value)} />
        </div>

        <div className="col-span-1 flex items-center justify-center text-slate-400 font-bold">#</div>

        {/* Fila 1 Continuación: Vía Generadora */}
        <div className="col-span-3 md:col-span-2">
          <Input placeholder="Num" value={parts.numero2} onChange={(e) => handleChange("numero2", e.target.value)} />
        </div>
        <div className="col-span-3 md:col-span-1">
          <Input placeholder="Ltr" value={parts.letra2} onChange={(e) => handleChange("letra2", e.target.value)} />
        </div>

        <div className="col-span-1 flex items-center justify-center text-slate-400 font-bold">-</div>

        {/* Placa */}
        <div className="col-span-4 md:col-span-2">
          <Input placeholder="Placa" value={parts.placa} onChange={(e) => handleChange("placa", e.target.value)} />
        </div>
      </div>

      {/* Fila 2: Complemento */}
      <div className="mt-2">
        <Input
          placeholder="Complemento (Ej: Apto 201, Edificio Azul)"
          value={parts.complemento}
          onChange={(e) => handleChange("complemento", e.target.value)}
        />
      </div>

      <p className="text-xs text-slate-500 mt-1">
        Resultado: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
          {`${parts.tipo} ${parts.numero1}${parts.letra1} # ${parts.numero2}${parts.letra2} - ${parts.placa} ${parts.complemento}`}
        </span>
      </p>
    </div>
  );
}
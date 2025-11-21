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

  useEffect(() => {
    // Construir la dirección final
    // Usamos toUpperCase() aquí para garantizar que el resultado final sea consistente
    const tipoUpper = parts.tipo; // El tipo ya viene bien del select
    const direccion = `${tipoUpper} ${parts.numero1}${parts.letra1} # ${parts.numero2}${parts.letra2} - ${parts.placa} ${parts.complemento}`.trim();
    onChange(direccion);
  }, [parts]);

  const handleChange = (field, value) => {
    // CORRECCIÓN: Solo convertimos a mayúsculas los campos de texto libre (letras, complementos).
    // El campo 'tipo' (Select) se deja tal cual para que coincida con las opciones <option>.
    const cleanValue = field === 'tipo' ? value : value.toUpperCase();

    setParts(prev => ({ ...prev, [field]: cleanValue }));
  };

  return (
    <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <Label className="text-blue-600 font-semibold">Generador de Dirección</Label>

      <div className="grid grid-cols-12 gap-2">
        {/* TIPO DE VÍA (Ahora funcionará correctamente) */}
        <div className="col-span-4 md:col-span-3">
          <select
            className="w-full h-10 rounded-md border border-slate-300 bg-white dark:bg-slate-950 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={parts.tipo}
            onChange={(e) => handleChange("tipo", e.target.value)}
          >
            <option value="Calle">Calle</option>
            <option value="Carrera">Carrera</option>
            <option value="Avenida">Avenida</option>
            <option value="Transversal">Transversal</option>
            <option value="Diagonal">Diagonal</option>
            <option value="Manzana">Manzana</option>
            <option value="Circular">Circular</option>
          </select>
        </div>

        {/* Vía Principal */}
        <div className="col-span-3 md:col-span-2">
          <Input
            placeholder="Num"
            value={parts.numero1}
            onChange={(e) => handleChange("numero1", e.target.value)}
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <Input
            placeholder="Ltr"
            value={parts.letra1}
            onChange={(e) => handleChange("letra1", e.target.value)}
          />
        </div>

        <div className="col-span-1 flex items-center justify-center text-slate-400 font-bold">#</div>

        {/* Vía Generadora */}
        <div className="col-span-3 md:col-span-2">
          <Input
            placeholder="Num"
            value={parts.numero2}
            onChange={(e) => handleChange("numero2", e.target.value)}
          />
        </div>
        <div className="col-span-3 md:col-span-1">
          <Input
            placeholder="Ltr"
            value={parts.letra2}
            onChange={(e) => handleChange("letra2", e.target.value)}
          />
        </div>

        <div className="col-span-1 flex items-center justify-center text-slate-400 font-bold">-</div>

        {/* Placa */}
        <div className="col-span-4 md:col-span-2">
          <Input
            placeholder="Placa"
            value={parts.placa}
            onChange={(e) => handleChange("placa", e.target.value)}
          />
        </div>
      </div>

      {/* Complemento */}
      <div className="mt-2">
        <Input
          placeholder="Complemento (Ej: APTO 201, TORRE 1)"
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
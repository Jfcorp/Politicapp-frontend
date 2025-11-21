// src/lib/valledupar-data.js

export const COMUNAS = [
  { id: "1", nombre: "Comuna 1" },
  { id: "2", nombre: "Comuna 2" },
  { id: "3", nombre: "Comuna 3" },
  { id: "4", nombre: "Comuna 4" },
  { id: "5", nombre: "Comuna 5" },
  { id: "6", nombre: "Comuna 6" },
];

// Mapeo estricto basado en tus archivos CSV
export const BARRIOS_POR_COMUNA = {
  "1": [
    "EL CENTRO", "LOPERENA", "ALTAGRACIA", "EL CARMEN", "LA GARITA", "GAITAN",
    "KENNEDY", "LA GRANJA", "SAN JORGE", "SOPERENA", "SANTO DOMINGO", "MIRAFLORES",
    "LAS DELICIAS", "HOSPITAL", "SAN ANTONIO", "PABLO VI", "GUATAPURI", "LAS PALMAS",
    "KENNEDY", "SAN JORGE", "CEREZO", "PARAISO", "NUEVA COLOMBIA", "11 DE NOVIEMBRE",
    "EL PESCAITO", "ESPERANZA ORIENTE", "9 DE MARZO", "ZAPATO EN MANO", "SANTA ANA (HERNANDO DE SANTANA)",
    "EL EDEN"

  ],
  "2": [
    "MAYALES", "SANTA RITA", "VILLA CLARA", "PANAMA", "LOS COCOS", "LOS MILAGROS",
    "12 DE OCTUBRE", "SAN FERNANDO", "VILLA CASTRO", "VERSALLES", "VILLA DEL ROSARIO",
    "CANDELARIA SUR", "VILLA CLARA", "SANTA RITA", "12 DE OCTUBRE",
    "SIMON BOLIVAR", "URB LOS MAYALES", "URB LAS AMERICAS", "AMANECERES DEL VALLE", "PANAMA",
    "SAN FERNANDO", " SAN JORGE", "URB LUIS CARLOS GALAN", "URB MARIA ELENA", "URB CASA E CAMPO",
    "URB BOSQUES DE RANCHO MIO"

  ],
  "3": [
    "PRIMERO DE MAYO", "SAN MARTIN", "VILLA LEONOR", "VALLE MEZA", "SIETE DE AGOSTO",
    "LOS FUNDADORES", "VILLA CASTRO", "25 DE DICIEMBRE"
    // ... Agrega el resto de Comuna 3
  ],
  "4": [
    "LA VICTORIA", "LOS CACIQUES", "VILLA TAXI", "EL PROGRESO", "CICARON", "VILLA MIRIAM",
    "FRANCISCO DE PAULA", "LA MARIGUITA", "CIUDADELA 450 AÑOS", "POPULAR"
    // ... Agrega el resto de Comuna 4
  ],
  "5": [
    "LA NEVADA", "DIVINO NIÑO", "BELLO HORIZONTE", "FUTURO DE LOS NIÑOS", "LA ROCA",
    "VILLA CONSUELO", "CAMPO ROMERO", "VILLA YANETH"
    // ... Agrega el resto de Comuna 5
  ],
  "6": [
    "LOS AGUINALDOS", "UNIDOS", "NUEVO AMANECER", "EL ROCIO", "SAN JERONIMO"
    // ... Agrega el resto de Comuna 6
  ]
};

export const TIPOS_VIA = [
  "Calle", "Carrera", "Diagonal", "Transversal", "Avenida", "Manzana", "Circular"
];
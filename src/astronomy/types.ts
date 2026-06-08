/**
 * Tipos e interfaces del dominio astrológico
 * y constantes de configuración (signos, aspectos).
 */

// ============================================
// DATOS DE ENTRADA
// ============================================

export interface BirthData {
  name: string;
  date: string;            // 'YYYY-MM-DD'
  time: string;            // 'HH:MM'
  city?: string;
  latitude: number;        // grados decimales, N positivo
  longitude: number;       // grados decimales, E positivo
  timezoneOffset?: number; // horas respecto a UTC (legacy)
  timezoneId?: string;     // IANA timezone, preferido
  useManualCoords?: boolean;
}

// ============================================
// POSICIONES PLANETARIAS
// ============================================

export interface PlanetPosition {
  name: string;
  longitude: number;   // longitud eclíptica geocéntrica [0, 360)
  signIndex: number;   // 0 = Aries … 11 = Piscis
  sign: string;
  degree: number;      // grados dentro del signo [0, 29]
  minute: number;      // minutos [0, 59]
  houseIndex: number;  // 0-based
  house: number;       // 1-based
  retrograde: boolean;
}

// ============================================
// CASAS
// ============================================

export interface HouseData {
  cusps: number[];    // 12 cúspides [0, 360), índice 0 = casa 1
  ascendant: number;  // longitud del ASC
  midheaven: number;  // longitud del MC
}

// ============================================
// ASPECTOS
// ============================================

export type AspectType =
  | 'conjunction'
  | 'sextile'
  | 'square'
  | 'trine'
  | 'opposition'
  | 'quincunx';

export interface AspectData {
  planet1: string;
  planet2: string;
  type: AspectType;
  angle: number;    // ángulo exacto del aspecto (0, 60, 90, 120, 150, 180)
  orb: number;      // separación real (grados)
  applying: boolean;
  symbol: string;
}

export const ASPECT_CONFIG: Record<AspectType, { angle: number; defaultOrb: number; symbol: string; name: string }> = {
  conjunction: { angle: 0,   defaultOrb: 8, symbol: '☌', name: 'Conjunción'  },
  sextile:     { angle: 60,  defaultOrb: 5, symbol: '⚹', name: 'Sextil'      },
  square:      { angle: 90,  defaultOrb: 7, symbol: '□', name: 'Cuadratura'  },
  trine:       { angle: 120, defaultOrb: 8, symbol: '△', name: 'Trígono'     },
  quincunx:    { angle: 150, defaultOrb: 3, symbol: '⚻', name: 'Quincuncio'  },
  opposition:  { angle: 180, defaultOrb: 8, symbol: '☍', name: 'Oposición'   },
};

// ============================================
// CARTA NATAL COMPLETA
// ============================================

export interface NatalChart {
  birthData: BirthData;
  planets: PlanetPosition[];
  houses: HouseData;
  aspects: AspectData[];
  ascendantSign: string;
  midheavenSign: string;
  calculatedAt: Date;
}

// ============================================
// PERSISTENCIA
// ============================================

export interface Consultant {
  id?: number;
  name: string;
  birthData: BirthData;
  chart?: NatalChart;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TherapistConfig {
  name: string;
  registration: string;
  signature: string;
  disclaimer: string;
  orbDefault: number;
}

// ============================================
// CONSTANTES ZODIACALES
// ============================================

export const ZODIAC_SIGNS: string[] = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer',
  'Leo', 'Virgo', 'Libra', 'Escorpio',
  'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
];

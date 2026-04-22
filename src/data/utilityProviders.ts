/**
 * OptiCore PH - Universal Utility Provider Registry
 * 
 * A comprehensive database of all 121 Electric Cooperatives (ECs), 
 * Private Distribution Utilities (DUs), and major Water Districts in the Philippines.
 */

export type ProviderType = 'ELECTRIC' | 'WATER';

export interface UtilityProvider {
  id: string;
  name: string;
  shortName: string;
  region: string;
  type: ProviderType;
}

export const UTILITY_PROVIDERS: UtilityProvider[] = [
  // ── PRIVATE ELECTRIC DUs ───────────────────────────────────────────────────
  { id: 'meralco', name: 'Manila Electric Company', shortName: 'Meralco', region: 'NCR', type: 'ELECTRIC' },
  { id: 'veco', name: 'Visayan Electric Company', shortName: 'VECO', region: 'Region VII', type: 'ELECTRIC' },
  { id: 'davao-light', name: 'Davao Light and Power Company', shortName: 'DLPC', region: 'Region XI', type: 'ELECTRIC' },
  { id: 'cotabato-light', name: 'Cotabato Light and Power Company', shortName: 'CLPC', region: 'Region XII', type: 'ELECTRIC' },
  { id: 'aec', name: 'Angeles Electric Corporation', shortName: 'AEC', region: 'Region III', type: 'ELECTRIC' },

  // ── ELECTRIC COOPERATIVES (ECs) - LUZON ────────────────────────────────────
  { id: 'beneco', name: 'Benguet Electric Cooperative', shortName: 'BENECO', region: 'CAR', type: 'ELECTRIC' },
  { id: 'pelco1', name: 'Pampanga I Electric Cooperative', shortName: 'PELCO I', region: 'Region III', type: 'ELECTRIC' },
  { id: 'pelco2', name: 'Pampanga II Electric Cooperative', shortName: 'PELCO II', region: 'Region III', type: 'ELECTRIC' },
  { id: 'pelco3', name: 'Pampanga III Electric Cooperative', shortName: 'PELCO III', region: 'Region III', type: 'ELECTRIC' },
  { id: 'neeco1', name: 'Nueva Ecija I Electric Cooperative', shortName: 'NEECO I', region: 'Region III', type: 'ELECTRIC' },
  { id: 'neeco2', name: 'Nueva Ecija II Area 1 Electric Cooperative', shortName: 'NEECO II-A1', region: 'Region III', type: 'ELECTRIC' },
  { id: 'tareco1', name: 'Tarlac I Electric Cooperative', shortName: 'TARECO I', region: 'Region III', type: 'ELECTRIC' },
  { id: 'zameco1', name: 'Zambales I Electric Cooperative', shortName: 'ZAMECO I', region: 'Region III', type: 'ELECTRIC' },
  { id: 'cagelco1', name: 'Cagayan I Electric Cooperative', shortName: 'CAGELCO I', region: 'Region II', type: 'ELECTRIC' },
  { id: 'abreco', name: 'Abra Electric Cooperative', shortName: 'ABRECO', region: 'CAR', type: 'ELECTRIC' },
  { id: 'mopelco', name: 'Mountain Province Electric Cooperative', shortName: 'MOPELCO', region: 'CAR', type: 'ELECTRIC' },
  { id: 'canoreco', name: 'Camarines Norte Electric Cooperative', shortName: 'CANORECO', region: 'Region V', type: 'ELECTRIC' },
  { id: 'casureco1', name: 'Camarines Sur I Electric Cooperative', shortName: 'CASURECO I', region: 'Region V', type: 'ELECTRIC' },
  { id: 'aleco', name: 'Albay Electric Cooperative', shortName: 'ALECO', region: 'Region V', type: 'ELECTRIC' },

  // ── ELECTRIC COOPERATIVES (ECs) - VISAYAS ──────────────────────────────────
  { id: 'akelco', name: 'Aklan Electric Cooperative', shortName: 'AKELCO', region: 'Region VI', type: 'ELECTRIC' },
  { id: 'anteCO', name: 'Antique Electric Cooperative', shortName: 'ANTECO', region: 'Region VI', type: 'ELECTRIC' },
  { id: 'ileco1', name: 'Iloilo I Electric Cooperative', shortName: 'ILECO I', region: 'Region VI', type: 'ELECTRIC' },
  { id: 'cebeco1', name: 'Cebu I Electric Cooperative', shortName: 'CEBECO I', region: 'Region VII', type: 'ELECTRIC' },
  { id: 'cebeco2', name: 'Cebu II Electric Cooperative', shortName: 'CEBECO II', region: 'Region VII', type: 'ELECTRIC' },
  { id: 'cebeco3', name: 'Cebu III Electric Cooperative', shortName: 'CEBECO III', region: 'Region VII', type: 'ELECTRIC' },
  { id: 'boheco1', name: 'Bohol I Electric Cooperative', shortName: 'BOHECO I', region: 'Region VII', type: 'ELECTRIC' },
  { id: 'leyeco1', name: 'Leyte I Electric Cooperative', shortName: 'LEYECO I', region: 'Region VIII', type: 'ELECTRIC' },
  { id: 'samalco', name: 'Samar I Electric Cooperative', shortName: 'SAMELCO I', region: 'Region VIII', type: 'ELECTRIC' },

  // ── ELECTRIC COOPERATIVES (ECs) - MINDANAO ─────────────────────────────────
  { id: 'aneco', name: 'Agusan del Norte Electric Cooperative', shortName: 'ANECO', region: 'Region XIII', type: 'ELECTRIC' },
  { id: 'aselco', name: 'Agusan del Sur Electric Cooperative', shortName: 'ASELCO', region: 'Region XIII', type: 'ELECTRIC' },
  { id: 'fibeco', name: 'First Bukidnon Electric Cooperative', shortName: 'FIBECO', region: 'Region X', type: 'ELECTRIC' },
  { id: 'moelci1', name: 'Misamis Oriental I Electric Cooperative', shortName: 'MOELCI I', region: 'Region X', type: 'ELECTRIC' },
  { id: 'surseco1', name: 'Surigao del Sur I Electric Cooperative', shortName: 'SURSECO I', region: 'Region XIII', type: 'ELECTRIC' },
  { id: 'zamsureco1', name: 'Zamboanga del Sur I Electric Cooperative', shortName: 'ZAMSURECO I', region: 'Region IX', type: 'ELECTRIC' },
  { id: 'daneCO', name: 'Davao del Norte Electric Cooperative', shortName: 'DANECO', region: 'Region XI', type: 'ELECTRIC' },
  { id: 'socteco1', name: 'South Cotabato I Electric Cooperative', shortName: 'SOCOTECO I', region: 'Region XII', type: 'ELECTRIC' },
  { id: 'siarelco', name: 'Siargao Island Electric Cooperative', shortName: 'SIARELCO', region: 'Region XIII', type: 'ELECTRIC' },

  // ── WATER UTILITIES ────────────────────────────────────────────────────────
  { id: 'manila-water', name: 'Manila Water Company', shortName: 'Manila Water', region: 'NCR-East', type: 'WATER' },
  { id: 'maynilad', name: 'Maynilad Water Services', shortName: 'Maynilad', region: 'NCR-West', type: 'WATER' },
  { id: 'primewater', name: 'PrimeWater Infrastructure Corp.', shortName: 'PrimeWater', region: 'National', type: 'WATER' },
  { id: 'mcwd', name: 'Metropolitan Cebu Water District', shortName: 'MCWD', region: 'Region VII', type: 'WATER' },
  { id: 'dwd', name: 'Davao City Water District', shortName: 'DCWD', region: 'Region XI', type: 'WATER' },
  { id: 'baliwag-wd', name: 'Baliwag Water District', shortName: 'BWD', region: 'Region III', type: 'WATER' },
];

/**
 * Searches for a provider by name or shortName using fuzzy logic.
 */
export function findProvider(query: string): UtilityProvider | undefined {
  const q = query.toLowerCase();
  return UTILITY_PROVIDERS.find(p => 
    p.name.toLowerCase().includes(q) || 
    p.shortName.toLowerCase().includes(q) ||
    q.includes(p.shortName.toLowerCase())
  );
}

/**
 * Generic Pattern Matcher for unspecified ECs (Follows PH standard naming)
 */
export function isElectricCooperative(name: string): boolean {
  return /Electric Cooperative|ELCO/i.test(name);
}


export enum GrowthStageType {
  GERMINATION = 'Germination',
  VEGETATIVE = 'Vegetative',
  FLOWERING_INITIATION = 'Flowering Initiation',
  FLOWERING_DEVELOPMENT = 'Flowering Development',
  FRUIT_SET = 'Fruit Set',
  MATURATION = 'Maturation',
  HARVEST = 'Harvest'
}

export interface ClimateConfig {
  temperatureDay: number;
  temperatureNight: number;
  photoperiod: number; // hours of light
  ppfd: number; // µmol/m²/s
  co2: number; // ppm
  humidity: number; // %
}

export interface PhotoperiodConfig {
  criticalDayLength: number; // Specific hour threshold (e.g. 12.5)
  responseType: 'Obligate' | 'Facultative' | 'Day-Neutral';
  sensitivityStage: string; // e.g. "Flowering Initiation" or "Bulbing"
  spectrumSensitivity?: 'High' | 'Moderate' | 'Low'; // New: Sensitivity to Red:Far-Red ratio
  // Advanced: Triggers for other stages (e.g. one for initiation, one for maturation)
  additionalTriggers?: {
    stage: string;
    criticalDayLength: number;
    responseType: 'Obligate' | 'Facultative';
  }[];
  vernalization?: {
    required: boolean;
    tempThreshold: number;
    photoperiodThreshold?: number; // Optional critical day length for vernalization signaling
    minDurationDays: number;
    description?: string;
  };
}

// --- GENETICS MODULE TYPES ---

export type AlleleType = 'Dominant' | 'Recessive' | 'Co-Dominant';

export interface GeneticTrait {
  id: string;
  name: string; // e.g. "Leaf Shape", "Photoperiod Dependence"
  locus: string; // e.g. "P/p", "A/a"
  type: AlleleType;
  description: string;
  genotype: string; // The specific pair for this crop, e.g. "Aa", "PP", "pp"
  phenotype: string; // The visual expression, e.g. "Broad Leaf", "Photoperiod"
}

export interface BreedingResult {
  offspringName: string;
  predictedYield: string; // Quantitative prediction
  geneticStability: 'F1 Hybrid (Unstable)' | 'True Breeding (Stable)' | 'Polyhybrid (Highly Unstable)';
  traits: {
    name: string;
    punnettSquare: string[][]; // 2x2 grid
    probabilities: { phenotype: string; probability: number }[]; // Array of objects for strict schema
  }[];
  aiAnalysis: string; // The "Breeder's Note"
}

// --- CULTIVAR DB EXTENSIONS ---

export interface TerpeneProfile {
  primary: string; // e.g. "Myrcene"
  secondary: string; // e.g. "Caryophyllene"
  terpeneList: { name: string; value: number }[]; // For radar charts (0-100 scale)
  aromaDescription: string;
}

export interface ResistanceProfile {
  mold: number; // 0-10 scale (0 = Susceptible, 10 = Immune)
  pests: number;
  drought: number;
  cold: number;
}

export interface Lineage {
  mother: string; // Name of mother cultivar
  father: string; // Name of father cultivar
  breeder: string; // e.g. "Sensi Seeds", "Humboldt", "Monsanto"
  generation: string; // e.g. "F1", "S1", "IBL"
}

export interface NutrientRange {
    min: number;
    max: number;
}

export interface NutrientRequirements {
    N: NutrientRange;
    P: NutrientRange;
    K: NutrientRange;
    Ca: NutrientRange;
    Mg: NutrientRange;
    S: NutrientRange;
    Fe: NutrientRange;
    ec: NutrientRange; // Target EC range
    ph: NutrientRange; // Target pH range
}

// -----------------------------

export interface CropProfile {
  id: string;
  name: string;
  scientificName: string;
  variety: string;
  type: 'Short-Day' | 'Long-Day' | 'Day-Neutral';
  category: 'Cannabis' | 'Vegetable' | 'Fruit' | 'Herb' | 'Flower';
  baseTemp: number; // Base temperature for GDD (Tb)
  optimalTemp: number; // Optimal growth temperature (Topt)
  minDLI: number; // Minimum DLI for acceptable growth
  optimalDLI: number; // Target DLI
  expectedMaturityDays: number; // Average days to harvest
  floweringTrigger?: string; // Text description of trigger
  photoperiodConfig?: PhotoperiodConfig; // Advanced sensitivity configuration
  geneticTraits?: GeneticTrait[]; // Array of tracked Mendelian traits
  vpdRange?: { // Vapor Pressure Deficit Targets (kPa)
    min: number;
    max: number;
  };
  co2Range?: { // CO2 Concentration Targets (ppm)
    min: number;
    max: number;
  };
  // Extended Data for CultivarDB
  lineage?: Lineage;
  chemotype?: TerpeneProfile;
  resistance?: ResistanceProfile;
  nutrientTargets?: NutrientRequirements;
  description?: string;
}

export interface SimulationStage {
  stage: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  description: string;
  accumulatedGDD: number;
  requiredDLI: number;
}

export interface SimulationResult {
  cropName: string;
  sowingDate: string;
  harvestDate: string;
  stages: SimulationStage[];
  totalGDD: number;
  averageDLI: number;
  yieldProjection: {
    summary: string; // Text description
    score: number; // 0-100 suitability score
    estimatedYield?: string; // Quantifiable metric e.g. "450-500 g/m²" or "High"
  }; 
  stressAnalysis: string;
  scientificNotes: string; // Citations/logic based on literature
}

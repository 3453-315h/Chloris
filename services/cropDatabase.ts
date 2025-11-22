
import { CropProfile } from "../types";

/**
 * In-Memory Database of Crop Phenology Constants.
 * Data compiled from:
 * - PMC10004775 (Cannabis Phenology)
 * - HortScience 52(12) (Thermal Time Models)
 * - Frontiers in Plant Science (DLI requirements)
 * - MDPI Plants (Growth Stages)
 * - Phylos Bioscience (Lineage Mock Data)
 */

const CROP_DATA: CropProfile[] = [
  // --- CANNABIS STRAINS ---
  {
    id: "can-ind-001",
    name: "Cannabis (Indica)",
    scientificName: "Cannabis sativa forma indica",
    variety: "Northern Lights",
    type: "Short-Day",
    category: "Cannabis",
    baseTemp: 10,
    optimalTemp: 26,
    minDLI: 22,
    optimalDLI: 40,
    expectedMaturityDays: 65,
    floweringTrigger: "< 13h light",
    photoperiodConfig: {
        criticalDayLength: 13.5,
        responseType: 'Obligate',
        sensitivityStage: 'Flowering Initiation'
    },
    geneticTraits: [
      { id: "trait-leaf", name: "Leaf Morphology", locus: "L", type: "Dominant", description: "L=Broad (Indica), l=Narrow (Sativa)", genotype: "LL", phenotype: "Broad Leaf" },
      { id: "trait-photo", name: "Flowering Type", locus: "A", type: "Dominant", description: "A=Photoperiod, a=Autoflower", genotype: "AA", phenotype: "Photoperiod" },
      { id: "trait-purple", name: "Anthocyanin", locus: "P", type: "Recessive", description: "P=Green, p=Purple", genotype: "PP", phenotype: "Green" }
    ],
    vpdRange: { min: 0.8, max: 1.2 },
    co2Range: { min: 400, max: 1500 },
    lineage: { mother: "Afghani Landrace", father: "Thai Landrace", breeder: "Sensi Seeds", generation: "IBL" },
    chemotype: {
        primary: "Myrcene",
        secondary: "Caryophyllene",
        aromaDescription: "Earthy, Pine, Sweet",
        terpeneList: [
            { name: "Myrcene", value: 90 },
            { name: "Pinene", value: 60 },
            { name: "Caryophyllene", value: 40 },
            { name: "Limonene", value: 10 },
            { name: "Linalool", value: 20 }
        ]
    },
    resistance: { mold: 8, pests: 7, drought: 6, cold: 9 },
    nutrientTargets: {
        N: { min: 100, max: 200 },
        P: { min: 30, max: 60 },
        K: { min: 150, max: 300 },
        Ca: { min: 100, max: 150 },
        Mg: { min: 40, max: 60 },
        S: { min: 50, max: 100 },
        Fe: { min: 2, max: 5 },
        ec: { min: 1.8, max: 2.6 },
        ph: { min: 5.5, max: 6.2 }
    },
    description: "Legendary indica known for resinous buds, fast flowering, and resilience during growth."
  },
  {
    id: "can-sat-001",
    name: "Cannabis (Sativa)",
    scientificName: "Cannabis sativa forma sativa",
    variety: "Durban Poison",
    type: "Short-Day",
    category: "Cannabis",
    baseTemp: 11,
    optimalTemp: 28,
    minDLI: 25,
    optimalDLI: 45,
    expectedMaturityDays: 95,
    floweringTrigger: "< 12h light",
    photoperiodConfig: {
        criticalDayLength: 12.5,
        responseType: 'Obligate',
        sensitivityStage: 'Flowering Initiation',
        spectrumSensitivity: 'High'
    },
    geneticTraits: [
      { id: "trait-leaf", name: "Leaf Morphology", locus: "L", type: "Dominant", description: "L=Broad (Indica), l=Narrow (Sativa)", genotype: "ll", phenotype: "Narrow Leaf" },
      { id: "trait-photo", name: "Flowering Type", locus: "A", type: "Dominant", description: "A=Photoperiod, a=Autoflower", genotype: "AA", phenotype: "Photoperiod" },
      { id: "trait-purple", name: "Anthocyanin", locus: "P", type: "Recessive", description: "P=Green, p=Purple", genotype: "Pp", phenotype: "Green (Carrier)" }
    ],
    vpdRange: { min: 1.0, max: 1.5 },
    co2Range: { min: 400, max: 1400 },
    lineage: { mother: "South African Landrace", father: "South African Landrace", breeder: "Dutch Passion", generation: "Landrace" },
    chemotype: {
        primary: "Terpinolene",
        secondary: "Ocimene",
        aromaDescription: "Spicy, Haze, Anise",
        terpeneList: [
            { name: "Myrcene", value: 20 },
            { name: "Pinene", value: 30 },
            { name: "Caryophyllene", value: 40 },
            { name: "Terpinolene", value: 95 },
            { name: "Ocimene", value: 70 }
        ]
    },
    resistance: { mold: 9, pests: 6, drought: 9, cold: 4 },
    nutrientTargets: {
        N: { min: 100, max: 180 },
        P: { min: 30, max: 60 },
        K: { min: 120, max: 250 },
        Ca: { min: 80, max: 120 },
        Mg: { min: 30, max: 50 },
        S: { min: 50, max: 90 },
        Fe: { min: 2, max: 5 },
        ec: { min: 1.6, max: 2.2 },
        ph: { min: 5.5, max: 6.0 }
    },
    description: "Pure sativa landrace from South Africa. Extremely tall, energetic effects, licorice aroma."
  },
  {
    id: "can-hyb-001",
    name: "Cannabis (Hybrid)",
    scientificName: "Cannabis sativa L.",
    variety: "Blue Dream",
    type: "Short-Day",
    category: "Cannabis",
    baseTemp: 10,
    optimalTemp: 26,
    minDLI: 25,
    optimalDLI: 40,
    expectedMaturityDays: 75,
    floweringTrigger: "< 12.5h light",
    photoperiodConfig: {
        criticalDayLength: 13,
        responseType: 'Facultative',
        sensitivityStage: 'Flowering Initiation'
    },
    geneticTraits: [
      { id: "trait-leaf", name: "Leaf Morphology", locus: "L", type: "Dominant", description: "L=Broad (Indica), l=Narrow (Sativa)", genotype: "Ll", phenotype: "Hybrid Leaf" },
      { id: "trait-photo", name: "Flowering Type", locus: "A", type: "Dominant", description: "A=Photoperiod, a=Autoflower", genotype: "AA", phenotype: "Photoperiod" }
    ],
    vpdRange: { min: 0.8, max: 1.3 },
    co2Range: { min: 400, max: 1500 },
    lineage: { mother: "Blueberry", father: "Haze", breeder: "Humboldt Seed Org", generation: "F1" },
    chemotype: {
        primary: "Myrcene",
        secondary: "Pinene",
        aromaDescription: "Berry, Sweet, Herbal",
        terpeneList: [
            { name: "Myrcene", value: 80 },
            { name: "Pinene", value: 60 },
            { name: "Caryophyllene", value: 30 },
            { name: "Limonene", value: 40 },
            { name: "Linalool", value: 30 }
        ]
    },
    resistance: { mold: 5, pests: 6, drought: 7, cold: 6 },
    nutrientTargets: {
        N: { min: 100, max: 200 },
        P: { min: 30, max: 70 },
        K: { min: 150, max: 280 },
        Ca: { min: 100, max: 150 },
        Mg: { min: 40, max: 60 },
        S: { min: 60, max: 100 },
        Fe: { min: 2, max: 5 },
        ec: { min: 1.8, max: 2.5 },
        ph: { min: 5.6, max: 6.2 }
    },
    description: "Commercial staple known for massive yields and mass appeal. Vigorous vegetative growth."
  },
  {
    id: "can-ind-002",
    name: "Cannabis (Indica)",
    scientificName: "Cannabis sativa forma indica",
    variety: "Granddaddy Purple",
    type: "Short-Day",
    category: "Cannabis",
    baseTemp: 10,
    optimalTemp: 24,
    minDLI: 20,
    optimalDLI: 35,
    expectedMaturityDays: 60,
    floweringTrigger: "< 13h light",
    photoperiodConfig: {
        criticalDayLength: 13.5,
        responseType: 'Obligate',
        sensitivityStage: 'Flowering Initiation'
    },
    geneticTraits: [
      { id: "trait-leaf", name: "Leaf Morphology", locus: "L", type: "Dominant", description: "L=Broad (Indica), l=Narrow (Sativa)", genotype: "LL", phenotype: "Broad Leaf" },
      { id: "trait-purple", name: "Anthocyanin", locus: "P", type: "Recessive", description: "P=Green, p=Purple", genotype: "pp", phenotype: "Purple" }
    ],
    vpdRange: { min: 0.8, max: 1.2 },
    co2Range: { min: 400, max: 1500 },
    lineage: { mother: "Purple Urkle", father: "Big Bud", breeder: "Ken Estes", generation: "S1" },
    chemotype: {
        primary: "Linalool",
        secondary: "Caryophyllene",
        aromaDescription: "Grape, Floral, Berry",
        terpeneList: [
            { name: "Myrcene", value: 50 },
            { name: "Pinene", value: 20 },
            { name: "Caryophyllene", value: 60 },
            { name: "Limonene", value: 20 },
            { name: "Linalool", value: 90 }
        ]
    },
    resistance: { mold: 4, pests: 5, drought: 5, cold: 8 },
    nutrientTargets: {
        N: { min: 80, max: 180 },
        P: { min: 40, max: 80 },
        K: { min: 150, max: 250 },
        Ca: { min: 100, max: 140 },
        Mg: { min: 40, max: 60 },
        S: { min: 50, max: 100 },
        Fe: { min: 2, max: 5 },
        ec: { min: 1.6, max: 2.2 },
        ph: { min: 5.8, max: 6.3 }
    },
    description: "Famous for deep purple coloration and heavy sedative effects. Requires humidity control in late flower."
  },
  {
    id: "can-rud-001",
    name: "Cannabis (Autoflower)",
    scientificName: "Cannabis ruderalis hybrid",
    variety: "White Widow Auto",
    type: "Day-Neutral",
    category: "Cannabis",
    baseTemp: 8,
    optimalTemp: 24,
    minDLI: 20,
    optimalDLI: 40,
    expectedMaturityDays: 75,
    floweringTrigger: "Age (3-4 weeks)",
    photoperiodConfig: {
        criticalDayLength: 0,
        responseType: 'Day-Neutral',
        sensitivityStage: 'None'
    },
    geneticTraits: [
      { id: "trait-photo", name: "Flowering Type", locus: "A", type: "Dominant", description: "A=Photoperiod, a=Autoflower", genotype: "aa", phenotype: "Autoflower" }
    ],
    vpdRange: { min: 0.8, max: 1.3 },
    co2Range: { min: 400, max: 1200 },
    lineage: { mother: "White Widow", father: "Ruderalis", breeder: "Greenhouse Seeds", generation: "F4" },
    chemotype: {
        primary: "Myrcene",
        secondary: "Pinene",
        aromaDescription: "Woody, Earthy, Pungent",
        terpeneList: [
            { name: "Myrcene", value: 70 },
            { name: "Pinene", value: 60 },
            { name: "Caryophyllene", value: 40 },
            { name: "Limonene", value: 30 },
            { name: "Linalool", value: 20 }
        ]
    },
    resistance: { mold: 7, pests: 7, drought: 8, cold: 9 },
    nutrientTargets: {
        N: { min: 100, max: 160 },
        P: { min: 30, max: 60 },
        K: { min: 120, max: 220 },
        Ca: { min: 80, max: 120 },
        Mg: { min: 30, max: 50 },
        S: { min: 40, max: 80 },
        Fe: { min: 1.5, max: 4 },
        ec: { min: 1.2, max: 1.8 }, // Ruderalis prefers lower EC
        ph: { min: 5.8, max: 6.3 }
    },
    description: "Classic dutch strain crossed with Ruderalis for fast automatic flowering. Very hardy."
  },
  // --- SOLANACEAE (Tomatoes, Peppers) ---
  {
    id: "sol-tom-001",
    name: "Tomato",
    scientificName: "Solanum lycopersicum",
    variety: "Roma (Determinate)",
    type: "Day-Neutral",
    category: "Vegetable",
    baseTemp: 10,
    optimalTemp: 25,
    minDLI: 15,
    optimalDLI: 30,
    expectedMaturityDays: 75,
    geneticTraits: [
        { id: "trait-growth", name: "Growth Habit", locus: "SP", type: "Dominant", description: "SP=Indeterminate, sp=Determinate", genotype: "spsp", phenotype: "Determinate (Bush)" },
        { id: "trait-leaf-tom", name: "Leaf Type", locus: "C", type: "Dominant", description: "C=Cut (Regular), c=Potato Leaf", genotype: "CC", phenotype: "Regular Leaf" }
    ],
    vpdRange: { min: 0.8, max: 1.2 },
    co2Range: { min: 400, max: 1000 },
    lineage: { mother: "San Marzano", father: "Unknown Hybrid", breeder: "USDA", generation: "OP" },
    chemotype: {
        primary: "Lycopene",
        secondary: "Glutamate",
        aromaDescription: "Savory, Acidic",
        terpeneList: []
    },
    resistance: { mold: 6, pests: 5, drought: 6, cold: 4 },
    nutrientTargets: {
        N: { min: 150, max: 250 },
        P: { min: 40, max: 80 },
        K: { min: 250, max: 400 }, // Tomatoes love K
        Ca: { min: 150, max: 250 }, // Prevents blossom end rot
        Mg: { min: 40, max: 80 },
        S: { min: 50, max: 120 },
        Fe: { min: 2, max: 5 },
        ec: { min: 2.0, max: 3.5 }, // High EC tolerance
        ph: { min: 5.5, max: 6.5 }
    },
    description: "Classic paste tomato. Compact bush habit makes it ideal for field production or small spaces."
  },
  {
    id: "sol-tom-002",
    name: "Tomato",
    scientificName: "Solanum lycopersicum",
    variety: "Beefsteak (Indeterminate)",
    type: "Day-Neutral",
    category: "Vegetable",
    baseTemp: 10,
    optimalTemp: 24,
    minDLI: 18,
    optimalDLI: 35,
    expectedMaturityDays: 90,
    geneticTraits: [
        { id: "trait-growth", name: "Growth Habit", locus: "SP", type: "Dominant", description: "SP=Indeterminate, sp=Determinate", genotype: "SPSP", phenotype: "Indeterminate (Vining)" },
        { id: "trait-leaf-tom", name: "Leaf Type", locus: "C", type: "Dominant", description: "C=Cut (Regular), c=Potato Leaf", genotype: "Cc", phenotype: "Regular Leaf" }
    ],
    vpdRange: { min: 0.8, max: 1.3 },
    co2Range: { min: 400, max: 1200 },
    lineage: { mother: "Ponderosa", father: "Unknown", breeder: "Heirloom", generation: "Heirloom" },
    resistance: { mold: 3, pests: 4, drought: 5, cold: 3 },
    nutrientTargets: {
        N: { min: 150, max: 250 },
        P: { min: 40, max: 80 },
        K: { min: 250, max: 400 },
        Ca: { min: 150, max: 250 },
        Mg: { min: 40, max: 80 },
        S: { min: 50, max: 120 },
        Fe: { min: 2, max: 5 },
        ec: { min: 2.0, max: 3.0 },
        ph: { min: 5.5, max: 6.5 }
    },
    description: "Large slicing tomato. Requires trellising and pruning. High flavor, softer texture."
  },
  {
    id: "sol-pep-001",
    name: "Pepper (Bell)",
    scientificName: "Capsicum annuum",
    variety: "California Wonder",
    type: "Day-Neutral",
    category: "Vegetable",
    baseTemp: 12,
    optimalTemp: 27,
    minDLI: 15,
    optimalDLI: 30,
    expectedMaturityDays: 75,
    vpdRange: { min: 0.8, max: 1.2 },
    co2Range: { min: 400, max: 1000 },
    lineage: { mother: "Yolo Wonder", father: "Unknown", breeder: "Heirloom", generation: "OP" },
    resistance: { mold: 7, pests: 6, drought: 6, cold: 2 },
    nutrientTargets: {
        N: { min: 150, max: 220 },
        P: { min: 40, max: 60 },
        K: { min: 200, max: 300 },
        Ca: { min: 150, max: 200 },
        Mg: { min: 40, max: 60 },
        S: { min: 40, max: 80 },
        Fe: { min: 2, max: 5 },
        ec: { min: 2.0, max: 2.5 },
        ph: { min: 5.8, max: 6.3 }
    },
    description: "Standard blocky bell pepper. Starts green, ripens to red. Thick walls."
  },
  {
    id: "root-oni-001",
    name: "Onion",
    scientificName: "Allium cepa",
    variety: "Yellow Sweet (Short Day)",
    type: "Short-Day",
    category: "Vegetable",
    baseTemp: 5,
    optimalTemp: 24,
    minDLI: 15,
    optimalDLI: 25,
    expectedMaturityDays: 110,
    floweringTrigger: "Bulbing triggered by < 12h",
    photoperiodConfig: {
        criticalDayLength: 12,
        responseType: 'Obligate',
        sensitivityStage: 'Bulb Initiation'
    },
    vpdRange: { min: 0.5, max: 1.0 },
    co2Range: { min: 400, max: 800 },
    lineage: { mother: "Granex", father: "Grano", breeder: "Vidalia Region", generation: "Hybrid" },
    resistance: { mold: 5, pests: 7, drought: 5, cold: 8 },
    nutrientTargets: {
        N: { min: 120, max: 180 },
        P: { min: 40, max: 80 },
        K: { min: 150, max: 200 },
        Ca: { min: 80, max: 120 },
        Mg: { min: 20, max: 40 },
        S: { min: 80, max: 150 }, // High Sulfur for pungency
        Fe: { min: 1, max: 3 },
        ec: { min: 1.5, max: 2.0 },
        ph: { min: 6.0, max: 6.8 }
    },
    description: "High sugar content onion. Requires specific latitude (short day) to bulb correctly."
  },
  {
    id: "leaf-let-001",
    name: "Lettuce",
    scientificName: "Lactuca sativa",
    variety: "Romaine",
    type: "Long-Day",
    category: "Vegetable",
    baseTemp: 4,
    optimalTemp: 18,
    minDLI: 10,
    optimalDLI: 17,
    expectedMaturityDays: 60,
    floweringTrigger: "Bolts in high heat/LD",
    photoperiodConfig: {
        criticalDayLength: 14,
        responseType: 'Facultative',
        sensitivityStage: 'Maturation'
    },
    vpdRange: { min: 0.4, max: 0.8 },
    co2Range: { min: 400, max: 1000 },
    resistance: { mold: 4, pests: 3, drought: 2, cold: 8 },
    nutrientTargets: {
        N: { min: 100, max: 150 },
        P: { min: 30, max: 50 },
        K: { min: 150, max: 200 },
        Ca: { min: 80, max: 120 }, // Prevent tip burn
        Mg: { min: 20, max: 40 },
        S: { min: 30, max: 60 },
        Fe: { min: 1.5, max: 4 },
        ec: { min: 0.8, max: 1.4 }, // Very salt sensitive
        ph: { min: 5.6, max: 6.0 }
    },
    description: "Crisp upright lettuce. Prone to bolting in summer heat."
  },
  {
    id: "grain-wheat-001",
    name: "Winter Wheat",
    scientificName: "Triticum aestivum",
    variety: "Hard Red Winter",
    type: "Long-Day",
    category: "Flower", // Categorized loosely for demo
    baseTemp: 0,
    optimalTemp: 20,
    minDLI: 20,
    optimalDLI: 35,
    expectedMaturityDays: 200,
    floweringTrigger: "Cold treatment + Long Days",
    photoperiodConfig: {
        criticalDayLength: 14,
        responseType: 'Obligate',
        sensitivityStage: 'Flowering Initiation',
        vernalization: {
            required: true,
            tempThreshold: 5,
            minDurationDays: 45,
            description: "Requires 6 weeks of cold (<5°C) to initiate reproductive phase."
        }
    },
    vpdRange: { min: 0.5, max: 1.2 },
    co2Range: { min: 400, max: 800 },
    resistance: { mold: 7, pests: 8, drought: 8, cold: 10 },
    description: "Requires vernalization (winter chill) to trigger flowering capability, followed by long days."
  }
];

/**
 * Database Service Class acting as the SQLite Interface.
 */
export class CropDatabase {
  static getAllCrops(): CropProfile[] {
    return CROP_DATA.sort((a, b) => a.name.localeCompare(b.name));
  }

  static getCropsByCategory(category: CropProfile['category']): CropProfile[] {
    return CROP_DATA.filter(c => c.category === category);
  }

  static searchCrops(query: string): CropProfile[] {
    const lowerQuery = query.toLowerCase();
    return CROP_DATA.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) || 
      c.variety.toLowerCase().includes(lowerQuery) ||
      c.scientificName.toLowerCase().includes(lowerQuery)
    );
  }

  static getCropById(id: string): CropProfile | undefined {
    return CROP_DATA.find(c => c.id === id);
  }
}

export const DEFAULT_CROP_ID = "can-ind-001";


import React from 'react';
import { BookOpen, Lightbulb } from 'lucide-react';
import { CropProfile } from '../types';

export type SectionId = 'phenology' | 'climate' | 'nutrient' | 'market';

interface GlossaryTerm {
  term: string;
  def: string;
}

// --- DATA: GLOSSARY TERMS ---
const GLOSSARY_DATA: Record<SectionId, GlossaryTerm[]> = {
  phenology: [
    { term: 'GDD (Growing Degree Days)', def: 'A measure of heat accumulation used to predict plant development rates. Calculated as (MaxTemp + MinTemp)/2 - BaseTemp.' },
    { term: 'DLI (Daily Light Integral)', def: 'The total number of photons (in moles) received by a square meter of surface in one day. Formula: PPFD × Hours × 0.0036.' },
    { term: 'Photoperiodism', def: 'The physiological reaction of organisms to the length of day or night. Critical for triggering flowering in Short-Day plants.' },
    { term: 'Vernalization', def: 'The induction of a plant\'s flowering process by exposure to the prolonged cold of winter, or by an artificial equivalent.' },
    { term: 'PPFD', def: 'Photosynthetic Photon Flux Density. The amount of light (photons) actually arriving at the plant canopy per second.' }
  ],
  climate: [
    { term: 'VPD (Vapor Pressure Deficit)', def: 'The difference between the amount of moisture in the air and how much moisture the air can hold when saturated. Drives transpiration.' },
    { term: 'Transpiration', def: 'The process of water movement through a plant and its evaporation from aerial parts, such as leaves, stems and flowers.' },
    { term: 'Latent Heat', def: 'Energy released or absorbed, by a body or a thermodynamic system, during a constant-temperature process (like water evaporating from leaves).' },
    { term: 'CFM (Cubic Feet per Min)', def: 'Measurement of airflow volume. Critical for calculating exhaust fan requirements to remove heat load.' },
    { term: 'Stomata', def: 'Microscopic pores in the shoot epidermis of plants that provide for gas exchange (CO2 intake, H2O release).' }
  ],
  nutrient: [
    { term: 'EC (Electrical Conductivity)', def: 'A measure of the concentration of dissolved ions in the nutrient solution. Higher EC means "stronger" food.' },
    { term: 'Anion / Cation', def: 'Ions with a negative (Anion) or positive (Cation) charge. Plants balance internal pH by exchanging these with the soil solution.' },
    { term: 'Antagonism', def: 'When an excess of one nutrient interferes with the uptake of another (e.g., High Potassium blocking Magnesium).' },
    { term: 'Precipitation', def: 'When dissolved ions chemically bond to form a solid (e.g., Calcium + Sulfur = Gypsum), making them unavailable to the plant.' },
    { term: 'Chelation', def: 'Bonding ions (like Iron) to an organic molecule to protect them from precipitation and keep them available at wider pH ranges.' }
  ],
  market: [
    { term: 'OpEx', def: 'Operational Expenditure. Recurring costs like electricity, water, nutrients, and labor.' },
    { term: 'CapEx', def: 'Capital Expenditure. Upfront costs like LED lights, HVAC systems, and rolling benches.' },
    { term: 'Biomass', def: 'The total mass of living biological organisms in a given area. In agriculture, often refers to the harvestable weight.' },
    { term: 'Canopy Efficiency', def: 'A metric (g/Watt or g/sqft) measuring how effectively inputs are converted into saleable product.' },
    { term: 'ROI', def: 'Return on Investment. Net Profit divided by Total Cost.' }
  ]
};

// --- DATA: RECOMMENDATIONS ---
const RECOMMENDATIONS: Record<SectionId, Record<string, string[]>> = {
  phenology: {
    'Cannabis': [
      'Trigger flowering by switching light cycle to 12/12 strictly.',
      'Ensure 100% darkness during night cycle to prevent hermaphroditism.',
      'Defoliate broad fan leaves at Week 3 of flower to improve light penetration.'
    ],
    'Vegetable': [
      'For tomatoes, prune "suckers" (axillary shoots) to focus energy on fruit production.',
      'Ensure consistent DLI to prevent uneven ripening.',
      'Pollination assistance may be required indoors (shaking or bumblebees).'
    ],
    'Herb': [
      'Harvest basil frequently to prevent bolting (flowering), which ruins flavor.',
      'Maintain vegetative phase indefinitely for leafy production.'
    ],
    'General': [
      'Monitor GDD to predict harvest windows accurately.',
      'Gradually increase light intensity (PPFD) as plants mature.'
    ]
  },
  climate: {
    'Cannabis': [
      'Lower humidity (<45% RH) in late flower to prevent Botrytis (Bud Rot).',
      'Increase Night Temp slightly if internodal spacing is too large (reduce stretch).',
      'Target high VPD (1.0-1.2) during vegetative growth for fast biomass.'
    ],
    'Vegetable': [
      'High humidity (>85%) can inhibit pollination in tomatoes (clumpy pollen).',
      'Lettuce prefers cooler air temps (<20°C) to remain crisp and sweet.',
      'Consistent moisture prevents blossom end rot/cracking.'
    ],
    'General': [
      'Ensure oscillating airflow prevents micro-climates within the canopy.',
      'If supplementing CO2, raise temperatures to 28-30°C to utilize it.'
    ]
  },
  nutrient: {
    'Cannabis': [
      'Boost P and K levels significantly during weeks 4-7 of flowering.',
      'Flush (lower EC) in the final week to improve flavor profile.',
      'Magnesium demand increases during the stretch phase (Weeks 1-3 of flower).'
    ],
    'Vegetable': [
      'Tomatoes and Peppers are heavy Calcium feeders; ensure Ca > 150ppm.',
      'Leafy greens are salt-sensitive; keep EC below 1.5 mS/cm.',
      'Onions require high Sulfur levels to develop pungency.'
    ],
    'General': [
      'Always mix Micro-nutrients first, then Veg/Bloom base to prevent lockout.',
      'Monitor pH daily as uptake causes drift (Anion vs Cation uptake).'
    ]
  },
  market: {
    'Cannabis': [
      'Focus on "Bag Appeal" (trim quality) to maximize wholesale value.',
      'Fresh Frozen harvests for extraction can save labor on drying/curing.',
      'Test for terpenes; high terpene profiles command premium pricing.'
    ],
    'Vegetable': [
      'Heirloom varieties command 2-3x higher prices than standard hybrids.',
      'Sell "Living Lettuce" (roots attached) for extended shelf life and value.',
      'Time harvests for off-season local markets for best ROI.'
    ],
    'General': [
      'LED lighting has higher CapEx but pays off in OpEx within 18-24 months.',
      'Analyze grams per watt (gpw) after every run to track efficiency.'
    ]
  }
};

// --- COMPONENT: GLOSSARY SECTION ---
export const GlossarySection: React.FC<{ section: SectionId }> = ({ section }) => {
  const terms = GLOSSARY_DATA[section];

  return (
    <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8 mb-12">
      <div className="flex items-center gap-2 mb-6 text-slate-400">
        <BookOpen className="w-5 h-5" />
        <h3 className="text-sm font-bold uppercase tracking-widest">Technical Glossary</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {terms.map((item, idx) => (
          <div key={idx} className="group p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-chloris-200 dark:hover:border-chloris-800 transition-colors">
             <span className="block font-bold text-slate-700 dark:text-slate-200 text-sm mb-2 group-hover:text-chloris-600 dark:group-hover:text-chloris-400 transition-colors">
                {item.term}
             </span>
             <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.def}
             </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- COMPONENT: CROP GUIDE ---
export const CropGuide: React.FC<{ section: SectionId, crop: CropProfile }> = ({ section, crop }) => {
  // Determine category key (Cannabis, Vegetable, Herb, or fallback to General)
  const catKey = crop.category === 'Cannabis' ? 'Cannabis' 
               : ['Vegetable', 'Fruit'].includes(crop.category) ? 'Vegetable'
               : crop.category === 'Herb' ? 'Herb'
               : 'General';

  const steps = RECOMMENDATIONS[section][catKey] || RECOMMENDATIONS[section]['General'];

  return (
    <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
       <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
          <Lightbulb className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-widest">Expert Tips: {crop.name}</h4>
       </div>
       <ul className="space-y-2">
          {steps.map((step, i) => (
             <li key={i} className="flex gap-2 text-xs text-indigo-900 dark:text-indigo-200 leading-snug">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>{step}</span>
             </li>
          ))}
       </ul>
    </div>
  );
};

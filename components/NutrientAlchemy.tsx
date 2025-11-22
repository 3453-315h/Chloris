
import React, { useState, useMemo } from 'react';
import { ArrowLeft, FlaskConical, TestTube, Droplets, AlertTriangle, GitMerge, Waves, Scale, Zap, Sprout, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { CropDatabase } from '../services/cropDatabase';
import { CropProfile, NutrientRange } from '../types';
import { GlossarySection, CropGuide } from './SectionGuide';

interface NutrientAlchemyProps {
  onBack: () => void;
}

// Elemental properties for simulation
interface ElementProps {
    id: string;
    name: string;
    charge: number; // + for cation, - for anion
    atomicWeight: number;
    color: string;
}

const ELEMENTS: Record<string, ElementProps> = {
    'N': { id: 'N', name: 'Nitrogen (NO3)', charge: -1, atomicWeight: 14.01, color: '#3b82f6' },
    'P': { id: 'P', name: 'Phosphorus', charge: -3, atomicWeight: 30.97, color: '#a855f7' },
    'K': { id: 'K', name: 'Potassium', charge: 1, atomicWeight: 39.10, color: '#ef4444' },
    'Ca': { id: 'Ca', name: 'Calcium', charge: 2, atomicWeight: 40.08, color: '#10b981' },
    'Mg': { id: 'Mg', name: 'Magnesium', charge: 2, atomicWeight: 24.31, color: '#f59e0b' },
    'S': { id: 'S', name: 'Sulfur', charge: -2, atomicWeight: 32.06, color: '#eab308' },
    'Fe': { id: 'Fe', name: 'Iron', charge: 2, atomicWeight: 55.85, color: '#78716c' },
};

export const NutrientAlchemy: React.FC<NutrientAlchemyProps> = ({ onBack }) => {
  // --- STATE ---
  const allCrops = useMemo(() => CropDatabase.getAllCrops(), []);
  const [selectedCrop, setSelectedCrop] = useState<CropProfile>(allCrops[0]);
  const [tankVolume, setTankVolume] = useState(50); // Gallons
  
  // Target PPMs (Concentration)
  // Initial state set to generic veg values
  const [ppms, setPpms] = useState({
      N: 150,
      P: 50,
      K: 200,
      Ca: 100,
      Mg: 40,
      S: 60,
      Fe: 2
  });

  // Base Water Config
  const [baseEc, setBaseEc] = useState(0.2); // EC
  const [targetPh, setTargetPh] = useState(5.8);

  // --- CALCULATIONS ---

  // 1. Total EC Estimation (Simple Rule: EC = PPM500 / 500 or Sum of ions)
  // Approximation: sum of PPMs / 500 + BaseEC
  const totalDissolvedSolids = Object.values(ppms).reduce((a, b) => a + b, 0);
  const estimatedEc = (totalDissolvedSolids / 500) + baseEc;
  
  // 2. Ionic Balance (Anions vs Cations)
  // Molarity = PPM / Atomic Weight
  // Equivalent = Molarity * Charge
  const calcCharge = (el: string, ppm: number) => {
      const prop = ELEMENTS[el];
      if (!prop) return 0;
      const molarity = ppm / prop.atomicWeight;
      return molarity * Math.abs(prop.charge); // Absolute charge for magnitude
  };

  const cations = calcCharge('K', ppms.K) + calcCharge('Ca', ppms.Ca) + calcCharge('Mg', ppms.Mg) + calcCharge('Fe', ppms.Fe);
  const anions = calcCharge('N', ppms.N) + calcCharge('P', ppms.P) + calcCharge('S', ppms.S);
  
  const balanceRatio = cations / (anions || 1); // Avoid div by 0
  
  // 3. Mulder's Chart Logic (Antagonisms)
  const antagonisms = [];
  // K vs Mg (Classic)
  if (ppms.K > ppms.Mg * 4) antagonisms.push({ type: 'High', msg: 'High Potassium (K) blocking Magnesium (Mg) uptake.', severity: 'High' });
  // Ca vs Mg
  if (ppms.Ca > ppms.Mg * 4) antagonisms.push({ type: 'High', msg: 'Excess Calcium locking out Magnesium.', severity: 'Med' });
  // P vs Fe
  if (ppms.P > 60 && ppms.Fe < 2) antagonisms.push({ type: 'Lockout', msg: 'High Phosphorus may precipitate Iron.', severity: 'High' });
  // Ca vs S (Gypsum)
  if (ppms.Ca > 150 && ppms.S > 100) antagonisms.push({ type: 'Precip', msg: 'Calcium Sulfate (Gypsum) precipitation risk.', severity: 'Critical' });
  
  // CROP SPECIFIC WARNINGS
  if (selectedCrop.nutrientTargets) {
      // EC Check
      if (estimatedEc > selectedCrop.nutrientTargets.ec.max) {
          antagonisms.push({ 
              type: 'Osmotic', 
              msg: `EC (${estimatedEc.toFixed(1)}) exceeds ${selectedCrop.name} limit (${selectedCrop.nutrientTargets.ec.max}). Root burn likely.`, 
              severity: 'Critical' 
          });
      }
      // Specific Deficiency Checks based on Min Targets
      if (ppms.Ca < selectedCrop.nutrientTargets.Ca.min) {
          antagonisms.push({ type: 'Deficiency', msg: `Low Calcium. ${selectedCrop.name} is prone to tip burn/rot at <${selectedCrop.nutrientTargets.Ca.min}ppm.`, severity: 'High' });
      }
  }

  // 4. Suitability Score (How well does current PPM match Target Crop?)
  const calculateSuitability = () => {
      if (!selectedCrop.nutrientTargets) return 100;
      let score = 100;
      const check = (key: keyof typeof ppms) => {
          // @ts-ignore
          const target = selectedCrop.nutrientTargets[key] as NutrientRange;
          const current = ppms[key];
          if (current < target.min) score -= 10;
          if (current > target.max) score -= 10;
      }
      Object.keys(ppms).forEach(k => check(k as keyof typeof ppms));
      if (estimatedEc > selectedCrop.nutrientTargets.ec.max) score -= 20;
      if (estimatedEc < selectedCrop.nutrientTargets.ec.min) score -= 10;
      return Math.max(0, score);
  }
  const suitabilityScore = calculateSuitability();

  // 5. Chart Data
  const ppmData = Object.entries(ppms).map(([key, val]) => ({
      name: key,
      ppm: val,
      fill: ELEMENTS[key].color
  }));

  const targets = selectedCrop.nutrientTargets || {
      N: {min: 0, max: 0}, P: {min: 0, max: 0}, K: {min: 0, max: 0},
      Ca: {min: 0, max: 0}, Mg: {min: 0, max: 0}, S: {min: 0, max: 0}, Fe: {min: 0, max: 0}
  };

  return (
    <div className="flex h-full w-full bg-slate-50/50 dark:bg-[#040808] text-slate-900 dark:text-slate-100 overflow-hidden relative animate-in fade-in duration-500 font-sans">
      
      {/* LEFT PANEL: CHEM LAB CONTROLS */}
      <div className="w-full lg:w-[380px] bg-white/80 dark:bg-[#0a0c0c]/80 backdrop-blur-md border-r border-slate-200 dark:border-white/5 flex-shrink-0 h-full overflow-y-auto p-6 space-y-8 custom-scrollbar z-20 shadow-xl">
        
        <div className="flex items-center gap-2 text-slate-400 pb-4 border-b border-slate-100 dark:border-white/5">
            <FlaskConical className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Solution Design</h2>
        </div>

        {/* Crop Selection */}
        <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Target Specimen</label>
            <div className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3">
                <select 
                    value={selectedCrop.id}
                    onChange={(e) => {
                        const c = allCrops.find(x => x.id === e.target.value);
                        if (c) setSelectedCrop(c);
                    }}
                    className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 outline-none"
                >
                    {allCrops.map(c => (
                        <option key={c.id} value={c.id} className="text-slate-900">{c.name} ({c.variety})</option>
                    ))}
                </select>
            </div>
            <CropGuide section="nutrient" crop={selectedCrop} />
        </div>

        {/* Macro Sliders */}
        <div className="space-y-6">
            <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest">Macronutrients (PPM)</h3>
            
            <PpmSlider label="Nitrogen (N)" el="N" val={ppms.N} set={setPpms} max={300} color="bg-blue-500" target={targets.N} />
            <PpmSlider label="Phosphorus (P)" el="P" val={ppms.P} set={setPpms} max={150} color="bg-purple-500" target={targets.P} />
            <PpmSlider label="Potassium (K)" el="K" val={ppms.K} set={setPpms} max={400} color="bg-rose-500" target={targets.K} />
        </div>

        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Secondary & Micro</h3>
            
            <PpmSlider label="Calcium (Ca)" el="Ca" val={ppms.Ca} set={setPpms} max={250} color="bg-emerald-500" target={targets.Ca} />
            <PpmSlider label="Magnesium (Mg)" el="Mg" val={ppms.Mg} set={setPpms} max={100} color="bg-amber-500" target={targets.Mg} />
            <PpmSlider label="Sulfur (S)" el="S" val={ppms.S} set={setPpms} max={150} color="bg-yellow-400" target={targets.S} />
            <PpmSlider label="Iron (Fe)" el="Fe" val={ppms.Fe} set={setPpms} max={10} step={0.5} color="bg-stone-500" target={targets.Fe} />
        </div>

        {/* Reservoir Config */}
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reservoir Params</h3>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Volume (Gal)</label>
                    <input type="number" value={tankVolume} onChange={(e) => setTankVolume(Number(e.target.value))} className="w-full mt-1 p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-sm font-mono" />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Base EC</label>
                    <input type="number" step={0.1} value={baseEc} onChange={(e) => setBaseEc(Number(e.target.value))} className="w-full mt-1 p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-sm font-mono" />
                 </div>
             </div>
        </div>
      </div>

      {/* RIGHT PANEL: DASHBOARD */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="h-20 border-b border-slate-200 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-xl flex items-center px-8 justify-between flex-shrink-0 z-20">
            <div className="flex items-center gap-6">
                <button onClick={onBack} className="group w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-chloris-500 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50">
                        <TestTube className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white font-display uppercase">Nutrient Alchemy</h1>
                        <span className="text-[10px] text-slate-500 font-mono">Hydroponic Simulator</span>
                    </div>
                </div>
            </div>

            {/* Suitability Score */}
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <Target className="w-4 h-4 text-slate-400" />
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Crop Fit</span>
                    <span className={`font-bold font-mono text-xs ${suitabilityScore > 80 ? 'text-emerald-500' : suitabilityScore > 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {suitabilityScore}% Match
                    </span>
                </div>
             </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-[#0f172a] custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* ROW 1: EC & Ionic Balance */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* EC Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Electrical Conductivity
                            </h3>
                            <div className="text-5xl font-display font-bold text-slate-900 dark:text-white mb-1">
                                {estimatedEc.toFixed(2)} <span className="text-lg font-normal text-slate-400">mS/cm</span>
                            </div>
                            <span className="text-xs text-slate-500">Estimated Total Dissolved Solids</span>
                        </div>
                        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-slate-500">Strength for {selectedCrop.name}</span>
                                {selectedCrop.nutrientTargets ? (
                                     <span className={`font-bold ${
                                        estimatedEc > selectedCrop.nutrientTargets.ec.max 
                                        ? 'text-rose-500' 
                                        : estimatedEc < selectedCrop.nutrientTargets.ec.min 
                                        ? 'text-amber-500' 
                                        : 'text-emerald-500'
                                    }`}>
                                        {estimatedEc > selectedCrop.nutrientTargets.ec.max 
                                            ? 'Too Hot (Burn Risk)' 
                                            : estimatedEc < selectedCrop.nutrientTargets.ec.min 
                                            ? 'Too Low' 
                                            : 'Optimal Range'}
                                    </span>
                                ) : (
                                    <span className="text-slate-400">No target data</span>
                                )}
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full ${estimatedEc > 2.5 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (estimatedEc/3.5)*100)}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                                <span>Target: {selectedCrop.nutrientTargets?.ec.min} - {selectedCrop.nutrientTargets?.ec.max} mS</span>
                            </div>
                        </div>
                    </div>

                    {/* Ionic Balance Visualizer */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <Scale className="w-4 h-4" /> Cation / Anion Balance
                            </h3>
                            <span className={`text-xs font-mono px-2 py-1 rounded border ${balanceRatio > 1.5 || balanceRatio < 0.5 ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 border-rose-200' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 border-emerald-200'}`}>
                                Ratio: {balanceRatio.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-24 flex rounded-lg overflow-hidden relative">
                                {/* Cations */}
                                <div className="bg-sky-500/20 h-full flex items-center justify-center relative group" style={{ flex: cations }}>
                                    <span className="text-sky-600 dark:text-sky-400 font-bold text-sm z-10">Cations (+)</span>
                                    <div className="absolute inset-0 flex">
                                        <div style={{ width: `${(calcCharge('K', ppms.K)/cations)*100}%` }} className="bg-rose-400 opacity-40 hover:opacity-60 transition-opacity" title="K+"></div>
                                        <div style={{ width: `${(calcCharge('Ca', ppms.Ca)/cations)*100}%` }} className="bg-emerald-400 opacity-40 hover:opacity-60 transition-opacity" title="Ca++"></div>
                                        <div style={{ width: `${(calcCharge('Mg', ppms.Mg)/cations)*100}%` }} className="bg-amber-400 opacity-40 hover:opacity-60 transition-opacity" title="Mg++"></div>
                                    </div>
                                </div>
                                {/* Center Line */}
                                <div className="w-1 bg-slate-900/10 dark:bg-white/10 h-full z-20"></div>
                                {/* Anions */}
                                <div className="bg-pink-500/20 h-full flex items-center justify-center relative group" style={{ flex: anions }}>
                                    <span className="text-pink-600 dark:text-pink-400 font-bold text-sm z-10">Anions (-)</span>
                                    <div className="absolute inset-0 flex">
                                        <div style={{ width: `${(calcCharge('N', ppms.N)/anions)*100}%` }} className="bg-blue-500 opacity-40 hover:opacity-60 transition-opacity" title="NO3-"></div>
                                        <div style={{ width: `${(calcCharge('P', ppms.P)/anions)*100}%` }} className="bg-purple-500 opacity-40 hover:opacity-60 transition-opacity" title="H2PO4-"></div>
                                        <div style={{ width: `${(calcCharge('S', ppms.S)/anions)*100}%` }} className="bg-yellow-400 opacity-40 hover:opacity-60 transition-opacity" title="SO4--"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-3 text-[10px] text-slate-400 uppercase tracking-wide font-bold">
                             <span>Alkalizing Effect (pH Rise)</span>
                             <span>Acidifying Effect (pH Drop)</span>
                        </div>
                    </div>
                </div>

                {/* ROW 2: Charts & Antagonisms */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Elemental Breakdown */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm h-[350px]">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-6">PPM Composition</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={ppmData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#44403c" opacity={0.2} />
                                <XAxis dataKey="name" stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #292524', color: '#fafaf9' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <ReferenceLine y={200} stroke="red" strokeDasharray="3 3" opacity={0.3} label={{ value: "Toxicity", fill: 'red', fontSize: 10 }} />
                                <Bar dataKey="ppm" radius={[4, 4, 0, 0]}>
                                    {ppmData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Mulder's Chart Logic (Antagonisms) */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm overflow-y-auto custom-scrollbar max-h-[350px]">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-2">
                            <GitMerge className="w-4 h-4" /> Interaction Matrix
                        </h3>

                        {antagonisms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                <Waves className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">Balanced Solution</p>
                                <p className="text-xs opacity-60">No significant antagonisms detected.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {antagonisms.map((issue, idx) => (
                                    <div key={idx} className={`p-4 rounded-lg border flex items-start gap-3 ${
                                        issue.severity === 'Critical' 
                                        ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50' 
                                        : issue.severity === 'High'
                                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50'
                                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50'
                                    }`}>
                                        <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                                            issue.severity === 'Critical' ? 'text-rose-500' : issue.severity === 'High' ? 'text-amber-500' : 'text-blue-500'
                                        }`} />
                                        <div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                issue.severity === 'Critical' ? 'text-rose-600' : issue.severity === 'High' ? 'text-amber-600' : 'text-blue-600'
                                            }`}>{issue.type} Risk</span>
                                            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-snug">{issue.msg}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400 leading-relaxed">
                            *Based on Mulder's Chart of antagonistic nutrient relationships. High levels of one element can competitively inhibit uptake of another.
                        </div>
                    </div>

                </div>

                {/* GLOSSARY */}
                <GlossarySection section="nutrient" />

            </div>
        </div>

      </div>
    </div>
  );
};

const PpmSlider = ({ label, el, val, set, max, step = 5, color, target }: any) => {
    // Calculate percentage positions for the "Safe Zone"
    const leftPct = target ? (target.min / max) * 100 : 0;
    const widthPct = target ? ((target.max - target.min) / max) * 100 : 0;
    
    const isLow = target && val < target.min;
    const isHigh = target && val > target.max;

    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
                <div className="flex items-center gap-2">
                    {target && (
                        <span className="text-[9px] text-slate-400 font-mono">
                            Target: {target.min}-{target.max}
                        </span>
                    )}
                    <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded text-white transition-colors ${
                        isLow ? 'bg-amber-500' : isHigh ? 'bg-rose-500' : color
                    }`}>
                        {val} ppm
                    </span>
                </div>
            </div>
            
            <div className="relative w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg">
                {/* Target Zone Indicator */}
                {target && widthPct > 0 && (
                    <div 
                        className="absolute top-0 h-full bg-emerald-500/30 dark:bg-emerald-400/20 pointer-events-none"
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        title="Ideal Range"
                    ></div>
                )}

                <input 
                    type="range" min={0} max={max} step={step} 
                    value={val}
                    onChange={(e) => {
                        const newVal = Number(e.target.value);
                        set((prev: any) => ({ ...prev, [el]: newVal }));
                    }}
                    className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer z-10"
                />
                
                {/* Custom Thumb/Track representation could go here if not using opacity trick, 
                    but standard range input + background div works well for 'zones' */}
                <div 
                    className={`absolute top-0 left-0 h-full rounded-l-lg pointer-events-none opacity-50 ${color}`} 
                    style={{ width: `${(val / max) * 100}%` }}
                ></div>
                <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow border border-slate-200 pointer-events-none transition-all"
                    style={{ left: `calc(${(val / max) * 100}% - 8px)` }}
                ></div>
            </div>
        </div>
    )
}

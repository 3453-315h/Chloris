
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, DollarSign, TrendingUp, Scale, Zap, Sprout, Calculator, BarChart3, PieChart, Boxes, RefreshCw, AreaChart, Coins } from 'lucide-react';
import { CropDatabase, DEFAULT_CROP_ID } from '../services/cropDatabase';
import { CropProfile } from '../types';
import { GlossarySection, CropGuide } from './SectionGuide';

interface MarketYieldsProps {
  onBack: () => void;
}

// Types for our local calculation logic
type YieldType = 'Biomass (g/m²)' | 'Fruiting (kg/plant)' | 'Units (heads)';

interface YieldMetric {
    type: YieldType;
    baseYield: number; // The raw number based on the type
    density?: number; // Plants per m² (if applicable)
    marketUnit: 'lb' | 'kg' | 'oz' | 'unit';
    defaultPrice: number;
}

// Mapped from yields.md
const CROP_ECONOMICS: Record<string, YieldMetric> = {
    // Cannabis
    'Cannabis (Indica)': { type: 'Biomass (g/m²)', baseYield: 550, marketUnit: 'lb', defaultPrice: 1800 },
    'Cannabis (Sativa)': { type: 'Biomass (g/m²)', baseYield: 450, marketUnit: 'lb', defaultPrice: 1800 },
    'Cannabis (Hybrid)': { type: 'Biomass (g/m²)', baseYield: 600, marketUnit: 'lb', defaultPrice: 1600 },
    'Cannabis (Autoflower)': { type: 'Biomass (g/m²)', baseYield: 400, marketUnit: 'lb', defaultPrice: 1200 },
    
    // Fruiting Veg
    'Tomato': { type: 'Fruiting (kg/plant)', baseYield: 8, density: 2.5, marketUnit: 'lb', defaultPrice: 2.50 },
    'Pepper (Bell)': { type: 'Fruiting (kg/plant)', baseYield: 3, density: 3.5, marketUnit: 'unit', defaultPrice: 1.25 },
    
    // Greens
    'Lettuce': { type: 'Units (heads)', baseYield: 1, density: 14, marketUnit: 'unit', defaultPrice: 2.50 },
    'Onion': { type: 'Units (heads)', baseYield: 1, density: 25, marketUnit: 'lb', defaultPrice: 1.50 }
};

// Helper to resolve specific crop to economics profile
const getEconomics = (crop: CropProfile): YieldMetric => {
    if (crop.category === 'Cannabis') return CROP_ECONOMICS[crop.name] || CROP_ECONOMICS['Cannabis (Hybrid)'];
    if (crop.name.includes('Tomato')) return CROP_ECONOMICS['Tomato'];
    if (crop.name.includes('Pepper')) return CROP_ECONOMICS['Pepper (Bell)'];
    if (crop.name.includes('Lettuce')) return CROP_ECONOMICS['Lettuce'];
    return { type: 'Biomass (g/m²)', baseYield: 100, marketUnit: 'kg', defaultPrice: 5 }; // Fallback
};

export const MarketYields: React.FC<MarketYieldsProps> = ({ onBack }) => {
  const allCrops = useMemo(() => CropDatabase.getAllCrops(), []);
  const [selectedCrop, setSelectedCrop] = useState<CropProfile>(allCrops[0]);
  
  // --- INPUT STATE ---
  // Facility
  const [roomL, setRoomL] = useState(12);
  const [roomW, setRoomW] = useState(10);
  const [watts, setWatts] = useState(1200);
  
  // Economics
  const [energyCost, setEnergyCost] = useState(0.14); // $/kWh
  const [marketPrice, setMarketPrice] = useState(0); // Set in useEffect based on crop

  // Set default price when crop changes
  useEffect(() => {
    const eco = getEconomics(selectedCrop);
    setMarketPrice(eco.defaultPrice);
  }, [selectedCrop]);

  // --- CALCULATIONS ---
  
  // 1. Facility Physics
  const areaSqFt = roomL * roomW;
  const areaM2 = areaSqFt * 0.092903;
  const canopyM2 = areaM2 * 0.8; // 80% utilization
  
  // 2. OpEx (Energy)
  // Assume HVAC is ~30% overhead of lighting watts for cooling calculation in simple mode
  const totalSystemWatts = watts * 1.3; 
  const hoursPerDay = selectedCrop.photoperiodConfig?.criticalDayLength || 12; // Approx average
  const cycleDays = selectedCrop.expectedMaturityDays + 14; // +14 days for veg/dry
  
  const totalKwh = (totalSystemWatts / 1000) * hoursPerDay * cycleDays;
  const estimatedOpEx = totalKwh * energyCost;

  // 3. Yield & Revenue
  const ecoProfile = getEconomics(selectedCrop);
  
  let estimatedHarvestMass = 0; // in grams or units
  let yieldDisplay = "";
  
  if (ecoProfile.type === 'Biomass (g/m²)') {
      estimatedHarvestMass = canopyM2 * ecoProfile.baseYield; // Total grams
      yieldDisplay = `${(estimatedHarvestMass / 453.592).toFixed(1)} lbs`;
  } else if (ecoProfile.type === 'Fruiting (kg/plant)') {
      const plantCount = Math.floor(canopyM2 * (ecoProfile.density || 2));
      const totalKg = plantCount * ecoProfile.baseYield;
      estimatedHarvestMass = totalKg * 1000; // Convert to g for normalization
      yieldDisplay = `${totalKg.toFixed(1)} kg (${plantCount} plants)`;
  } else {
      const plantCount = Math.floor(canopyM2 * (ecoProfile.density || 10));
      estimatedHarvestMass = plantCount; // Units
      yieldDisplay = `${plantCount} heads`;
  }

  // Revenue Calc
  let grossRevenue = 0;
  if (ecoProfile.marketUnit === 'lb') {
      const lbs = estimatedHarvestMass / 453.592; // Convert g to lb (or if mass is already units, this breaks, handle below)
      // For Onions (units) sold by LB, we need weight per unit. 
      // yields.md says onions are 250g-400g. Let's assume average weight if type is Unit but market is Mass.
      // For simplicity here:
      if (ecoProfile.type === 'Biomass (g/m²)') {
         grossRevenue = lbs * marketPrice;
      } else if (ecoProfile.type === 'Fruiting (kg/plant)') {
         // Sold by lb
         grossRevenue = (estimatedHarvestMass / 453.592) * marketPrice;
      } else {
         // Onions (Unit -> Lb)? Let's assume 0.3kg per onion
         const totalLbs = (estimatedHarvestMass * 0.3 * 2.20462);
         grossRevenue = totalLbs * marketPrice;
      }
  } else if (ecoProfile.marketUnit === 'unit') {
      grossRevenue = estimatedHarvestMass * marketPrice; // Mass is count here
  } else if (ecoProfile.marketUnit === 'kg') {
      grossRevenue = (estimatedHarvestMass / 1000) * marketPrice;
  }

  const netProfit = grossRevenue - estimatedOpEx;
  const roi = estimatedOpEx > 0 ? (netProfit / estimatedOpEx) * 100 : 0;

  // Efficiency Metrics
  const gramsPerWatt = ecoProfile.type === 'Biomass (g/m²)' ? (estimatedHarvestMass / watts).toFixed(2) : 'N/A';

  return (
    <div className="flex h-full w-full bg-slate-50/50 dark:bg-[#040808] text-slate-900 dark:text-slate-100 overflow-hidden relative animate-in fade-in duration-500 font-sans">
      
      {/* LEFT PANEL: CONFIGURATION */}
      <div className="w-full lg:w-[380px] bg-white/80 dark:bg-[#0a0c0c]/80 backdrop-blur-md border-r border-slate-200 dark:border-white/5 flex-shrink-0 h-full overflow-y-auto p-6 space-y-8 custom-scrollbar z-20 shadow-xl shadow-slate-200/50 dark:shadow-none">
        
        {/* Header */}
        <div className="flex items-center gap-2 text-slate-400 pb-4 border-b border-slate-100 dark:border-white/5">
            <Coins className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Economics & Ops</h2>
        </div>

        {/* Crop Selector */}
        <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Crop Model</label>
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
            <CropGuide section="market" crop={selectedCrop} />
        </div>

        {/* Facility Specs */}
        <div className="space-y-6 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Boxes className="w-4 h-4" /> Production Facility
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
                <NumberInput label="Length (ft)" value={roomL} onChange={setRoomL} />
                <NumberInput label="Width (ft)" value={roomW} onChange={setRoomW} />
            </div>
            
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lighting Power</label>
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">{watts} W</span>
                </div>
                <input 
                    type="range" min="200" max="5000" step="100"
                    value={watts}
                    onChange={(e) => setWatts(parseFloat(e.target.value))}
                    className="w-full"
                />
            </div>
        </div>

        {/* Financial Inputs */}
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Market Inputs
            </h3>
            
            <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Energy Cost ($/kWh)</label>
                </div>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                    <input 
                        type="number" 
                        value={energyCost}
                        step={0.01}
                        onChange={(e) => setEnergyCost(parseFloat(e.target.value))}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-7 pr-4 py-2 text-sm font-mono"
                    />
                </div>
            </div>

             <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Market Price ($/{ecoProfile.marketUnit})</label>
                </div>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                    <input 
                        type="number" 
                        value={marketPrice}
                        onChange={(e) => setMarketPrice(parseFloat(e.target.value))}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-7 pr-4 py-2 text-sm font-mono"
                    />
                </div>
            </div>
        </div>
      </div>

      {/* RIGHT PANEL: DASHBOARD */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="h-20 border-b border-slate-200 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-xl flex items-center px-8 justify-between flex-shrink-0 z-20">
             <div className="flex items-center gap-6">
                <button 
                  onClick={onBack}
                  className="group flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-chloris-500/50 hover:text-chloris-500 transition-all shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-white dark:from-amber-900 dark:to-black flex items-center justify-center border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 shadow-sm">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white font-display uppercase">Market Analytics</h1>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Yield & ROI Projector</span>
                    </div>
                </div>
             </div>
        </header>

        {/* Mock Ticker Tape */}
        <div className="bg-slate-900 text-white py-1 overflow-hidden flex-shrink-0 border-b border-slate-800">
            <div className="flex gap-8 animate-float whitespace-nowrap text-[10px] font-mono tracking-wider px-4">
                <span className="flex items-center gap-1">CANNABIS_IDX <span className="text-emerald-400">▲ $1,450/lb</span></span>
                <span className="flex items-center gap-1 text-slate-500">|</span>
                <span className="flex items-center gap-1">TOMATO_US <span className="text-emerald-400">▲ $2.85/lb</span></span>
                <span className="flex items-center gap-1 text-slate-500">|</span>
                <span className="flex items-center gap-1">ENERGY_AVG <span className="text-rose-400">▲ $0.16/kWh</span></span>
                <span className="flex items-center gap-1 text-slate-500">|</span>
                <span className="flex items-center gap-1">PEPPER_WHL <span className="text-emerald-400">▲ $1.40/ea</span></span>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-[#0f172a] transition-colors custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* TOP ROW: KPIS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard 
                        label="Projected Harvest"
                        value={yieldDisplay}
                        icon={<Scale className="w-4 h-4" />}
                        trend="Based on ideal conditions"
                        color="text-blue-500"
                    />
                    <KpiCard 
                        label="Gross Revenue"
                        value={`$${grossRevenue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`}
                        icon={<TrendingUp className="w-4 h-4" />}
                        trend="Per Cycle"
                        color="text-emerald-500"
                    />
                    <KpiCard 
                        label="Operational Ex."
                        value={`$${estimatedOpEx.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`}
                        icon={<Zap className="w-4 h-4" />}
                        trend={`${totalKwh.toFixed(0)} kWh total`}
                        color="text-amber-500"
                    />
                    <KpiCard 
                        label="Net Profit"
                        value={`$${netProfit.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`}
                        icon={<DollarSign className="w-4 h-4" />}
                        trend={`${roi.toFixed(1)}% ROI`}
                        color={netProfit > 0 ? "text-indigo-500" : "text-rose-500"}
                    />
                </div>

                {/* MIDDLE ROW: DETAILED VISUALS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* REVENUE BREAKDOWN CHART (Visual Bar) */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Financial Composition</h3>
                            <span className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">Per Harvest Cycle</span>
                        </div>
                        
                        {/* Stacked Bar Visualization */}
                        <div className="relative pt-6 pb-2">
                             <div className="flex h-16 rounded-lg overflow-hidden shadow-inner w-full">
                                 <div className="bg-rose-400/80 relative group transition-all duration-500 flex items-center justify-center" style={{ width: `${(estimatedOpEx / grossRevenue * 100)}%`, minWidth: '5%' }}>
                                     <span className="text-xs font-bold text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">OpEx</span>
                                 </div>
                                 <div className="bg-emerald-500 relative group transition-all duration-500 flex items-center justify-center" style={{ flex: 1 }}>
                                     <span className="text-xs font-bold text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">Profit</span>
                                 </div>
                             </div>

                             {/* Legend/Labels */}
                             <div className="flex justify-between mt-4 text-xs text-slate-500">
                                 <div className="text-left">
                                     <span className="block font-bold text-rose-500">Cost Basis ({((estimatedOpEx / grossRevenue) * 100).toFixed(1)}%)</span>
                                     <span className="font-mono text-[10px] opacity-70">Energy, Nutrients (est), Labor (est)</span>
                                 </div>
                                 <div className="text-right">
                                     <span className="block font-bold text-emerald-500">Profit Margin ({((netProfit / grossRevenue) * 100).toFixed(1)}%)</span>
                                     <span className="font-mono text-[10px] opacity-70">Net Earnings</span>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* EFFICIENCY GAUGE */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
                         <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 w-full text-left">System Efficiency</h3>
                         
                         <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                             <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-700 rounded-full"></div>
                             <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent border-l-transparent rotate-45"></div>
                             <div className="flex flex-col">
                                 <span className="text-3xl font-display font-bold text-slate-900 dark:text-white">{gramsPerWatt}</span>
                                 <span className="text-[10px] text-slate-400 uppercase">g/Watt</span>
                             </div>
                         </div>
                         
                         <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                             {gramsPerWatt !== 'N/A' && parseFloat(gramsPerWatt) > 1.2 
                                ? "High Efficiency. System is optimized for maximum biomass production per energy unit."
                                : "Moderate Efficiency. Consider increasing CO₂ or optimizing spectrum to improve conversion."
                             }
                         </p>
                    </div>
                </div>

                {/* BOTTOM ROW: DETAILS TABLE */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                     <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Assumptions & Parameters</h3>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-700/50 text-xs text-slate-600 dark:text-slate-300">
                         <div className="p-4">
                             <span className="block text-[10px] uppercase text-slate-400 mb-1">Canopy Area</span>
                             <span className="font-mono font-medium">{canopyM2.toFixed(1)} m² ({(canopyM2 * 10.764).toFixed(0)} sqft)</span>
                         </div>
                         <div className="p-4">
                             <span className="block text-[10px] uppercase text-slate-400 mb-1">Cycle Duration</span>
                             <span className="font-mono font-medium">{cycleDays} Days</span>
                         </div>
                         <div className="p-4">
                             <span className="block text-[10px] uppercase text-slate-400 mb-1">Avg Power Draw</span>
                             <span className="font-mono font-medium">{totalSystemWatts.toLocaleString()} W (System)</span>
                         </div>
                         <div className="p-4">
                             <span className="block text-[10px] uppercase text-slate-400 mb-1">Base Yield Est</span>
                             <span className="font-mono font-medium">{ecoProfile.baseYield} {ecoProfile.type.split(' ')[1]}</span>
                         </div>
                     </div>
                </div>

                {/* GLOSSARY */}
                <GlossarySection section="market" />

            </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const KpiCard = ({ label, value, icon, trend, color }: any) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
        <div className={`flex items-center gap-2 ${color} mb-3`}>
            {icon}
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        </div>
        <div className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">
            {value}
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            {trend}
        </div>
    </div>
);

const NumberInput = ({ label, value, onChange }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase">{label}</label>
        <input 
            type="number" 
            value={value} 
            onChange={(e) => onChange(parseFloat(e.target.value))} 
            className="w-full p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-mono font-medium outline-none focus:border-chloris-500 transition-colors"
        />
    </div>
);

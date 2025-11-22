
import React, { useState, useMemo } from 'react';
import { ArrowLeft, CloudSun, Wind, Thermometer, Droplets, Maximize, Zap, Activity, Sparkles, FlaskConical, Settings2, Info, Leaf } from 'lucide-react';
import { CropDatabase } from '../services/cropDatabase';
import { ChlorisIcon } from './ChlorisIcon';
import { GlossarySection, CropGuide } from './SectionGuide';

interface ClimateLabProps {
  onBack: () => void;
}

export const ClimateLab: React.FC<ClimateLabProps> = ({ onBack }) => {
  // Room Dimensions State
  const [roomDims, setRoomDims] = useState({ l: 12, w: 10, h: 9 }); // Feet
  const [lightingWatts, setLightingWatts] = useState(1200); // Watts
  
  // Environment State
  const [temp, setTemp] = useState(26); // Celsius
  const [rh, setRh] = useState(60); // %
  const [co2, setCo2] = useState(800); // ppm
  const [leafTempOffset, setLeafTempOffset] = useState(-1.5); // Celsius

  // Selected Crop for Targets
  const allCrops = useMemo(() => CropDatabase.getAllCrops(), []);
  const [selectedCrop, setSelectedCrop] = useState(allCrops[0]);

  // --- CALCULATIONS ---

  // 1. VPD Calculation
  const calculateSVP = (T: number) => 0.61078 * Math.exp((17.27 * T) / (T + 237.3));
  const svpAir = calculateSVP(temp);
  const avpAir = svpAir * (rh / 100);
  const svpLeaf = calculateSVP(temp + leafTempOffset);
  const vpd = svpLeaf - avpAir;
  const vpdValue = parseFloat(vpd.toFixed(2));

  // 2. HVAC Calculations
  const roomVolume = roomDims.l * roomDims.w * roomDims.h;
  const lightBTU = lightingWatts * 3.412;
  const totalCoolingBTU = lightBTU * 1.25; 
  const coolingTonnage = parseFloat((totalCoolingBTU / 12000).toFixed(2));

  // 3. Airflow (CFM)
  const cfmStandard = Math.round(roomVolume / 3); // 3 mins
  const cfmAggressive = Math.round(roomVolume / 1); // 1 min

  // --- STATUS CHECKS ---
  const targetVPD = selectedCrop.vpdRange || { min: 0.8, max: 1.2 };
  let vpdStatus = "Optimal";
  let vpdColor = "text-chloris-600 dark:text-chloris-400";
  let vpdBg = "bg-chloris-50 dark:bg-chloris-900/20";
  
  if (vpdValue < targetVPD.min) {
    vpdStatus = "Risk: Mold / PM";
    vpdColor = "text-sky-500";
    vpdBg = "bg-sky-50 dark:bg-sky-900/20";
  } else if (vpdValue > targetVPD.max) {
    vpdStatus = "Risk: Wilting";
    vpdColor = "text-amber-500";
    vpdBg = "bg-amber-50 dark:bg-amber-900/20";
  }

  // CO2 Status & Photosynthetic Potential
  const normalizedCo2 = Math.min(2000, Math.max(300, co2));
  // Simple heuristic: 400ppm = 1.0x, 1200ppm = ~1.4x (diminishing returns)
  const photoPotential = 1 + (0.5 * (1 - Math.exp(-(normalizedCo2 - 400) / 600)));
  const potentialPercent = Math.min(100, Math.max(0, (photoPotential - 1) / 0.5 * 100));

  return (
    <div className="flex h-full w-full bg-slate-50/50 dark:bg-[#040808] text-slate-900 dark:text-slate-100 overflow-hidden relative animate-in fade-in duration-500 font-sans">
      
      {/* LEFT SIDEBAR: CONTROLS (Matched Style to InputPanel) */}
      <div className="w-full lg:w-[380px] bg-white/80 dark:bg-[#0a0c0c]/80 backdrop-blur-md border-r border-slate-200 dark:border-white/5 flex-shrink-0 h-full overflow-y-auto p-6 space-y-8 custom-scrollbar z-20 shadow-xl shadow-slate-200/50 dark:shadow-none">
        
        {/* Header */}
        <div className="flex items-center gap-2 text-slate-400 pb-4 border-b border-slate-100 dark:border-white/5">
            <Settings2 className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Parameters</h2>
        </div>

        {/* Subject Selection */}
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
                <div className="mt-2 flex gap-2 text-[10px] text-slate-500 font-mono">
                    <span>Target VPD: {targetVPD.min}-{targetVPD.max}</span>
                    <span>•</span>
                    <span>CO₂ Max: {selectedCrop.co2Range?.max || 1000}</span>
                </div>
            </div>
            <CropGuide section="climate" crop={selectedCrop} />
        </div>

        {/* Psychrometrics */}
        <div className="space-y-6 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Thermometer className="w-4 h-4" /> Psychrometrics
            </h3>
            
            <ControlInput 
                label="Air Temperature" 
                value={temp} 
                unit="°C" 
                min={10} max={40} step={0.5} 
                onChange={setTemp} 
            />
            <ControlInput 
                label="Relative Humidity" 
                value={rh} 
                unit="%" 
                min={20} max={95} step={1} 
                onChange={setRh} 
            />
            <ControlInput 
                label="Leaf Temp Offset" 
                value={leafTempOffset} 
                unit="°C" 
                min={-5} max={2} step={0.1} 
                onChange={setLeafTempOffset}
                info="Leaf surface temp relative to air." 
            />
        </div>

        {/* Atmosphere */}
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FlaskConical className="w-4 h-4" /> Atmosphere
            </h3>
            
            <ControlInput 
                label="CO₂ Concentration" 
                value={co2} 
                unit="ppm" 
                min={300} max={2000} step={50} 
                onChange={setCo2} 
            />
        </div>

        {/* Facility */}
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Maximize className="w-4 h-4" /> Facility Specs
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
                <NumberInput label="Length (ft)" value={roomDims.l} onChange={(v) => setRoomDims({...roomDims, l: v})} />
                <NumberInput label="Width (ft)" value={roomDims.w} onChange={(v) => setRoomDims({...roomDims, w: v})} />
                <NumberInput label="Height (ft)" value={roomDims.h} onChange={(v) => setRoomDims({...roomDims, h: v})} />
            </div>

            <ControlInput 
                label="Lighting Power" 
                value={lightingWatts} 
                unit="W" 
                min={0} max={5000} step={100} 
                onChange={setLightingWatts} 
            />
        </div>
      </div>

      {/* RIGHT AREA: DASHBOARD */}
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-white dark:from-sky-900 dark:to-black flex items-center justify-center border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 shadow-sm">
                        <CloudSun className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white font-display uppercase">Climate Lab</h1>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Physics Engine</span>
                    </div>
                </div>
            </div>
        </header>

        {/* Main Content Scroller */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-[#0f172a] transition-colors custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* ROW 1: VPD & Carbon */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* VPD CARD */}
                    <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <Activity className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Vapor Pressure Deficit</span>
                                </div>
                                <h2 className="text-5xl font-display font-bold text-slate-900 dark:text-white mt-2">
                                    {vpdValue} <span className="text-xl text-slate-400 font-normal">kPa</span>
                                </h2>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg ${vpdBg} border border-current border-opacity-20`}>
                                <span className={`text-xs font-bold uppercase tracking-wide ${vpdColor}`}>{vpdStatus}</span>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 relative z-10">
                            <div className="flex-1 space-y-4">
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Current conditions indicate {vpdStatus.toLowerCase()}. 
                                    Target range for {selectedCrop.name} is <strong className="text-slate-800 dark:text-slate-200">{targetVPD.min} - {targetVPD.max} kPa</strong>.
                                    Adjust Temp or RH to align.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                        <span className="text-[10px] uppercase text-slate-400 font-bold">Leaf Temp</span>
                                        <div className="text-lg font-mono font-medium text-slate-700 dark:text-slate-200">{(temp + leafTempOffset).toFixed(1)}°C</div>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                        <span className="text-[10px] uppercase text-slate-400 font-bold">Leaf SVP</span>
                                        <div className="text-lg font-mono font-medium text-slate-700 dark:text-slate-200">{svpLeaf.toFixed(2)} kPa</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Interactive Heatmap */}
                            <div className="flex-shrink-0">
                                <VPDHeatmap temp={temp} rh={rh} target={targetVPD} leafOffset={leafTempOffset} />
                            </div>
                        </div>
                    </div>

                    {/* CARBON CARD */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-6 opacity-5">
                            <FlaskConical className="w-32 h-32" />
                         </div>
                         
                         <div className="relative z-10">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 mb-4">
                                <Leaf className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Carbon Dynamics</span>
                            </div>
                            
                            <div className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-1">
                                {photoPotential.toFixed(2)}x
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-6">Photosynthetic Multiplier</span>

                            <div className="space-y-4">
                                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000" 
                                        style={{ width: `${potentialPercent}%` }}
                                    ></div>
                                </div>
                                
                                {photoPotential > 1.1 ? (
                                    <div className="flex gap-3 items-start p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                                        <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-snug">
                                            Enriched CO₂ is boosting Rubisco carboxylation efficiency by <strong>{((photoPotential - 1) * 100).toFixed(0)}%</strong>.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-slate-500 leading-snug">
                                            Standard atmospheric growth rates apply. Increase CO₂ to boost yield potential.
                                        </p>
                                    </div>
                                )}
                            </div>
                         </div>
                    </div>
                </div>

                {/* ROW 2: Engineering Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* HVAC */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <div className="flex items-center gap-2 text-amber-500 mb-6">
                            <Zap className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Thermal Load & Cooling</span>
                        </div>
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <span className="block text-3xl font-bold text-slate-900 dark:text-white">{coolingTonnage}</span>
                                <span className="text-xs text-slate-500 uppercase tracking-wider">Tons Required</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-xl font-bold text-rose-500">{Math.round(totalCoolingBTU).toLocaleString()}</span>
                                <span className="text-xs text-slate-500 uppercase tracking-wider">Total BTU/hr</span>
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 h-px"></div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-500">
                             <div>Sensible Heat: <span className="font-mono text-slate-700 dark:text-slate-300">{Math.round(lightBTU).toLocaleString()} BTU</span></div>
                             <div>Safety Factor: <span className="font-mono text-slate-700 dark:text-slate-300">1.25x</span></div>
                        </div>
                    </div>

                    {/* Airflow */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <div className="flex items-center gap-2 text-indigo-500 mb-6">
                            <Wind className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Air Exchange Requirement</span>
                        </div>
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <span className="block text-3xl font-bold text-slate-900 dark:text-white">{cfmStandard}</span>
                                <span className="text-xs text-slate-500 uppercase tracking-wider">CFM (Standard)</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-xl font-bold text-indigo-500">{cfmAggressive}</span>
                                <span className="text-xs text-slate-500 uppercase tracking-wider">CFM (High Heat)</span>
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: '65%' }}></div>
                        </div>
                        <div className="mt-4 text-xs text-slate-400">
                            Based on room volume of <span className="font-mono text-slate-600 dark:text-slate-300">{roomVolume} ft³</span>. Standard assumes 3-min exchange.
                        </div>
                    </div>
                </div>

                {/* GLOSSARY */}
                <GlossarySection section="climate" />

            </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS (Styled to match InputPanel/Dashboard) ---

const ControlInput = ({ label, value, unit, min, max, step, onChange, info }: any) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
            <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">
                {value} {unit}
            </span>
        </div>
        {/* Using standard slider to match InputPanel */}
        <input 
            type="range" min={min} max={max} step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full"
        />
        {info && <p className="text-[10px] text-slate-400">{info}</p>}
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

const VPDHeatmap = ({ temp, rh, target, leafOffset }: { temp: number, rh: number, target: {min: number, max: number}, leafOffset: number }) => {
    const tSteps = [-4, -2, 0, 2, 4]; 
    const rhSteps = [10, 5, 0, -5, -10];

    const calcVPD = (t: number, r: number) => {
        const svp = 0.61078 * Math.exp((17.27 * (t + leafOffset)) / (t + leafOffset + 237.3));
        const svpAir = 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
        return Math.max(0, svp - (svpAir * (r / 100)));
    };

    return (
        <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-slate-100 dark:border-white/5">
            <div className="flex justify-between mb-2 text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                <span>RH (Y)</span>
                <span>Temp (X)</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
                {rhSteps.map((rhDev, y) => 
                    tSteps.map((tDev, x) => {
                        const cellT = temp + tDev;
                        const cellRH = Math.min(99, Math.max(10, rh + rhDev));
                        const v = calcVPD(cellT, cellRH);
                        
                        let bg = "bg-slate-200 dark:bg-white/5";
                        if (v >= target.min && v <= target.max) bg = "bg-emerald-400 dark:bg-emerald-500";
                        else if (v < target.min) bg = "bg-sky-300 dark:bg-sky-500/50"; 
                        else if (v > target.max) bg = "bg-amber-300 dark:bg-amber-500/50"; 
                        
                        const isCenter = x === 2 && y === 2;

                        return (
                            <div 
                                key={`${x}-${y}`} 
                                className={`w-6 h-6 rounded-sm ${bg} flex items-center justify-center text-[8px] font-mono transition-transform hover:scale-125 relative ${isCenter ? 'ring-2 ring-white dark:ring-white/50 z-10' : ''}`}
                                title={`VPD:${v.toFixed(2)}`}
                            >
                                {isCenter && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                            </div>
                        )
                    })
                )}
            </div>
            <div className="mt-2 text-center text-[9px] text-slate-400">
                Grid: ±4°C / ±10% RH
            </div>
        </div>
    )
}

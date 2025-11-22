
import React, { useState, useMemo } from 'react';
import { CropProfile, ClimateConfig } from '../types';
import { CropDatabase } from '../services/cropDatabase';
import { Thermometer, Sun, Wind, Sprout, Calendar, Search, Filter, Info, Droplets, ChevronRight, SlidersHorizontal, Beaker, Lock, Unlock, AlertTriangle, MapPin, Leaf, Flower } from 'lucide-react';
import { toF, toC, formatTemp } from '../utils/units';

interface InputPanelProps {
  crop: CropProfile;
  setCrop: (c: CropProfile) => void;
  climate: ClimateConfig;
  setClimate: React.Dispatch<React.SetStateAction<ClimateConfig>>;
  startDate: string;
  setStartDate: (d: string) => void;
  onSimulate: () => void;
  isLoading: boolean;
  isImperial: boolean;
  setIsImperial: (v: boolean) => void;
}

// Quick Presets Data
const PRESETS = [
  { id: 'seedling', label: 'Seedling', icon: Sprout, config: { temperatureDay: 22, temperatureNight: 20, humidity: 70, ppfd: 250, photoperiod: 18 } },
  { id: 'veg', label: 'Vegetative', icon: Leaf, config: { temperatureDay: 26, temperatureNight: 22, humidity: 60, ppfd: 600, photoperiod: 18 } },
  { id: 'flower', label: 'Generative', icon: Flower, config: { temperatureDay: 24, temperatureNight: 20, humidity: 45, ppfd: 900, photoperiod: 12 } },
];

// Simplified USDA Zones (Sets Avg Growing Temp)
const ZONES = [
  { id: '3', label: 'Zone 3 (Cold)', day: 18, night: 10 },
  { id: '5', label: 'Zone 5 (Mild)', day: 22, night: 14 },
  { id: '7', label: 'Zone 7 (Warm)', day: 26, night: 18 },
  { id: '9', label: 'Zone 9 (Hot)', day: 30, night: 22 },
];

export const InputPanel: React.FC<InputPanelProps> = ({
  crop,
  setCrop,
  climate,
  setClimate,
  startDate,
  setStartDate,
  onSimulate,
  isLoading,
  isImperial,
  setIsImperial
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const handleClimateChange = (key: keyof ClimateConfig, value: number) => {
    setClimate(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (config: Partial<ClimateConfig>) => {
    setClimate(prev => ({ ...prev, ...config }));
  };

  // Calculate DLI for real-time feedback
  const currentDLI = ((climate.ppfd * climate.photoperiod * 3600) / 1000000).toFixed(1);
  const dliNum = parseFloat(currentDLI);
  const isDLILow = dliNum < crop.minDLI;
  const isDLIGood = dliNum >= crop.optimalDLI;
  const isDLIDanger = dliNum > 65;

  // Validation warnings
  const warnings = [];
  if (isDLIDanger) warnings.push({ msg: "Light Stress: DLI > 65 can cause bleaching.", type: "danger" });
  if (climate.temperatureDay < climate.temperatureNight) warnings.push({ msg: "Negative DIF: May inhibit stem elongation.", type: "info" });
  if (climate.temperatureDay < 10) warnings.push({ msg: "Cold Stress: Metabolic stalls likely.", type: "warning" });

  // Filter crops based on search and category
  const filteredCrops = useMemo(() => {
    let results = CropDatabase.getAllCrops();
    
    if (activeCategory !== 'All') {
        results = results.filter(c => c.category === activeCategory);
    }

    if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        results = results.filter(c => 
            c.name.toLowerCase().includes(lower) || 
            c.variety.toLowerCase().includes(lower)
        );
    }
    return results;
  }, [searchQuery, activeCategory]);

  const categories = ['All', 'Cannabis', 'Vegetable', 'Fruit', 'Herb', 'Flower'];

  // Logic for Biological Constraints Visualization
  const criticalDL = crop.photoperiodConfig?.criticalDayLength || 0;
  const isShortDay = crop.type === 'Short-Day';
  const isLongDay = crop.type === 'Long-Day';
  const isAuto = crop.type === 'Day-Neutral';
  
  let floweringStatus = "Neutral";
  let statusColor = "text-slate-500";
  let statusBg = "bg-slate-100 dark:bg-white/10";

  if (isShortDay) {
      if (climate.photoperiod < criticalDL) {
          floweringStatus = "Flowering Triggered";
          statusColor = "text-emerald-500";
          statusBg = "bg-emerald-50 dark:bg-emerald-900/20";
      } else {
          floweringStatus = "Vegetative Lock";
          statusColor = "text-blue-500";
          statusBg = "bg-blue-50 dark:bg-blue-900/20";
      }
  } else if (isLongDay) {
      if (climate.photoperiod > criticalDL) {
          floweringStatus = "Flowering Triggered";
          statusColor = "text-emerald-500";
          statusBg = "bg-emerald-50 dark:bg-emerald-900/20";
      } else {
          floweringStatus = "Vegetative Lock";
          statusColor = "text-blue-500";
          statusBg = "bg-blue-50 dark:bg-blue-900/20";
      }
  }

  // CO2 Logic
  const co2Max = crop.co2Range?.max || 1000;
  const isCo2High = climate.co2 > co2Max;

  // Temp handlers for slider
  const getDisplayTemp = (c: number) => isImperial ? toF(c) : c;
  const handleSliderTemp = (key: 'temperatureDay' | 'temperatureNight', val: number) => {
      if (isImperial) {
          handleClimateChange(key, toC(val));
      } else {
          handleClimateChange(key, val);
      }
  };

  return (
    <div className="w-full lg:w-[380px] bg-white/80 dark:bg-[#0a0c0c]/80 backdrop-blur-md border-r border-slate-200 dark:border-white/5 flex-shrink-0 h-full overflow-y-auto p-6 space-y-8 custom-scrollbar z-20 shadow-xl shadow-slate-200/50 dark:shadow-none">
      
      {/* Header & Unit Toggle */}
      <div className="flex items-center justify-between text-slate-400 pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Beaker className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Variables</h2>
          </div>
          <div className="flex bg-slate-100 dark:bg-white/10 rounded-lg p-1">
              <button 
                onClick={() => setIsImperial(false)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${!isImperial ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                  Metric
              </button>
              <button 
                onClick={() => setIsImperial(true)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${isImperial ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                  Imperial
              </button>
          </div>
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-3 gap-2">
          {PRESETS.map(p => (
              <button 
                key={p.id}
                onClick={() => applyPreset(p.config)}
                className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-chloris-400 dark:hover:border-chloris-500 bg-white dark:bg-white/5 hover:bg-chloris-50 dark:hover:bg-chloris-900/20 transition-all group"
              >
                  <p.icon className="w-4 h-4 text-slate-400 group-hover:text-chloris-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 group-hover:text-chloris-600 dark:text-slate-400 dark:group-hover:text-chloris-400">{p.label}</span>
              </button>
          ))}
      </div>

      {/* Subject Selection */}
      <div className="space-y-3 relative">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Specimen</label>
        
        {/* Selector */}
        <div 
            className="group w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 cursor-pointer hover:border-chloris-400 hover:shadow-lg hover:shadow-chloris-500/5 transition-all flex justify-between items-center"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex flex-col gap-1">
                <span className="font-display font-bold text-lg text-slate-800 dark:text-slate-100">{crop.name}</span>
                <span className="text-xs text-chloris-600 dark:text-chloris-400 font-mono">{crop.variety}</span>
            </div>
            <div className={`w-8 h-8 rounded-full bg-slate-50 dark:bg-black/50 flex items-center justify-center border border-slate-100 dark:border-white/10 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
                <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0c0e0e] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[400px] flex flex-col animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                {/* Search */}
                <div className="p-3 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search botanical database..."
                            className="w-full bg-white dark:bg-black rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-white/10 focus:border-chloris-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`text-[10px] px-2.5 py-1 rounded-md whitespace-nowrap transition-all uppercase tracking-wide font-bold border ${
                                    activeCategory === cat 
                                    ? 'bg-chloris-500 border-chloris-500 text-white' 
                                    : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* List */}
                <div className="overflow-y-auto flex-1">
                    {filteredCrops.map(c => (
                        <div 
                            key={c.id}
                            onClick={() => {
                                setCrop(c);
                                setIsOpen(false);
                            }}
                            className={`p-3 border-b border-slate-50 dark:border-white/5 hover:bg-chloris-50 dark:hover:bg-chloris-900/20 cursor-pointer transition-colors group ${crop.id === c.id ? 'bg-chloris-50 dark:bg-chloris-900/10' : ''}`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className={`text-sm font-bold ${crop.id === c.id ? 'text-chloris-700 dark:text-chloris-400' : 'text-slate-700 dark:text-slate-200'}`}>{c.name}</div>
                                    <div className="text-xs text-slate-500">{c.variety}</div>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 border border-slate-100 dark:border-white/10 px-1.5 py-0.5 rounded">{c.type}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Biological Constraints Visualizer */}
      {!isAuto && crop.photoperiodConfig && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
               <div className="flex items-center justify-between mb-3">
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                       <Lock className="w-3 h-3" /> Bio-Constraints
                   </h3>
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${statusColor} bg-white dark:bg-black/20 border border-current border-opacity-20`}>
                       {floweringStatus}
                   </span>
               </div>
               
               {/* Visual Bar */}
               <div className="relative h-4 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mb-2">
                   {/* Critical Marker */}
                   <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20" 
                        style={{ left: `${(criticalDL / 24) * 100}%` }} 
                        title={`Critical Limit: ${criticalDL}h`}
                   ></div>
                   {/* Current Value */}
                   <div 
                        className={`absolute top-0 bottom-0 transition-all duration-500 ${climate.photoperiod > criticalDL ? 'bg-amber-400' : 'bg-indigo-400'}`} 
                        style={{ width: `${(climate.photoperiod / 24) * 100}%` }}
                   ></div>
               </div>
               
               <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                   <span>0h</span>
                   <span>Crit: {criticalDL}h</span>
                   <span>24h</span>
               </div>

               {/* Vernalization Warning */}
               {crop.photoperiodConfig.vernalization?.required && (
                   <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex gap-2 items-start text-[10px] text-sky-600 dark:text-sky-400">
                       <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                       <span>
                           Requires Vernalization: {crop.photoperiodConfig.vernalization.description}
                       </span>
                   </div>
               )}
          </div>
      )}

      {/* Date & Zone */}
      <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              Start Date
            </label>
            <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-chloris-500 outline-none transition-all font-mono shadow-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Hardiness
            </label>
            <select 
                onChange={(e) => {
                    const z = ZONES.find(z => z.id === e.target.value);
                    if (z) setClimate(prev => ({...prev, temperatureDay: z.day, temperatureNight: z.night}));
                }}
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-chloris-500 outline-none transition-all font-mono shadow-sm"
            >
                <option value="">Select Zone</option>
                {ZONES.map(z => (
                    <option key={z.id} value={z.id}>{z.label}</option>
                ))}
            </select>
          </div>
      </div>

      {/* Sliders */}
      <div className="space-y-8 pt-6 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Sun className="w-4 h-4" /> Photobio Params
            </h3>
        </div>
        
        {/* Photoperiod Section */}
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Photoperiod</label>
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">{climate.photoperiod} hrs</span>
                </div>
                <input 
                    type="range" min="6" max="24" step="0.5"
                    value={climate.photoperiod}
                    onChange={(e) => handleClimateChange('photoperiod', parseFloat(e.target.value))}
                    className="w-full"
                />
            </div>
            
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">PPFD Intensity</label>
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">{climate.ppfd} µmol</span>
                </div>
                <input 
                    type="range" min="100" max="2000" step="50"
                    value={climate.ppfd}
                    onChange={(e) => handleClimateChange('ppfd', parseFloat(e.target.value))}
                    className="w-full"
                />
            </div>

            {/* DLI Readout */}
            <div className={`p-4 rounded-xl border flex justify-between items-center transition-colors ${
                isDLIDanger
                ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50'
                : isDLIGood 
                ? 'bg-chloris-50/50 dark:bg-chloris-900/20 border-chloris-200 dark:border-chloris-800/50' 
                : isDLILow 
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50'
                    : 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/50'
            }`}>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Daily Light Integral</span>
                    <span className={`text-xs ${isDLIDanger ? 'text-rose-500 font-bold' : isDLIGood ? 'text-chloris-600' : 'text-amber-500'}`}>
                        {isDLIDanger ? 'BURN RISK' : isDLIGood ? 'Optimal Range' : 'Sub-optimal'}
                    </span>
                </div>
                <span className="font-display text-2xl font-bold text-slate-800 dark:text-white">{currentDLI}</span>
            </div>
        </div>

        {/* Temp Section */}
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Thermometer className="w-4 h-4" /> Temperature
            </h3>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Day Temp</label>
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">
                        {formatTemp(climate.temperatureDay, isImperial)}
                    </span>
                </div>
                <input 
                    type="range" 
                    min={isImperial ? 32 : 0} 
                    max={isImperial ? 104 : 40} 
                    step={0.5}
                    value={getDisplayTemp(climate.temperatureDay)}
                    onChange={(e) => handleSliderTemp('temperatureDay', parseFloat(e.target.value))}
                    className="w-full"
                />
            </div>

             <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Night Temp</label>
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">
                        {formatTemp(climate.temperatureNight, isImperial)}
                    </span>
                </div>
                <input 
                    type="range" 
                    min={isImperial ? 23 : -5} 
                    max={isImperial ? 95 : 35} 
                    step={0.5}
                    value={getDisplayTemp(climate.temperatureNight)}
                    onChange={(e) => handleSliderTemp('temperatureNight', parseFloat(e.target.value))}
                    className="w-full"
                />
            </div>
        </div>

        {/* Atmosphere Section */}
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Wind className="w-4 h-4" /> Atmosphere
            </h3>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">CO₂ Concentration</label>
                    <div className="flex items-center gap-2">
                        {isCo2High && (
                            <span className="text-[10px] font-bold text-rose-500 uppercase animate-pulse">Toxicity Risk</span>
                        )}
                        <span className={`font-mono text-xs font-bold bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md border ${isCo2High ? 'border-rose-500 text-rose-500' : 'border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300'}`}>
                            {climate.co2} ppm
                        </span>
                    </div>
                </div>
                <div className="relative">
                    <input 
                        type="range" min="300" max="2000" step="50"
                        value={climate.co2}
                        onChange={(e) => handleClimateChange('co2', parseFloat(e.target.value))}
                        className="w-full relative z-10"
                    />
                     {/* Safe Zone Marker */}
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 h-1 bg-emerald-500/30 rounded pointer-events-none"
                        style={{ 
                            left: `${((crop.co2Range?.min || 400) - 300) / 1700 * 100}%`, 
                            width: `${((crop.co2Range?.max || 1000) - (crop.co2Range?.min || 400)) / 1700 * 100}%` 
                        }}
                    ></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Ambient</span>
                    <span>Max Safe: {co2Max}ppm</span>
                </div>
            </div>

             <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Relative Humidity</label>
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">{climate.humidity}%</span>
                </div>
                <input 
                    type="range" min="30" max="90" step="5"
                    value={climate.humidity}
                    onChange={(e) => handleClimateChange('humidity', parseFloat(e.target.value))}
                    className="w-full"
                />
            </div>
        </div>

        {/* Validation Messages */}
        {warnings.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-white/5">
                {warnings.map((w, i) => (
                    <div key={i} className={`flex items-center gap-2 text-[10px] p-2 rounded border ${
                        w.type === 'danger' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-100 dark:border-rose-800/50' :
                        w.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800/50' :
                        'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-800/50'
                    }`}>
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        {w.msg}
                    </div>
                ))}
            </div>
        )}

      </div>

      {/* Action */}
      <button 
        onClick={onSimulate}
        disabled={isLoading}
        className={`w-full py-4 rounded-xl font-display font-bold text-sm tracking-widest uppercase transition-all shadow-lg
          ${isLoading 
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-chloris-600 to-chloris-500 hover:from-chloris-500 hover:to-chloris-400 text-white hover:shadow-chloris-500/30 hover:scale-[1.02] active:scale-95'
          }`}
      >
        {isLoading ? 'Processing Model...' : 'Run Simulation'}
      </button>
    </div>
  );
};

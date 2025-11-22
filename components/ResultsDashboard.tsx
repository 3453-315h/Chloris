
import React, { useState, useEffect } from 'react';
import { SimulationResult, ClimateConfig, CropProfile } from '../types';
import { TimelineChart, DLIChart } from './Visualizations';
import { AlertTriangle, CheckCircle, Leaf, Beaker, Info, Save, History, GitCompare, Trash2, X, Calendar, ArrowRight, TrendingUp, TrendingDown, Clock, Zap, Scale, Sun, Thermometer, Sprout, Target, Wind, Download } from 'lucide-react';
import { formatTemp } from '../utils/units';

interface ResultsDashboardProps {
  result: SimulationResult | null;
  currentConfig: ClimateConfig;
  currentCrop: CropProfile;
  isImperial: boolean;
}

interface SavedRun extends SimulationResult {
  id: string;
  timestamp: number;
  config?: ClimateConfig; // Optional to handle older saves
  cropProfile?: CropProfile; // Optional to handle older saves
}

// Helper to calculate total days between sowing and harvest
const getDurationDays = (s: string, e: string) => {
  const d1 = new Date(s).getTime();
  const d2 = new Date(e).getTime();
  if (isNaN(d1) || isNaN(d2)) return 0;
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
};

// Legacy helper for old string-based saves
const getLegacyYieldScore = (text: string): number => {
  const t = text.toLowerCase();
  if (t.includes('optimal') || t.includes('excellent') || t.includes('high') || t.includes('abundant') || t.includes('maximum')) return 85;
  if (t.includes('moderate') || t.includes('average') || t.includes('standard') || t.includes('acceptable')) return 55;
  return 25; // Low, poor, reduced, inhibited
};

// Helper to safely get yield score from new object or old string
const getSafeYieldScore = (projection: any): number => {
    if (!projection) return 0;
    if (typeof projection === 'object' && 'score' in projection) {
        return projection.score;
    }
    // Fallback for legacy string data
    return getLegacyYieldScore(String(projection));
};

// Helper to safely get yield summary text
const getSafeYieldSummary = (projection: any): string => {
    if (!projection) return "N/A";
    if (typeof projection === 'object' && 'summary' in projection) {
        return projection.summary;
    }
    return String(projection);
};

// Helper to get quant estimate
const getYieldEstimate = (projection: any): string | null => {
    if (typeof projection === 'object' && 'estimatedYield' in projection) {
        return projection.estimatedYield;
    }
    return null;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, currentConfig, currentCrop, isImperial }) => {
  const [savedRuns, setSavedRuns] = useState<SavedRun[]>([]);
  const [comparingRun, setComparingRun] = useState<SavedRun | null>(null);

  // Load saved runs on mount
  useEffect(() => {
    const loaded = localStorage.getItem('chloris_history');
    if (loaded) {
      try {
        setSavedRuns(JSON.parse(loaded));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const handleSave = () => {
    if (!result) return;
    const newRun: SavedRun = {
        ...result,
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        timestamp: Date.now(),
        config: currentConfig,
        cropProfile: currentCrop
    };
    
    const updated = [newRun, ...savedRuns];
    setSavedRuns(updated);
    localStorage.setItem('chloris_history', JSON.stringify(updated));
  };

  const handleExport = () => {
      if (!result) return;
      
      // Simple CSV Generation
      const headers = "Stage,StartDate,EndDate,Duration(Days),GDD,DLI\n";
      const rows = result.stages.map(s => 
          `${s.stage},${s.startDate},${s.endDate},${s.durationDays},${s.accumulatedGDD},${s.requiredDLI}`
      ).join("\n");
      
      const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${currentCrop.name.replace(/\s/g, '_')}_Simulation.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedRuns.filter(r => r.id !== id);
    setSavedRuns(updated);
    localStorage.setItem('chloris_history', JSON.stringify(updated));
    if (comparingRun?.id === id) setComparingRun(null);
  };

  if (!result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-slate-500 dark:text-slate-500">
        <Leaf className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-2xl font-light text-slate-800 dark:text-slate-200">Ready to Simulate</h2>
        <p className="max-w-md text-center mt-2 text-slate-600 dark:text-slate-400">
            Configure your crop and environment on the left to generate an advanced phenological model based on photothermal units and GDD.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4 opacity-60 text-xs">
            <div className="p-3 border border-slate-200 dark:border-slate-700 rounded text-center bg-white dark:bg-slate-800">
                <span className="block font-mono text-emerald-600 dark:text-emerald-500 mb-1">PMC10004775</span>
                Photoperiodism
            </div>
            <div className="p-3 border border-slate-200 dark:border-slate-700 rounded text-center bg-white dark:bg-slate-800">
                <span className="block font-mono text-emerald-600 dark:text-emerald-500 mb-1">HortSci 52(12)</span>
                Thermal Time
            </div>
            <div className="p-3 border border-slate-200 dark:border-slate-700 rounded text-center bg-white dark:bg-slate-800">
                <span className="block font-mono text-emerald-600 dark:text-emerald-500 mb-1">Front. Plant Sci.</span>
                Stress Response
            </div>
        </div>
      </div>
    );
  }

  const currentYieldScore = getSafeYieldScore(result.yieldProjection);
  const currentYieldSummary = getSafeYieldSummary(result.yieldProjection);
  const currentYieldEst = getYieldEstimate(result.yieldProjection);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-[#0f172a] transition-colors custom-scrollbar">
      
      {/* Header Area with Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
             <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Simulation Results</h2>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">ID: {result.cropName.replace(/\s/g, '_').toUpperCase()}_{new Date().toLocaleDateString().replace(/\//g,'')}</p>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all shadow-sm group"
            >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Export CSV
            </button>
            <button 
                onClick={handleSave}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-chloris-600 hover:border-chloris-500 hover:shadow-lg hover:shadow-chloris-500/10 transition-all shadow-sm group"
            >
                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Save Run
            </button>
          </div>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Harvest Date</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{result.harvestDate}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Total GDD</span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{result.totalGDD.toFixed(0)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Avg DLI</span>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{result.averageDLI.toFixed(1)} <span className="text-sm text-slate-400 dark:text-slate-500 font-normal">mol/d</span></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider flex items-center gap-2"><Wind className="w-3 h-3"/> CO₂ Level</span>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">{currentConfig.co2} <span className="text-sm text-slate-400 dark:text-slate-500 font-normal">ppm</span></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Yield Score</span>
          <div className="flex items-center gap-2 mt-1">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{currentYieldScore}<span className="text-sm text-slate-400 font-normal">/100</span></div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000" style={{ width: `${currentYieldScore}%` }}></div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <TimelineChart data={result} />
        <DLIChart data={result} />
      </div>

      {/* Detailed Stages Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8 shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Phenological Stages</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Stage</th>
                <th className="px-6 py-3">Dates</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Biological Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {result.stages.map((stage, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">{stage.stage}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-slate-800 dark:text-slate-200">{stage.startDate}</span>
                        <span className="text-xs text-slate-500">to {stage.endDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{stage.durationDays} days</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs">{stage.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scientific Analysis (AI Generated) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-blue-600 dark:text-blue-300 mb-4">
            <Beaker className="w-5 h-5" />
            Physiological Mechanisms
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {result.scientificNotes}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-600 dark:text-amber-300 mb-4">
            <AlertTriangle className="w-5 h-5" />
            Stress & Environmental Risk
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {result.stressAnalysis}
          </p>
        </div>
      </div>

      {/* COMPARISON MODULE */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30">
                <History className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Simulation History</h3>
                <p className="text-xs text-slate-500">Select a previous run to compare against current results.</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List of Saved Runs */}
            <div className="lg:col-span-1 space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {savedRuns.length === 0 ? (
                    <div className="text-center p-10 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400">
                        <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">No saved runs yet.</p>
                        <p className="text-xs mt-1 opacity-70">Click "Save Run" above to start building your history.</p>
                    </div>
                ) : (
                    savedRuns.map(run => {
                        const currentDuration = getDurationDays(result.sowingDate, result.harvestDate);
                        const runDuration = getDurationDays(run.sowingDate, run.harvestDate);
                        const durationDiff = runDuration - currentDuration;
                        const gddDiff = run.totalGDD - result.totalGDD;

                        return (
                            <div 
                                key={run.id}
                                onClick={() => setComparingRun(run.id === comparingRun?.id ? null : run)}
                                className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                                    comparingRun?.id === run.id 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/5' 
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{run.cropName}</span>
                                    <button 
                                        onClick={(e) => handleDelete(run.id, e)}
                                        className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-3">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(run.timestamp).toLocaleDateString()} 
                                    <span className="text-slate-300 dark:text-slate-600">|</span>
                                    {new Date(run.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                                
                                {/* Visual Indicators */}
                                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex gap-3 items-center">
                                        {/* GDD Indicator */}
                                        <div className="flex items-center gap-1" title={`GDD Diff: ${gddDiff > 0 ? '+' : ''}${gddDiff.toFixed(0)}`}>
                                            <Zap className="w-3 h-3 text-slate-400" />
                                            <span className={`font-medium ${comparingRun?.id === run.id ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {run.totalGDD.toFixed(0)}
                                            </span>
                                            {Math.abs(gddDiff) > 10 && (
                                                <span className={gddDiff > 0 ? 'text-amber-500' : 'text-sky-500'}>
                                                    {gddDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                </span>
                                            )}
                                        </div>

                                        {/* Duration Indicator */}
                                        <div className="flex items-center gap-1" title={`Duration Diff: ${durationDiff > 0 ? '+' : ''}${durationDiff} days`}>
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            <span className="text-slate-400 font-mono">
                                                {runDuration}d
                                            </span>
                                            {durationDiff !== 0 && (
                                                 <span className={durationDiff > 0 ? 'text-orange-400' : 'text-emerald-400'}>
                                                    {durationDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {comparingRun?.id === run.id && (
                                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-wider animate-pulse">
                                            <GitCompare className="w-3 h-3" /> Active
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Comparison View */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 min-h-[400px] relative overflow-hidden shadow-sm flex flex-col">
                {!comparingRun ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200 dark:border-slate-700">
                            <GitCompare className="w-8 h-8 opacity-40" />
                        </div>
                        <p className="text-sm font-medium">Comparison Inactive</p>
                        <p className="text-xs mt-1 opacity-70 max-w-xs text-center">Select a run from the history list to compare it against your current simulation.</p>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-300 flex-1 flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">Current</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300" />
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Historical</span>
                                </div>
                            </div>
                            <button onClick={() => setComparingRun(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* 1. Parameter/Context Comparison */}
                        {comparingRun.config && (
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700/50">
                                <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                                    <Scale className="w-3 h-3" /> Input Comparison
                                </h4>
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 text-xs">
                                     <div>
                                        <span className="block text-slate-400 text-[10px] mb-1">Crop Variety</span>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate">{currentCrop.variety}</span>
                                            <span className="text-indigo-500 dark:text-indigo-400 font-medium truncate">{comparingRun.cropProfile?.variety || 'Unknown'}</span>
                                        </div>
                                     </div>
                                     <div>
                                        <span className="block text-slate-400 text-[10px] mb-1">Photoperiod</span>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-slate-700 dark:text-slate-200">{currentConfig.photoperiod}h</span>
                                            <span className="text-slate-500 dark:text-slate-500">{comparingRun.config.photoperiod}h</span>
                                        </div>
                                     </div>
                                     <div>
                                        <span className="block text-slate-400 text-[10px] mb-1">PPFD</span>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-slate-700 dark:text-slate-200">{currentConfig.ppfd} µmol</span>
                                            <span className="text-slate-500 dark:text-slate-500">{comparingRun.config.ppfd} µmol</span>
                                        </div>
                                     </div>
                                     <div>
                                        <span className="block text-slate-400 text-[10px] mb-1">Day Temp</span>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-slate-700 dark:text-slate-200">{formatTemp(currentConfig.temperatureDay, isImperial)}</span>
                                            <span className="text-slate-500 dark:text-slate-500">{formatTemp(comparingRun.config.temperatureDay, isImperial)}</span>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Quantitative Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             {/* Metric 1: GDD */}
                             <ComparisonMetric 
                                label="Total GDD" 
                                current={result.totalGDD} 
                                historical={comparingRun.totalGDD} 
                                unit="" 
                             />
                             {/* Metric 2: DLI */}
                             <ComparisonMetric 
                                label="Avg DLI" 
                                current={result.averageDLI} 
                                historical={comparingRun.averageDLI} 
                                unit="mol/d"
                             />
                             {/* Metric 3: Duration */}
                             <ComparisonMetric 
                                label="Harvest Date" 
                                current={result.stages[result.stages.length - 1].endDate} 
                                historical={comparingRun.stages[comparingRun.stages.length - 1].endDate} 
                                unit=""
                                isDate={true}
                             />
                        </div>

                        {/* 3. Yield Comparison */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-900/30 px-4 py-2 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                                <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                    <Target className="w-3 h-3" /> Yield Analysis
                                </h4>
                                {(() => {
                                    const hScore = getSafeYieldScore(comparingRun.yieldProjection);
                                    if(currentYieldScore > hScore) return <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">IMPROVED ({currentYieldScore - hScore}pts)</span>;
                                    if(currentYieldScore < hScore) return <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-500/20">DECLINED ({hScore - currentYieldScore}pts)</span>;
                                    return <span className="text-[10px] font-bold text-slate-400">NEUTRAL</span>;
                                })()}
                            </div>
                            <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-700/50">
                                <div className="p-4">
                                    <span className="block text-[10px] uppercase text-emerald-600 dark:text-emerald-500 mb-1 font-bold">Current Run</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">{currentYieldSummary}</p>
                                    {currentYieldEst && <span className="inline-block text-[10px] px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-100 dark:border-emerald-500/20">{currentYieldEst}</span>}
                                </div>
                                <div className="p-4 bg-slate-50/50 dark:bg-white/5">
                                    <span className="block text-[10px] uppercase text-indigo-500 dark:text-indigo-400 mb-1 font-bold">Historical Run</span>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">{getSafeYieldSummary(comparingRun.yieldProjection)}</p>
                                    {getYieldEstimate(comparingRun.yieldProjection) && <span className="inline-block text-[10px] px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-100 dark:border-indigo-500/20">{getYieldEstimate(comparingRun.yieldProjection)}</span>}
                                </div>
                            </div>
                            {/* Comparative Progress Bar */}
                            <div className="h-1 bg-slate-200 dark:bg-slate-700 flex">
                                <div className="h-full bg-emerald-500" style={{width: `${currentYieldScore}%`, opacity: 0.7}}></div>
                                <div className="h-full bg-indigo-500" style={{width: `${getSafeYieldScore(comparingRun.yieldProjection)}%`, opacity: 0.5, marginLeft: `-${currentYieldScore}%`}}></div>
                            </div>
                        </div>

                        {/* 4. Stage Diff Chart */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Stage Duration Variance</h4>
                            <div className="space-y-4">
                                {result.stages.map((stage, idx) => {
                                    const histStage = comparingRun.stages.find(s => s.stage === stage.stage);
                                    if (!histStage) return null;
                                    
                                    const diff = stage.durationDays - histStage.durationDays;
                                    const maxDuration = Math.max(stage.durationDays, histStage.durationDays);
                                    
                                    // Calculate widths relative to max
                                    const currentWidth = (stage.durationDays / maxDuration) * 100;
                                    const histWidth = (histStage.durationDays / maxDuration) * 100;

                                    return (
                                        <div key={idx} className="text-xs">
                                            <div className="flex justify-between mb-1">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{stage.stage}</span>
                                                <span className={`font-mono ${diff === 0 ? 'text-slate-400' : diff > 0 ? 'text-emerald-500' : 'text-indigo-500'}`}>
                                                    {diff > 0 ? '+' : ''}{diff}d
                                                </span>
                                            </div>
                                            
                                            {/* Comparative Bars */}
                                            <div className="relative h-6 bg-slate-50 dark:bg-slate-900/50 rounded-md overflow-hidden flex flex-col justify-center gap-[1px]">
                                                {/* Current Bar */}
                                                <div className="h-2 bg-emerald-500/80 rounded-r-sm transition-all duration-500" style={{ width: `${Math.max(currentWidth, 5)}%` }}></div>
                                                {/* Historical Bar */}
                                                <div className="h-2 bg-indigo-400/50 rounded-r-sm transition-all duration-500" style={{ width: `${Math.max(histWidth, 5)}%` }}></div>
                                            </div>
                                            
                                            <div className="flex justify-between mt-1 text-[9px] text-slate-400 font-mono">
                                                <span>{stage.durationDays}d (Now)</span>
                                                <span>{histStage.durationDays}d (Then)</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
     </div>
    </div>
  );
};

// Helper Component for Comparison Metrics
const ComparisonMetric = ({ label, current, historical, unit, isDate = false }: any) => {
    let diffNode = null;
    
    if (isDate) {
         const d1 = new Date(current).getTime();
         const d2 = new Date(historical).getTime();
         const diffDays = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
         
         diffNode = (
             <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${diffDays === 0 ? 'text-slate-400 bg-slate-100 dark:bg-slate-700' : diffDays > 0 ? 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' : 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30'}`}>
                 {diffDays > 0 ? `+${diffDays} days` : diffDays < 0 ? `${diffDays} days` : 'No Change'}
             </span>
         );
    } else {
        const diff = current - historical;
        const percent = historical !== 0 ? ((diff / historical) * 100).toFixed(1) : '0.0';
        const isPositive = diff > 0;
        
        diffNode = (
             <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${diff === 0 ? 'text-slate-400 bg-slate-100 dark:bg-slate-700' : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5'}`}>
                 {diff > 0 ? '+' : ''}{typeof current === 'number' ? diff.toFixed(1) : diff} {unit} <span className={`ml-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>({diff > 0 ? '+' : ''}{percent}%)</span>
             </span>
        );
    }

    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div>
                <span className="block text-[10px] uppercase text-slate-400 tracking-wider mb-2">{label}</span>
                <span className="text-xl font-display font-bold text-slate-800 dark:text-white block mb-1">
                    {typeof current === 'number' && !isDate ? current.toFixed(isDate ? 0 : 1) : current} <span className="text-sm font-normal text-slate-400">{unit}</span>
                </span>
            </div>
            
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700/50 flex flex-col gap-1">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] text-indigo-400 font-medium uppercase tracking-wide">History</span>
                    <span className="text-xs text-indigo-600 dark:text-indigo-300 font-mono">
                         {typeof historical === 'number' && !isDate ? historical.toFixed(isDate ? 0 : 1) : historical}
                    </span>
                 </div>
                 <div className="mt-1 text-right">
                    {diffNode}
                 </div>
            </div>
        </div>
    )
}


import React, { useState, useCallback } from 'react';
import { InputPanel } from './InputPanel';
import { ResultsDashboard } from './ResultsDashboard';
import { ClimateConfig, CropProfile, SimulationResult } from '../types';
import { DEFAULT_CLIMATE } from '../constants';
import { CropDatabase, DEFAULT_CROP_ID } from '../services/cropDatabase';
import { runGrowthSimulation } from '../services/geminiService';
import { ArrowLeft, Share2, Download, Sparkles, Sprout } from 'lucide-react';
import { ChlorisIcon } from './ChlorisIcon';
import { GlossarySection, CropGuide } from './SectionGuide';

interface PhenologyEngineProps {
  onBack: () => void;
}

export const PhenologyEngine: React.FC<PhenologyEngineProps> = ({ onBack }) => {
  const [crop, setCrop] = useState<CropProfile>(() => {
      return CropDatabase.getCropById(DEFAULT_CROP_ID) || CropDatabase.getAllCrops()[0];
  });
  
  const [climate, setClimate] = useState<ClimateConfig>(DEFAULT_CLIMATE);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isImperial, setIsImperial] = useState(false);
  
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const simResult = await runGrowthSimulation(crop, climate, startDate);
      setResult(simResult);
    } catch (err) {
      console.error(err);
      setError("Failed to generate simulation. Please check your configuration or API Key.");
    } finally {
      setIsLoading(false);
    }
  }, [crop, climate, startDate]);

  return (
    <div className="flex h-full w-full bg-slate-50/50 dark:bg-[#040808] text-slate-900 dark:text-slate-100 overflow-hidden relative animate-in fade-in duration-500 font-sans">
      
      {/* Sidebar */}
      <div className="flex flex-col h-full border-r border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0c0c]/80 backdrop-blur-md z-20 shadow-xl shadow-slate-200/50 dark:shadow-none w-full lg:w-[380px] flex-shrink-0">
          {/* Wraps InputPanel to append CropGuide */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <InputPanel 
                crop={crop} 
                setCrop={setCrop}
                climate={climate}
                setClimate={setClimate}
                startDate={startDate}
                setStartDate={setStartDate}
                onSimulate={handleSimulate}
                isLoading={isLoading}
                isImperial={isImperial}
                setIsImperial={setIsImperial}
            />
            <div className="px-6 pb-6">
               <CropGuide section="phenology" crop={crop} />
            </div>
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="h-20 border-b border-slate-200 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-xl flex items-center px-8 justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="group flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-chloris-500/50 hover:text-chloris-500 transition-all shadow-sm"
              title="Back to Main Menu"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chloris-100 to-white dark:from-chloris-900 dark:to-black flex items-center justify-center border border-chloris-200 dark:border-chloris-800 text-chloris-600 dark:text-chloris-400 shadow-sm">
                    <ChlorisIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                    <h1 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white font-display uppercase">Simulation Lab</h1>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Target: {crop.name}</span>
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-chloris-50 dark:bg-chloris-900/20 text-chloris-700 dark:text-chloris-300 text-xs font-medium border border-chloris-100 dark:border-chloris-800/30">
                <Sparkles className="w-3 h-3" />
                <span>Gemini 2.5 Connected</span>
             </div>
          </div>
        </header>

        {/* Main Content Scroller */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {/* Error Banner */}
            {error && (
                <div className="mx-8 mt-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/20 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm animate-in slide-in-from-top-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    {error}
                </div>
            )}

            {/* Dashboard */}
            <ResultsDashboard 
                result={result} 
                currentConfig={climate}
                currentCrop={crop}
                isImperial={isImperial}
            />
            
            {/* Glossary Section */}
            <div className="px-8">
               <GlossarySection section="phenology" />
            </div>
        </div>
        
        {/* Elegant Loading Overlay */}
        {isLoading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                <div className="relative flex flex-col items-center">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-chloris-400/30 blur-2xl rounded-full animate-pulse"></div>
                        <ChlorisIcon className="w-24 h-24 text-chloris-500 relative z-10 animate-float" />
                    </div>
                    
                    <h3 className="text-2xl font-display font-light text-slate-900 dark:text-white mb-2">Germinating Model</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-mono">
                        <Sprout className="w-4 h-4 animate-bounce" />
                        <span>Calculating GDD & Photoperiods...</span>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};


import React, { useState, useMemo } from 'react';
import { CropProfile, BreedingResult } from '../types';
import { CropDatabase, DEFAULT_CROP_ID } from '../services/cropDatabase';
import { runBreedingSimulation } from '../services/geminiService';
import { ArrowLeft, Dna, Microscope, Sparkles, GitMerge, AlertTriangle, Info } from 'lucide-react';
import { ChlorisIcon } from './ChlorisIcon';

interface GeneticMapperProps {
  onBack: () => void;
}

export const GeneticMapper: React.FC<GeneticMapperProps> = ({ onBack }) => {
  const allCrops = useMemo(() => CropDatabase.getAllCrops(), []);
  
  const [parentA, setParentA] = useState<CropProfile>(allCrops.find(c => c.id === DEFAULT_CROP_ID) || allCrops[0]);
  const [parentB, setParentB] = useState<CropProfile>(allCrops[1] || allCrops[0]);
  
  const [result, setResult] = useState<BreedingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check species compatibility
  const isCompatible = parentA.scientificName === parentB.scientificName;

  const handleBreed = async () => {
    setIsLoading(true);
    setResult(null);
    try {
        const res = await runBreedingSimulation(parentA, parentB);
        setResult(res);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-[#040808] text-slate-900 dark:text-slate-100 overflow-hidden relative animate-in fade-in duration-500 font-sans">
      
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-20 border-b border-slate-200 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-xl flex items-center px-8 justify-between z-20">
         <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="group flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-chloris-500/50 hover:text-chloris-500 transition-all shadow-sm"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 shadow-sm">
                    <Dna className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                    <h1 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white font-display uppercase">Genetic Mapper</h1>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Mendelian & Polygenic Trait Simulation</span>
                </div>
            </div>
         </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row mt-20 p-6 gap-6 overflow-hidden">
         
         {/* LEFT PANEL: PARENT SELECTION */}
         <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
             {/* Parent A */}
             <ParentCard 
                label="Parent A (Pollen Donor)" 
                selected={parentA} 
                options={allCrops} 
                onChange={setParentA} 
                colorClass="border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10"
                icon={<div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">♂</div>}
             />

             {/* Parent B */}
             <ParentCard 
                label="Parent B (Receptor)" 
                selected={parentB} 
                options={allCrops} 
                onChange={setParentB} 
                colorClass="border-pink-500/30 bg-pink-50/50 dark:bg-pink-900/10"
                icon={<div className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400 text-xs font-bold">♀</div>}
             />

             {/* Action Block */}
             <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Compatibility</h3>
                    {isCompatible ? (
                        <span className="text-[10px] px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded font-bold border border-emerald-200 dark:border-emerald-800">Match</span>
                    ) : (
                        <span className="text-[10px] px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded font-bold border border-rose-200 dark:border-rose-800">Incompatible</span>
                    )}
                </div>
                
                {!isCompatible && (
                    <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 rounded-lg flex gap-3 text-xs text-rose-700 dark:text-rose-300">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <p>Species mismatch. Breeding typically fails or produces sterile offspring.</p>
                    </div>
                )}

                <button 
                    onClick={handleBreed}
                    disabled={isLoading}
                    className={`w-full py-4 rounded-xl font-display font-bold text-sm tracking-widest uppercase transition-all shadow-lg flex items-center justify-center gap-2
                    ${isLoading 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-95'
                    }`}
                >
                    {isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <GitMerge className="w-4 h-4" />}
                    {isLoading ? 'Sequencing...' : 'Run Cross'}
                </button>
             </div>
         </div>

         {/* RIGHT PANEL: RESULTS */}
         <div className="flex-1 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 p-8 overflow-y-auto custom-scrollbar relative">
             {!result ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60">
                     <Dna className="w-24 h-24 mb-4 opacity-20 animate-pulse-slow" />
                     <h3 className="text-lg font-light">Awaiting Genetic Sequence</h3>
                     <p className="text-sm">Select parents to begin trait simulation</p>
                 </div>
             ) : (
                 <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                     
                     {/* Result Header */}
                     <div className="text-center border-b border-slate-100 dark:border-white/10 pb-8">
                         <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-widest mb-4 border border-purple-200 dark:border-purple-800">
                            F1 Offspring Generation
                         </span>
                         <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">{result.offspringName}</h2>
                         <div className="flex justify-center gap-6 text-xs font-mono text-slate-500 dark:text-slate-400 mt-4">
                             <span>Stability: <b className={result.geneticStability.includes('Unstable') ? 'text-amber-500' : 'text-emerald-500'}>{result.geneticStability}</b></span>
                             <span>Yield Potential: <b className="text-blue-500">{result.predictedYield}</b></span>
                         </div>
                     </div>

                     {/* Punnett Squares */}
                     <div>
                         <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Microscope className="w-4 h-4" /> Mendelian Trait Inheritance
                         </h3>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {result.traits?.map((trait, idx) => (
                                 <div key={idx} className="p-6 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5">
                                     <div className="flex justify-between items-center mb-4">
                                         <span className="font-bold text-slate-700 dark:text-slate-200">{trait.name}</span>
                                     </div>
                                     
                                     {/* The Grid */}
                                     <div className="aspect-square w-full max-w-[200px] mx-auto bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-2 grid grid-cols-2 grid-rows-2 gap-1 mb-4">
                                         {trait.punnettSquare.map((row, rIdx) => 
                                            row.map((cell, cIdx) => (
                                                <div key={`${rIdx}-${cIdx}`} className="bg-slate-100 dark:bg-white/5 rounded flex items-center justify-center text-lg font-mono font-bold text-slate-600 dark:text-slate-300">
                                                    {cell}
                                                </div>
                                            ))
                                         )}
                                     </div>

                                     {/* Probabilities */}
                                     <div className="space-y-2">
                                         {trait.probabilities.map((p) => (
                                             <div key={p.phenotype} className="flex items-center justify-between text-xs">
                                                 <span className="text-slate-500 dark:text-slate-400">{p.phenotype}</span>
                                                 <div className="flex items-center gap-2 w-1/2">
                                                     <div className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                         <div className="h-full bg-purple-500" style={{ width: `${p.probability}%`}}></div>
                                                     </div>
                                                     <span className="font-mono w-8 text-right">{p.probability}%</span>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>

                     {/* AI Notes */}
                     <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 p-6 rounded-2xl">
                         <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4" /> Breeder's Log
                         </h3>
                         <p className="text-sm leading-relaxed text-indigo-900 dark:text-indigo-200">
                             {result.aiAnalysis}
                         </p>
                     </div>

                 </div>
             )}
         </div>
      </div>
    </div>
  );
};

// Helper Component for Parent Selection
const ParentCard = ({ label, selected, options, onChange, colorClass, icon }: any) => {
    const [isOpen, setIsOpen] = useState(false);

    // Safely handle traits being undefined
    const traits = selected.geneticTraits || [];

    return (
        <div className={`p-4 rounded-2xl border transition-all ${colorClass}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
                {icon}
            </div>
            
            {/* Selector */}
            <div className="relative">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full text-left bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 flex justify-between items-center hover:border-slate-300 transition-colors"
                >
                    <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{selected.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{selected.variety}</div>
                    </div>
                </button>
                
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 custom-scrollbar">
                        {options.map((opt: CropProfile) => (
                            <div 
                                key={opt.id}
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border-b border-slate-100 dark:border-white/5 text-xs"
                            >
                                {opt.name} - {opt.variety}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Genotype Summary */}
            <div className="mt-4 space-y-2">
                {traits.length > 0 ? (
                    traits.map((t: any) => (
                        <div key={t.id} className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 dark:text-slate-400">{t.name}</span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/10 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5">
                                {t.genotype} ({t.phenotype})
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-[10px] text-slate-400 italic text-center py-2">
                        No specific alleles mapped for this cultivar.
                    </div>
                )}
            </div>
        </div>
    )
}

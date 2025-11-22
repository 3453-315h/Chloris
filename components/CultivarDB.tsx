
import React, { useState, useMemo } from 'react';
import { CropDatabase } from '../services/cropDatabase';
import { CropProfile } from '../types';
import { ArrowLeft, Search, Filter, Dna, Activity, Shield, Sprout, Droplets, Snowflake, Bug, Database, X, ExternalLink, Microscope } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { ChlorisIcon } from './ChlorisIcon';

interface CultivarDBProps {
  onBack: () => void;
}

export const CultivarDB: React.FC<CultivarDBProps> = ({ onBack }) => {
  const allCrops = useMemo(() => CropDatabase.getAllCrops(), []);
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [minResistance, setMinResistance] = useState(0);
  
  // Selection State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const selectedCrop = useMemo(() => 
    allCrops.find(c => c.id === selectedId), 
  [selectedId, allCrops]);

  const filteredCrops = useMemo(() => {
    return allCrops.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.variety.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
      const matchesRes = c.resistance ? Math.max(c.resistance.mold, c.resistance.pests, c.resistance.drought) >= minResistance : true;
      
      return matchesSearch && matchesCat && matchesRes;
    });
  }, [searchQuery, categoryFilter, minResistance, allCrops]);

  // Categories
  const categories = ['All', 'Cannabis', 'Vegetable', 'Fruit', 'Herb'];

  return (
    <div className="flex h-full w-full bg-slate-50/50 dark:bg-[#040808] text-slate-900 dark:text-slate-100 overflow-hidden relative animate-in fade-in duration-500 font-sans">
      
      {/* LEFT SIDEBAR: FILTERS (InputPanel Style) */}
      <div className="w-full lg:w-[350px] bg-white/80 dark:bg-[#0a0c0c]/80 backdrop-blur-md border-r border-slate-200 dark:border-white/5 flex-shrink-0 h-full overflow-y-auto p-6 space-y-8 custom-scrollbar z-20 shadow-xl shadow-slate-200/50 dark:shadow-none">
        
        {/* Header */}
        <div className="flex items-center gap-2 text-slate-400 pb-4 border-b border-slate-100 dark:border-white/5">
            <Database className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Library Access</h2>
        </div>

        {/* Search */}
        <div className="space-y-3">
             <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Search Database</label>
             <div className="relative">
                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Find by name or variety..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:border-chloris-500 outline-none transition-colors"
                 />
             </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
             <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Classification</label>
             <div className="flex flex-wrap gap-2">
                 {categories.map(cat => (
                     <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            categoryFilter === cat 
                            ? 'bg-chloris-500 text-white border-chloris-500' 
                            : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-chloris-500/50'
                        }`}
                     >
                         {cat}
                     </button>
                 ))}
             </div>
        </div>

        {/* Advanced Filters */}
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Filter className="w-4 h-4" /> Trait Filter
             </h3>
             
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Min Resistance Score</label>
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">{minResistance}/10</span>
                </div>
                <input 
                    type="range" min="0" max="10" step="1"
                    value={minResistance}
                    onChange={(e) => setMinResistance(parseInt(e.target.value))}
                    className="w-full"
                />
                <p className="text-[10px] text-slate-400">Filters out crops with weak immunity profiles.</p>
            </div>
        </div>
        
        <div className="pt-6 mt-auto">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-500/20 flex gap-3">
                <Dna className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                    <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">Genomic Passport</h4>
                    <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 leading-relaxed">
                        Each entry contains verified lineage and chemotype data based on the Phylos Open Data standard.
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT: GRID */}
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-black flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 shadow-sm">
                        <ChlorisIcon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white font-display uppercase">Cultivar Database</h1>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Registry Size: {allCrops.length} entries</span>
                    </div>
                </div>
            </div>
         </header>

         {/* Grid Content */}
         <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-[#0f172a] transition-colors custom-scrollbar">
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-7xl mx-auto pb-20">
                 {filteredCrops.map(crop => (
                     <div 
                        key={crop.id}
                        onClick={() => setSelectedId(crop.id)}
                        className={`group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-chloris-400 dark:hover:border-chloris-600 hover:shadow-lg hover:shadow-chloris-500/10 transition-all cursor-pointer relative overflow-hidden ${selectedId === crop.id ? 'ring-2 ring-chloris-500' : ''}`}
                     >
                         {/* Category Badge */}
                         <div className="absolute top-0 right-0 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-bl-xl border-b border-l border-slate-100 dark:border-white/5">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{crop.category}</span>
                         </div>

                         <div className="flex flex-col h-full">
                             <div className="mb-4">
                                 <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-chloris-600 dark:group-hover:text-chloris-400 transition-colors">{crop.name}</h3>
                                 <p className="text-xs text-slate-500 font-mono">{crop.variety}</p>
                             </div>
                             
                             <div className="mt-auto space-y-3">
                                 {/* Mini Stats */}
                                 <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-white/5 pt-3">
                                     <div className="flex flex-col">
                                         <span className="text-[10px] text-slate-400 uppercase">Flowering</span>
                                         <span className="font-medium text-slate-700 dark:text-slate-300">{crop.expectedMaturityDays} Days</span>
                                     </div>
                                     <div className="flex flex-col text-right">
                                         <span className="text-[10px] text-slate-400 uppercase">Type</span>
                                         <span className="font-medium text-slate-700 dark:text-slate-300">{crop.type}</span>
                                     </div>
                                 </div>
                                 
                                 {/* Genotype Tags */}
                                 <div className="flex gap-1 flex-wrap">
                                     {crop.geneticTraits?.slice(0, 3).map(t => (
                                         <span key={t.id} className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 text-[9px] font-mono rounded text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                                             {t.genotype}
                                         </span>
                                     ))}
                                     {(crop.geneticTraits?.length || 0) > 3 && (
                                         <span className="px-1.5 py-0.5 text-[9px] font-mono text-slate-400">+{(crop.geneticTraits?.length || 0) - 3}</span>
                                     )}
                                 </div>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
         </div>
      </div>

      {/* DETAIL OVERLAY SLIDE-OVER */}
      {selectedCrop && (
          <div className="absolute top-0 right-0 bottom-0 w-full md:w-[600px] bg-white/95 dark:bg-[#0c0e0e]/95 backdrop-blur-xl border-l border-slate-200 dark:border-white/10 z-40 shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto custom-scrollbar">
              {/* Detail Header */}
              <div className="sticky top-0 bg-white/90 dark:bg-[#0c0e0e]/90 backdrop-blur p-8 border-b border-slate-100 dark:border-white/5 z-10 flex justify-between items-start">
                  <div>
                      <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded bg-chloris-100 dark:bg-chloris-900/30 text-chloris-700 dark:text-chloris-300 text-[10px] font-bold uppercase border border-chloris-200 dark:border-chloris-800">
                              Verified Genotype
                          </span>
                          <span className="text-xs font-mono text-slate-400">{selectedCrop.scientificName}</span>
                      </div>
                      <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-1">{selectedCrop.name}</h2>
                      <p className="text-lg text-slate-500 dark:text-slate-400 font-light">{selectedCrop.variety}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors"
                  >
                      <X className="w-6 h-6" />
                  </button>
              </div>
              
              <div className="p-8 space-y-10">
                  
                  {/* Description */}
                  <div className="prose prose-sm dark:prose-invert">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {selectedCrop.description || "No biological description available for this cultivar."}
                      </p>
                  </div>

                  {/* Lineage */}
                  {selectedCrop.lineage && (
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                              <Dna className="w-4 h-4" /> Lineage Tree
                          </h3>
                          <div className="flex items-center justify-center gap-4">
                               <div className="text-center">
                                   <div className="w-10 h-10 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs mb-2">♂</div>
                                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{selectedCrop.lineage.father}</span>
                               </div>
                               <div className="h-px w-12 bg-slate-300 dark:bg-slate-600 relative top-[-14px]"></div>
                               <div className="relative top-[-14px]">
                                   <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                               </div>
                               <div className="h-px w-12 bg-slate-300 dark:bg-slate-600 relative top-[-14px]"></div>
                               <div className="text-center">
                                   <div className="w-10 h-10 mx-auto bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center text-pink-600 dark:text-pink-400 font-bold text-xs mb-2">♀</div>
                                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{selectedCrop.lineage.mother}</span>
                               </div>
                          </div>
                          <div className="text-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/50 flex justify-between text-xs text-slate-500">
                              <span>Generation: <strong className="text-slate-700 dark:text-slate-300">{selectedCrop.lineage.generation}</strong></span>
                              <span>Breeder: <strong className="text-slate-700 dark:text-slate-300">{selectedCrop.lineage.breeder}</strong></span>
                          </div>
                      </div>
                  )}

                  {/* Chemotype Radar (Only if data exists) */}
                  {selectedCrop.chemotype && selectedCrop.chemotype.terpeneList.length > 0 && (
                      <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                              <Microscope className="w-4 h-4" /> Terpene Profile
                          </h3>
                          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={selectedCrop.chemotype.terpeneList}>
                                      <PolarGrid stroke="#d6d3d1" strokeOpacity={0.3} />
                                      <PolarAngleAxis dataKey="name" tick={{ fill: '#a8a29e', fontSize: 10 }} />
                                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                      <Radar name="Terpenes" dataKey="value" stroke="#538d69" fill="#538d69" fillOpacity={0.3} />
                                      <Tooltip 
                                        contentStyle={{ backgroundColor: '#292524', borderColor: '#44403c', color: '#fafaf9', fontSize: '12px' }}
                                      />
                                  </RadarChart>
                              </ResponsiveContainer>
                          </div>
                          <div className="mt-3 flex gap-2 items-center justify-center text-xs text-slate-500">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">Primary: {selectedCrop.chemotype.primary}</span>
                              <span>•</span>
                              <span>{selectedCrop.chemotype.aromaDescription}</span>
                          </div>
                      </div>
                  )}

                  {/* Resistance Stats */}
                  {selectedCrop.resistance && (
                      <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                              <Shield className="w-4 h-4" /> Immunity Matrix
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                              <ResistanceBar label="Mold / PM" value={selectedCrop.resistance.mold} icon={<Sprout className="w-3 h-3" />} />
                              <ResistanceBar label="Pests" value={selectedCrop.resistance.pests} icon={<Bug className="w-3 h-3" />} />
                              <ResistanceBar label="Drought" value={selectedCrop.resistance.drought} icon={<Droplets className="w-3 h-3" />} />
                              <ResistanceBar label="Cold Stress" value={selectedCrop.resistance.cold} icon={<Snowflake className="w-3 h-3" />} />
                          </div>
                      </div>
                  )}
              </div>
              
              {/* Footer Action */}
              <div className="sticky bottom-0 p-6 bg-white/90 dark:bg-[#0c0e0e]/90 backdrop-blur border-t border-slate-100 dark:border-white/5">
                   <button className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm uppercase tracking-widest hover:shadow-lg transition-all flex items-center justify-center gap-2">
                       <Activity className="w-4 h-4" />
                       Load into Simulation
                   </button>
              </div>
          </div>
      )}

    </div>
  );
};

const ResistanceBar = ({ label, value, icon }: any) => {
    let color = "bg-rose-500";
    if (value > 4) color = "bg-amber-500";
    if (value > 7) color = "bg-emerald-500";

    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                    {icon} {label}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{value}/10</span>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${value * 10}%` }}></div>
            </div>
        </div>
    )
}

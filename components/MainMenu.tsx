
import React, { useState, useEffect } from 'react';
import { Activity, Database, Settings, ArrowRight, Dna, CloudSun, BarChart3, Cpu, Globe, Lock, Sparkles, Leaf, Beaker, FlaskConical, Scan, Flower, Sigma, Wifi, HardDrive, Zap } from 'lucide-react';
import { ChlorisIcon } from './ChlorisIcon';

interface MainMenuProps {
  onNavigate: (view: string) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNavigate }) => {
  const [mounted, setMounted] = useState(false);
  const [latency, setLatency] = useState(12);
  const [load, setLoad] = useState(14);

  // Simulating live telemetry for the status bar
  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
        setLatency(prev => Math.max(8, Math.min(45, prev + (Math.random() > 0.5 ? 2 : -2))));
        setLoad(prev => Math.max(10, Math.min(30, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const roadmapModules = [
    { 
      title: "Genetic Mapper", 
      icon: Dna, 
      color: "bg-purple-500", 
      desc: "Trait inheritance & breeding simulator",
      status: "Active",
      id: 'genetics' 
    },
    { 
      title: "Climate Lab", 
      icon: CloudSun, 
      color: "bg-sky-500", 
      desc: "VPD, HVAC & airflow dynamics",
      status: "Active",
      id: 'climatelab'
    },
    { 
      title: "Market Yields", 
      icon: BarChart3, 
      color: "bg-amber-500", 
      desc: "ROI calculation & harvest pricing",
      status: "Active",
      id: 'marketyields'
    },
    { 
      title: "Cultivar Database", 
      icon: Database, 
      color: "bg-slate-500", 
      desc: "Browse 50+ documented genotypes",
      status: "Active",
      id: 'cultivardb'
    },
    { 
      title: "Nutrient Alchemy", 
      icon: FlaskConical, 
      color: "bg-cyan-500", 
      desc: "Hydroponic chemistry & ionic balance",
      status: "Active",
      id: 'nutrientalchemy'
    },
    { 
      title: "Vision Diagnostics", 
      icon: Scan, 
      color: "bg-red-500", 
      desc: "AI-powered pathology & deficiency detection",
      status: "Active",
      id: 'visiondiagnostics'
    },
    { 
      title: "Golden Ratio Bloom", 
      icon: Flower, 
      color: "bg-amber-400", 
      desc: "Fibonacci sequence & phyllotaxis visualizer",
      status: "Active",
      id: 'goldenratio'
    }
  ];

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 md:p-8 relative overflow-hidden">
      
      {/* Top Navigation / Brand */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-20 pointer-events-none">
         <div className="pointer-events-auto flex items-center gap-4">
             <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg shadow-chloris-500/10 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                 <ChlorisIcon className="w-8 h-8 text-chloris-600 dark:text-chloris-400" />
             </div>
             <div>
                 <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Chloris</h1>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-chloris-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">System V 1.3.0</span>
                 </div>
             </div>
         </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 mt-12 h-[80vh] overflow-y-auto custom-scrollbar pr-2 pb-24">
        
        {/* Hero: Simulation Engine (Now Spans Full Width) */}
        <div 
            onClick={() => onNavigate('phenology')}
            className="lg:col-span-12 group relative min-h-[340px] rounded-[2.5rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden cursor-pointer hover:border-chloris-400/50 transition-all duration-500 flex-shrink-0"
        >
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 z-0"></div>
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-chloris-50/80 to-transparent dark:from-chloris-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            {/* Content */}
            <div className="absolute inset-0 p-10 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chloris-100 dark:bg-chloris-900/30 text-chloris-700 dark:text-chloris-300 text-xs font-bold uppercase tracking-wide border border-chloris-200 dark:border-chloris-800">
                        <Sparkles className="w-3 h-3" />
                        <span>Core Module</span>
                    </div>
                    
                    <div className="w-14 h-14 rounded-full bg-white dark:bg-white/10 backdrop-blur-md border border-slate-100 dark:border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-chloris-500 group-hover:text-white transition-all duration-300 shadow-lg">
                        <ArrowRight className="w-6 h-6" />
                    </div>
                </div>

                <div className="relative">
                    <h2 className="text-4xl md:text-5xl font-display font-semibold text-slate-900 dark:text-white mb-4 leading-tight">
                        Phenology <br/> Engine
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg font-light leading-relaxed">
                        Initialize growth parameters. Simulates DLI, GDD, and Photoperiod triggers using GenAI logic.
                    </p>
                    
                    <div className="mt-8 flex items-center gap-6 text-sm font-mono text-slate-400">
                        <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4" />
                            <span>0.04ms Latency</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <span>Global Climate Data</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Artistic Icon Placement */}
            <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] text-chloris-500/10 dark:text-chloris-400/5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
                <ChlorisIcon className="w-full h-full" />
            </div>
        </div>

        {/* Modules Grid */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
            {roadmapModules.map((mod, idx) => (
                <div 
                  key={idx} 
                  onClick={() => mod.status === 'Active' && mod.id ? onNavigate(mod.id) : null}
                  className={`group h-48 rounded-[2rem] bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 p-6 flex flex-col justify-between transition-all duration-300 
                    ${mod.status === 'Active' 
                        ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-sky-500/30' 
                        : 'cursor-not-allowed opacity-60 hover:opacity-80'}`}
                >
                    <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-xl ${mod.color} bg-opacity-10 flex items-center justify-center`}>
                            <mod.icon className={`w-5 h-5 ${mod.color.replace('bg-', 'text-')}`} />
                        </div>
                        {mod.status === 'Active' ? (
                            <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">Active</div>
                        ) : (
                            <Lock className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        )}
                    </div>
                    
                    <div>
                        <h4 className={`font-display font-semibold text-lg text-slate-900 dark:text-white mb-1 transition-colors ${mod.status === 'Active' ? 'group-hover:text-sky-500' : ''}`}>
                            {mod.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-500 leading-snug">
                            {mod.desc}
                        </p>
                    </div>
                </div>
            ))}
        </div>

      </div>

      {/* NEW FLOATING SYSTEM STATUS HUD */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center gap-6 pl-6 pr-8 py-3 rounded-full bg-white/80 dark:bg-[#0c0a09]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-300/20 dark:shadow-black/50">
              
              {/* Operational Pulse */}
              <div className="flex items-center gap-3 border-r border-slate-200 dark:border-white/10 pr-6">
                  <div className="relative flex items-center justify-center w-3 h-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 tracking-widest leading-none">OPERATIONAL</span>
                      <span className="text-[8px] text-slate-400 font-mono mt-0.5">ALL SYSTEMS NORMAL</span>
                  </div>
              </div>

              {/* Telemetry Metrics */}
              <div className="hidden md:flex items-center gap-6">
                  <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                          <Wifi className="w-3 h-3" /> Latency
                      </div>
                      <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">{latency}ms</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                          <HardDrive className="w-3 h-3" /> Memory
                      </div>
                      <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">{load}%</span>
                  </div>

                   <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                          <Zap className="w-3 h-3" /> Uptime
                      </div>
                      <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">99.9%</span>
                  </div>
              </div>
              
              {/* Mobile Only Simple View */}
              <div className="md:hidden flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span>V 1.3.0</span>
              </div>

          </div>
      </div>

    </div>
  );
};

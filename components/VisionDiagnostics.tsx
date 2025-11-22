
import React, { useState, useRef, useMemo } from 'react';
import { ArrowLeft, Camera, Upload, Scan, AlertCircle, CheckCircle, Activity, Microscope, X, Loader2, BookOpen, Search, Bug, Sprout, Droplets, Thermometer, FlaskConical, ChevronRight, ShieldAlert, Wind, Eye, Split, Image as ImageIcon } from 'lucide-react';
import { analyzePlantImage } from '../services/geminiService';

interface VisionDiagnosticsProps {
  onBack: () => void;
}

interface PathogenProfile {
  id: string;
  name: string;
  scientificName?: string;
  imageUrl: string; // New Image Field
  type: 'Fungal' | 'Pest' | 'Nutrient' | 'Viral' | 'Environmental';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  symptoms: string[];
  conditions: string;
  prevention: string;
  organicRemedy: string;
  chemicalRemedy: string;
}

// Helper to generate placeholder images (In production, replace with real asset URLs)
const getImg = (text: string, type: string) => {
    const bg = type === 'Fungal' ? '4c1d95' : type === 'Pest' ? '9f1239' : type === 'Nutrient' ? 'b45309' : '047857';
    return `https://placehold.co/800x500/${bg}/FFFFFF?text=${encodeURIComponent(text)}+Example&font=merriweather`;
};

const PATHOGEN_DB: PathogenProfile[] = [
    {
        id: 'pm',
        name: 'Powdery Mildew',
        scientificName: 'Podosphaera xanthii',
        imageUrl: getImg('Powdery Mildew', 'Fungal'),
        type: 'Fungal',
        severity: 'Medium',
        symptoms: ['White flour-like dust on leaves', 'Stunted growth', 'Leaf curling', 'Chlorotic spots'],
        conditions: 'High humidity spikes at night, low humidity during day, stagnation.',
        prevention: 'Maintain stable RH < 50%, increase airflow, use sulfur burners.',
        organicRemedy: 'Neem oil, Potassium Bicarbonate, Milk/Water spray (1:9).',
        chemicalRemedy: 'Myclobutanil, Propiconazole (Vegetative stage only).'
    },
    {
        id: 'botrytis',
        name: 'Botrytis (Bud Rot)',
        scientificName: 'Botrytis cinerea',
        imageUrl: getImg('Botrytis / Bud Rot', 'Fungal'),
        type: 'Fungal',
        severity: 'Critical',
        symptoms: ['Brown/grey mushy buds', 'Necrotic sugar leaves', 'Fuzzy grey mold', 'Rapid spread'],
        conditions: 'High humidity (>60%) in late flower, cool temperatures, dense canopy.',
        prevention: 'Aggressive dehumidification, defoliation, sanitation.',
        organicRemedy: 'Bacillus subtilis (Serenade), amputation of infected areas.',
        chemicalRemedy: 'None recommended for flowering biomass. Discard infected material.'
    },
    {
        id: 'mites',
        name: 'Spider Mites',
        scientificName: 'Tetranychus urticae',
        imageUrl: getImg('Spider Mites', 'Pest'),
        type: 'Pest',
        severity: 'High',
        symptoms: ['Stippling (white dots) on leaves', 'Fine silk webbing', 'Tiny moving specks under leaf'],
        conditions: 'Hot and dry environments promote rapid breeding.',
        prevention: 'Regular scouting, maintained humidity, predator mites.',
        organicRemedy: 'Beauveria bassiana, Predatory Mites (P. persimilis), Spinosad.',
        chemicalRemedy: 'Abamectin (Strict withdrawal periods apply).'
    },
    {
        id: 'aphids',
        name: 'Aphids',
        scientificName: 'Aphidoidea',
        imageUrl: getImg('Aphid Infestation', 'Pest'),
        type: 'Pest',
        severity: 'Medium',
        symptoms: ['Clusters of soft-bodied insects', 'Honeydew residue (shiny leaves)', 'Ants farming them', 'Yellowing leaves'],
        conditions: 'High nitrogen levels, lack of predators, mild temperatures.',
        prevention: 'Companion planting, ladybugs, lacewings.',
        organicRemedy: 'Insecticidal soaps, Neem oil, Ladybugs.',
        chemicalRemedy: 'Imidacloprid (Systemic - Veg Only).'
    },
    {
        id: 'thrips',
        name: 'Thrips',
        scientificName: 'Frankliniella occidentalis',
        imageUrl: getImg('Thrips Damage', 'Pest'),
        type: 'Pest',
        severity: 'Medium',
        symptoms: ['Silver/bronze scarring on leaves', 'Tiny black fecal specks', 'Deformed new growth'],
        conditions: 'Warm temperatures, low humidity.',
        prevention: 'Blue sticky traps, predatory mites (A. cucumeris).',
        organicRemedy: 'Spinosad (Captain Jacks), Beauveria bassiana.',
        chemicalRemedy: 'Spinetoram.'
    },
    {
        id: 'gnats',
        name: 'Fungus Gnats',
        scientificName: 'Bradysia spp.',
        imageUrl: getImg('Fungus Gnats', 'Pest'),
        type: 'Pest',
        severity: 'Low',
        symptoms: ['Flying insects near soil', 'Larvae eating roots', 'Slow growth'],
        conditions: 'Overwatering, wet topsoil, decaying organic matter.',
        prevention: 'Allow topsoil to dry, bottom water, use yellow sticky traps.',
        organicRemedy: 'BTI (Mosquito Bits), Nematodes (SF), Diatomaceous Earth.',
        chemicalRemedy: 'Pyrethrin drenches.'
    },
    {
        id: 'n-def',
        name: 'Nitrogen Deficiency',
        imageUrl: getImg('Nitrogen Deficiency', 'Nutrient'),
        type: 'Nutrient',
        severity: 'Medium',
        symptoms: ['Yellowing of lower (old) leaves', 'General pale green color', 'Slow growth', 'Leaves dropping'],
        conditions: 'Low EC, pH lockout, or end-of-cycle fade.',
        prevention: 'Balanced feeding schedule, pH monitoring.',
        organicRemedy: 'Fish Emulsion, Blood Meal, Alfalfa tea.',
        chemicalRemedy: 'Calcium Nitrate, Ammonium Nitrate.'
    },
    {
        id: 'mg-def',
        name: 'Magnesium Deficiency',
        imageUrl: getImg('Magnesium Deficiency', 'Nutrient'),
        type: 'Nutrient',
        severity: 'Medium',
        symptoms: ['Interveinal chlorosis (yellowing between veins)', 'Tiger-stripe appearance', 'Lower leaves curl upwards (praying)'],
        conditions: 'Low pH (<5.8), excess Calcium or Potassium (Lockout).',
        prevention: 'Use Cal-Mag supplement, check runoff pH.',
        organicRemedy: 'Epsom Salts (Magnesium Sulfate) foliar spray.',
        chemicalRemedy: 'Magnesium Nitrate, Cal-Mag.'
    },
    {
        id: 'fe-def',
        name: 'Iron Deficiency',
        imageUrl: getImg('Iron Deficiency', 'Nutrient'),
        type: 'Nutrient',
        severity: 'Medium',
        symptoms: ['Bright yellowing of NEW growth', 'Veins remain green (interveinal chlorosis)', 'Bleaching in severe cases'],
        conditions: 'High pH (> 6.5), wet root zone, cold root zone.',
        prevention: 'Maintain pH < 6.2, ensure root aeration.',
        organicRemedy: 'Chelated Iron, Glacial Rock Dust.',
        chemicalRemedy: 'DTPA or EDDHA Iron Chelates.'
    },
    {
        id: 'ca-def',
        name: 'Calcium Deficiency',
        imageUrl: getImg('Calcium Deficiency', 'Nutrient'),
        type: 'Nutrient',
        severity: 'High',
        symptoms: ['Brown irregular spots on new leaves', 'Tip burn', 'Blossom end rot', 'Weak stems'],
        conditions: 'Low transpiration (High Humidity), pH < 6.0, Potassium excess.',
        prevention: 'Ensure airflow, Cal-Mag supplementation.',
        organicRemedy: 'Dolomite Lime (slow), Oyster Shell flour.',
        chemicalRemedy: 'Calcium Nitrate, Cal-Mag supplement.'
    },
    {
        id: 'septoria',
        name: 'Septoria Leaf Spot',
        scientificName: 'Septoria lycopersici',
        imageUrl: getImg('Septoria Leaf Spot', 'Fungal'),
        type: 'Fungal',
        severity: 'High',
        symptoms: ['Yellow spots turning brown/grey', 'Dark borders around spots', 'Starts on lower leaves'],
        conditions: 'Warm, wet, and humid conditions. Splashing water spreads spores.',
        prevention: 'Mulch soil, avoid overhead watering, prune lower leaves.',
        organicRemedy: 'Copper Fungicide, Serenade.',
        chemicalRemedy: 'Chlorothalonil.'
    },
    {
        id: 'root-rot',
        name: 'Root Rot',
        scientificName: 'Pythium spp.',
        imageUrl: getImg('Root Rot', 'Fungal'),
        type: 'Fungal',
        severity: 'Critical',
        symptoms: ['Brown slimy roots', 'Foul smell', 'Wilting despite wet medium'],
        conditions: 'High water temp (>24°C), low dissolved oxygen, anaerobic zones.',
        prevention: 'Water chillers, air stones, H2O2 flushes.',
        organicRemedy: 'Beneficial Bacteria (Hydroguard), H2O2 flush.',
        chemicalRemedy: 'Ridomil Gold (Commercial use only).'
    },
    {
        id: 'russet',
        name: 'Russet Mites',
        scientificName: 'Aceria anthocoptes',
        imageUrl: getImg('Russet Mites', 'Pest'),
        type: 'Pest',
        severity: 'Critical',
        symptoms: ['"Hemp Russeting" (browning)', 'Leaves curl upward (tacoing)', 'Dull matte appearance'],
        conditions: 'Wind dispersion, contaminated clones.',
        prevention: 'Quarantine new cuts, micronized sulfur.',
        organicRemedy: 'Micronized Sulfur (Veg only), Citric Acid sprays.',
        chemicalRemedy: 'Spiromesifen (Oberon) - Strict regulation.'
    }
];

export const VisionDiagnostics: React.FC<VisionDiagnosticsProps> = ({ onBack }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'scan' | 'library'>('scan');
  
  // Scanner State
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Library State
  const [libSearch, setLibSearch] = useState('');
  const [selectedPathogen, setSelectedPathogen] = useState<PathogenProfile | null>(null);

  const filteredLibrary = useMemo(() => {
      const q = libSearch.toLowerCase();
      return PATHOGEN_DB.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.type.toLowerCase().includes(q) ||
        p.symptoms.some(s => s.toLowerCase().includes(q))
      );
  }, [libSearch]);

  // Comparison Logic
  const matchedPathogen = useMemo(() => {
      if (!analysis || !analysis.diagnosis) return null;
      // Simple fuzzy find
      const diag = analysis.diagnosis.toLowerCase();
      return PATHOGEN_DB.find(p => diag.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(diag));
  }, [analysis]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        processFile(file);
    }
  };

  const processFile = (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          setImage(reader.result as string);
          runAnalysis(reader.result as string);
      };
      reader.readAsDataURL(file);
  };

  const runAnalysis = async (base64Full: string) => {
      setIsScanning(true);
      setAnalysis(null);
      setError(null);

      try {
          const base64Data = base64Full.split(',')[1];
          const mimeType = base64Full.split(';')[0].split(':')[1];
          
          const result = await analyzePlantImage(base64Data, mimeType);
          setAnalysis(result);
      } catch (err) {
          console.error(err);
          setError("Failed to analyze image. Please try again.");
      } finally {
          setIsScanning(false);
      }
  };

  return (
    <div className="flex h-full w-full bg-slate-50/50 dark:bg-[#040808] text-slate-900 dark:text-slate-100 overflow-hidden relative animate-in fade-in duration-500 font-sans">
      
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-20 border-b border-slate-200 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-xl flex items-center px-8 justify-between z-20">
         <div className="flex items-center gap-6">
            <button onClick={onBack} className="group w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-chloris-500 transition-colors">
                <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-red-400 border border-rose-200 dark:border-rose-800/50">
                    <Scan className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                    <h1 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white font-display uppercase">Vision Diagnostics</h1>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">AI Pathology Engine</span>
                </div>
            </div>
         </div>

         {/* Tab Switcher */}
         <div className="flex bg-slate-100 dark:bg-white/10 p-1 rounded-lg border border-slate-200 dark:border-white/5">
             <button 
                onClick={() => setActiveTab('scan')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    activeTab === 'scan' 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
             >
                 <Camera className="w-3 h-3" /> AI Scanner
             </button>
             <button 
                onClick={() => setActiveTab('library')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    activeTab === 'library' 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
             >
                 <BookOpen className="w-3 h-3" /> Reference Library
             </button>
         </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 mt-20 h-[calc(100%-5rem)] overflow-hidden relative">
          
          {/* --- VIEW 1: AI SCANNER --- */}
          {activeTab === 'scan' && (
            <div className="flex flex-col lg:flex-row h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* LEFT: SCANNING AREA */}
                <div className="flex-1 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                    {image ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img src={image} alt="Scan Target" className="max-h-full max-w-full object-contain opacity-80" />
                            
                            {/* Scanning Effect */}
                            {isScanning && (
                                <div className="absolute inset-0 z-10">
                                    <div className="w-full h-1 bg-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-scan absolute top-0"></div>
                                    <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay"></div>
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-xs text-white font-mono flex items-center gap-2 border border-white/10">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Processing Neural Network...
                                    </div>
                                </div>
                            )}

                            {/* Reset Button */}
                            {!isScanning && (
                                <button 
                                    onClick={() => { setImage(null); setAnalysis(null); }}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors border border-white/10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center p-10">
                            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <Camera className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors relative z-10" />
                            </div>
                            <h3 className="text-xl font-display font-bold text-white mb-2">Upload Specimen</h3>
                            <p className="text-sm text-slate-400 max-w-xs mx-auto mb-8">
                                Capture a clear photo of the leaf, stem, or canopy. 
                                Ensure good lighting for accurate diagnosis.
                            </p>
                            
                            <div className="flex gap-4 justify-center">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" /> Select File
                                </button>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileUpload}
                            />
                        </div>
                    )}
                </div>

                {/* RIGHT: ANALYSIS RESULTS */}
                <div className="w-full lg:w-[500px] bg-white dark:bg-[#0c0e0e] border-l border-slate-200 dark:border-white/10 overflow-y-auto custom-scrollbar flex flex-col z-10 shadow-xl">
                    {!analysis ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-slate-400 opacity-60">
                            <Microscope className="w-16 h-16 mb-4 stroke-1" />
                            <p className="text-sm font-mono uppercase tracking-widest">Awaiting Scan Data</p>
                        </div>
                    ) : (
                        <div className="p-8 space-y-8 animate-in slide-in-from-right duration-500">
                            {/* Diagnosis Header */}
                            <div>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-4 ${
                                    analysis.isHealthy 
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200' 
                                    : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-200'
                                }`}>
                                    {analysis.isHealthy ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                    {analysis.isHealthy ? 'Healthy Specimen' : 'Pathology Detected'}
                                </div>
                                <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white leading-tight">
                                    {analysis.diagnosis}
                                </h2>
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="h-1.5 w-24 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${analysis.confidence}%` }}></div>
                                    </div>
                                    <span className="text-xs font-mono text-slate-500">{analysis.confidence}% Match</span>
                                </div>
                            </div>

                            {/* Visual Comparison (New Feature) */}
                            {matchedPathogen && (
                                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20">
                                    <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
                                        <Split className="w-4 h-4" />
                                        <h3 className="text-xs font-bold uppercase tracking-widest">Visual Match Comparison</h3>
                                    </div>
                                    <div className="relative rounded-lg overflow-hidden h-40 border border-indigo-200 dark:border-indigo-500/30 group">
                                        <img 
                                            src={matchedPathogen.imageUrl} 
                                            alt="Reference" 
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-bold flex items-center gap-2">
                                                <Eye className="w-4 h-4" /> Textbook Example
                                            </span>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-[10px] text-indigo-800 dark:text-indigo-300 leading-snug">
                                        The diagnosed symptoms match the visual markers for <strong>{matchedPathogen.name}</strong> in our database.
                                    </p>
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="space-y-6">
                                {!analysis.isHealthy && (
                                    <div className="p-5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Identified Symptoms</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.symptoms?.map((sym: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-white dark:bg-black/40 rounded text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                                                    {sym}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Root Cause
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {analysis.cause}
                                    </p>
                                </div>

                                <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20">
                                    <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">
                                        Recommended Treatment
                                    </h3>
                                    <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
                                        {analysis.remedy}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          )}

          {/* --- VIEW 2: PATHOGEN LIBRARY --- */}
          {activeTab === 'library' && (
              <div className="flex h-full animate-in fade-in duration-500">
                  {/* Library Sidebar */}
                  <div className="w-full md:w-[400px] border-r border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0c0c]/80 backdrop-blur-md flex flex-col z-10 shadow-xl">
                      <div className="p-6 border-b border-slate-100 dark:border-white/5">
                          <div className="relative">
                              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                              <input 
                                type="text" 
                                placeholder="Search pathogens..." 
                                value={libSearch}
                                onChange={(e) => setLibSearch(e.target.value)}
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-chloris-500 transition-colors"
                              />
                          </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                          {filteredLibrary.map(item => (
                              <div 
                                key={item.id} 
                                onClick={() => setSelectedPathogen(item)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all group hover:shadow-md flex gap-3 items-start ${
                                    selectedPathogen?.id === item.id 
                                    ? 'bg-white dark:bg-white/10 border-chloris-500 ring-1 ring-chloris-500/20' 
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                                }`}
                              >
                                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100 dark:border-white/10 bg-slate-100 dark:bg-white/5">
                                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                            item.type === 'Fungal' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-purple-200' :
                                            item.type === 'Pest' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-200' :
                                            'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200'
                                        }`}>
                                            {item.type}
                                        </span>
                                        <span className={`text-[10px] font-bold ${
                                            item.severity === 'Critical' ? 'text-rose-500' :
                                            item.severity === 'High' ? 'text-orange-500' :
                                            'text-slate-400'
                                        }`}>
                                            {item.severity}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</h3>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  
                  {/* Detailed Profile View */}
                  <div className="flex-1 bg-slate-50 dark:bg-[#060909] overflow-y-auto custom-scrollbar">
                      {selectedPathogen ? (
                          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                              {/* Hero Image */}
                              <div className="h-64 w-full relative">
                                  <img src={selectedPathogen.imageUrl} alt={selectedPathogen.name} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#060909] to-transparent opacity-80"></div>
                                  <div className="absolute bottom-0 left-0 p-8 w-full">
                                      <div className="flex items-center justify-between">
                                          <div>
                                              <h2 className="text-4xl font-display font-bold text-white mb-2 drop-shadow-md">{selectedPathogen.name}</h2>
                                              <div className="flex items-center gap-2 text-sm font-mono text-slate-300">
                                                  <span>{selectedPathogen.scientificName}</span>
                                                  <span>•</span>
                                                  <span className="text-rose-400">{selectedPathogen.type} Pathogen</span>
                                              </div>
                                          </div>
                                          <div className="hidden md:flex w-14 h-14 rounded-xl bg-white/10 backdrop-blur border border-white/20 items-center justify-center">
                                              {selectedPathogen.type === 'Pest' ? <Bug className="w-8 h-8 text-rose-400" /> : 
                                              selectedPathogen.type === 'Fungal' ? <Sprout className="w-8 h-8 text-purple-400" /> : 
                                              <Thermometer className="w-8 h-8 text-amber-400" />}
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              <div className="p-8 max-w-4xl mx-auto space-y-8">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {/* Symptoms */}
                                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                              <Activity className="w-4 h-4" /> Clinical Symptoms
                                          </h3>
                                          <ul className="space-y-2">
                                              {selectedPathogen.symptoms.map((sym, i) => (
                                                  <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></div>
                                                      {sym}
                                                  </li>
                                              ))}
                                          </ul>
                                      </div>

                                      {/* Conditions */}
                                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                              <Wind className="w-4 h-4" /> Environmental Vectors
                                          </h3>
                                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                              {selectedPathogen.conditions}
                                          </p>
                                          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-500/20 text-xs text-indigo-800 dark:text-indigo-200">
                                              <strong>Prevention:</strong> {selectedPathogen.prevention}
                                          </div>
                                      </div>
                                  </div>

                                  {/* Treatment Plan */}
                                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                      <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-700">
                                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                              <ShieldAlert className="w-4 h-4" /> Remediation Protocol
                                          </h3>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-700">
                                          <div className="p-6">
                                              <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-500">
                                                  <Sprout className="w-4 h-4" />
                                                  <span className="text-xs font-bold uppercase">Organic / Biological</span>
                                              </div>
                                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                  {selectedPathogen.organicRemedy}
                                              </p>
                                          </div>
                                          <div className="p-6 bg-slate-50/50 dark:bg-white/[0.02]">
                                              <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-500">
                                                  <FlaskConical className="w-4 h-4" />
                                                  <span className="text-xs font-bold uppercase">Chemical / Synthetic</span>
                                              </div>
                                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                  {selectedPathogen.chemicalRemedy}
                                              </p>
                                          </div>
                                      </div>
                                  </div>

                              </div>
                          </div>
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                              <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <ImageIcon className="w-10 h-10" />
                              </div>
                              <p className="text-sm font-mono uppercase tracking-widest">Select a pathogen to view profile</p>
                          </div>
                      )}
                  </div>
              </div>
          )}
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

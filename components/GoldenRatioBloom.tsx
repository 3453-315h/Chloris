
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Play, Pause, RefreshCw, Settings2, Flower, Info, Sigma, Leaf, Sun } from 'lucide-react';

interface GoldenRatioBloomProps {
  onBack: () => void;
}

type PresetType = 'succulent' | 'sunflower' | 'dahlia' | 'mathematical';

// The Golden Angle
const GOLDEN_ANGLE = 137.5077640500378546463487;

const PRESETS: Record<PresetType, { label: string, c: number, max: number, angle: number, icon: any }> = {
    succulent: { label: 'Echeveria', c: 16, max: 250, angle: 137.5, icon: Leaf },
    sunflower: { label: 'Helianthus', c: 10, max: 1200, angle: 137.508, icon: Sun },
    dahlia: { label: 'Dahlia', c: 12, max: 700, angle: 137.5, icon: Flower },
    mathematical: { label: 'Phyllotaxis', c: 6, max: 1500, angle: 137.508, icon: Sigma }
};

// Deterministic noise function to add organic variance without animation jitter
const getNoise = (index: number) => {
    const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
};

export const GoldenRatioBloom: React.FC<GoldenRatioBloomProps> = ({ onBack }) => {
  // Simulation State
  const [preset, setPreset] = useState<PresetType>('succulent');
  const [nodeCount, setNodeCount] = useState(0);
  const [maxNodes, setMaxNodes] = useState(PRESETS.succulent.max);
  const [divergenceAngle, setDivergenceAngle] = useState(PRESETS.succulent.angle);
  const [c, setC] = useState(PRESETS.succulent.c); // Spread factor
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  const animationRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Apply preset defaults
  const applyPreset = (p: PresetType) => {
      setPreset(p);
      setC(PRESETS[p].c);
      setMaxNodes(PRESETS[p].max);
      setDivergenceAngle(PRESETS[p].angle);
      setNodeCount(0);
      setIsPlaying(true);
  };

  // Animation Loop
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setNodeCount(prev => {
          if (prev >= maxNodes) {
            return prev;
          }
          // Variable growth speed based on total count
          const speed = maxNodes > 1000 ? 6 : 2;
          return Math.min(prev + speed, maxNodes); 
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, maxNodes]);

  const handleReset = () => {
    setIsPlaying(false);
    setNodeCount(0);
    setDivergenceAngle(GOLDEN_ANGLE);
  };

  // --- RENDERING ENGINE ---
  const nodes = useMemo(() => {
    const items = [];
    const cx = 400;
    const cy = 300;

    const isOrganic = preset !== 'mathematical';
    
    // Z-Index Strategy: 
    // Succulents/Dahlias: Inner leaves on top of outer leaves. Render Max -> 0.
    // Sunflower: Seeds on top of petals. Render Max -> 0.
    const start = isOrganic ? nodeCount : 0;
    const end = isOrganic ? 0 : nodeCount;
    const step = isOrganic ? -1 : 1;

    const hasSteps = isOrganic ? start > end : start < end;

    if (hasSteps) {
        for (let n = start; n !== end; n += step) {
            if (n === 0) continue;

            // 1. Phyllotaxis Math
            const r = c * Math.sqrt(n);
            const theta = n * (divergenceAngle * Math.PI / 180);
            
            const x = cx + r * Math.cos(theta);
            const y = cy + r * Math.sin(theta);
            
            // Organic Rotation Variance (±3 degrees)
            const noise = getNoise(n);
            const variance = (noise - 0.5) * 6; 
            const rotation = (theta * 180 / Math.PI) + 90 + (isOrganic ? variance : 0);

            // 2. Age Normalization (0 = Center/New, 1 = Edge/Old)
            const age = n / maxNodes;
            
            let element = null;

            if (preset === 'succulent') {
                // ECHEVERIA MODE
                // Geometry: Fleshy, thick teardrops.
                // Depth: Drop shadows essential for stacking look.
                
                const baseSize = 15 + (age * 50);
                const scaleNoise = 1 + ((noise - 0.5) * 0.1); // ±5% size variance
                const size = baseSize * scaleNoise;

                // Gradients:
                // Inner: Pale Mint/Blue.
                // Outer: Stress colors (Pink/Purple tips).
                const hue = 160 - (age * 200); // 160 (Mint) -> -40 (Magenta/Red)
                const sat = 30 + (age * 40);
                const light = 90 - (age * 50);
                
                const fill = `hsl(${hue}, ${sat}%, ${light}%)`;
                const stroke = `hsl(${hue}, ${sat}%, ${light - 20}%)`;

                element = (
                    <path
                        key={n}
                        d={`M0,0 
                           Q${size * 0.6},-${size * 0.2} ${size},0 
                           Q${size * 0.6},${size * 0.2} 0,0`}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="1"
                        filter="url(#organic-shadow)"
                        transform={`translate(${x},${y}) rotate(${rotation - 90})`}
                    />
                );
            } else if (preset === 'sunflower') {
                // SUNFLOWER MODE
                // Differentiate between disc florets (seeds) and ray florets (petals)
                
                const isPetal = age > 0.93; // Only the outer 7% are ray florets
                
                if (isPetal) {
                    // RAY FLORET (Yellow Petal)
                    // Long, elliptical, pointing outward
                    const pLen = 60 + (noise * 20);
                    const pWid = 15 + (noise * 5);
                    
                    // Golden Yellows
                    const h = 45 + (noise * 10);
                    const s = 95;
                    const l = 50 + (age * 10);
                    
                    element = (
                         <path
                            key={n}
                            d={`M0,0 
                               C${pWid},-${pLen * 0.3} ${pWid * 0.5},-${pLen} 0,-${pLen} 
                               C-${pWid * 0.5},-${pLen} -${pWid},-${pLen * 0.3} 0,0`}
                            fill={`hsl(${h}, ${s}%, ${l}%)`}
                            stroke="#b45309"
                            strokeWidth="0.5"
                            transform={`translate(${x},${y}) rotate(${rotation + 180})`}
                            className="opacity-90"
                        />
                    );
                } else {
                    // DISC FLORET (Seed)
                    // Small, packed rhomboid/circle
                    const sSize = (3 + (age * 5)) * (1 + (noise * 0.2));
                    
                    // Brown/Black Gradient
                    // Center is greener/lighter (new), Edge is darker/brown (mature)
                    const isCenter = age < 0.2;
                    const h = isCenter ? 80 : 30;
                    const s = isCenter ? 60 : 40;
                    const l = isCenter ? 20 : 10 + (noise * 5);
                    
                    element = (
                        <circle
                            key={n}
                            r={sSize}
                            cx={0} cy={0}
                            fill={`hsl(${h}, ${s}%, ${l}%)`}
                            stroke="rgba(0,0,0,0.2)"
                            strokeWidth="0.5"
                            transform={`translate(${x},${y})`}
                        />
                    );
                }

            } else if (preset === 'dahlia') {
                // DAHLIA MODE
                // Complex folded petals (Quilled)
                
                const size = 10 + (age * 40);
                
                // Gradient: Deep center -> Bright tips
                // E.g. Dark Purple -> Bright Pink/Orange
                const hue = 320 + (age * 40); 
                const light = 20 + (age * 40);
                const fill = `hsl(${hue}, 85%, ${light}%)`;
                const stroke = `hsl(${hue}, 90%, ${Math.max(0, light - 20)}%)`;

                // Tubular shape simulation using bézier
                element = (
                    <path
                        key={n}
                        d={`M0,0 
                           C${size*0.3},-${size*0.3} ${size},-${size*0.1} ${size},0 
                           C${size},${size*0.1} ${size*0.3},${size*0.3} 0,0`}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="0.75"
                        filter="url(#organic-shadow)"
                        transform={`translate(${x},${y}) rotate(${rotation - 90})`}
                    />
                )
            } else {
                // MATHEMATICAL
                const size = 2 + (age * 5);
                const alpha = 0.4 + (age * 0.6);
                const fill = `rgba(20, 184, 166, ${alpha})`; // Teal-500
                
                element = (
                    <circle
                        key={n}
                        cx={x} cy={y} r={size}
                        fill={fill}
                        className="transition-all duration-0"
                    />
                )
            }

            items.push(element);
        }
    }
    return items;
  }, [nodeCount, divergenceAngle, c, preset, maxNodes]);

  return (
    <div className="flex h-full w-full bg-slate-50/50 dark:bg-[#040808] text-slate-900 dark:text-slate-100 overflow-hidden relative animate-in fade-in duration-500 font-sans">
      
      {/* SIDEBAR CONTROLS */}
      <div className="w-full lg:w-[350px] bg-white/80 dark:bg-[#0a0c0c]/80 backdrop-blur-md border-r border-slate-200 dark:border-white/5 flex-shrink-0 h-full overflow-y-auto p-6 space-y-8 custom-scrollbar z-20 shadow-xl shadow-slate-200/50 dark:shadow-none">
        
        {/* Header */}
        <div className="flex items-center gap-2 text-slate-400 pb-4 border-b border-slate-100 dark:border-white/5">
            <Sigma className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Algorithmic Botany</h2>
        </div>

        {/* Educational Block */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 p-5 rounded-xl border border-amber-100 dark:border-amber-800/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Info className="w-20 h-20" />
            </div>
            <h3 className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2 relative z-10">
                The Golden Angle
            </h3>
            <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed relative z-10">
                Nature approximates the Golden Ratio (<strong>φ ≈ 1.618</strong>) to maximize packing efficiency. 
                By arranging growth at <strong>137.5°</strong>, plants ensure zero overlap, maximizing light exposure.
            </p>
        </div>

        {/* Controls */}
        <div className="space-y-8">
            
            {/* Presets */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Biological Model</label>
                <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(PRESETS) as PresetType[]).map(key => {
                        const P = PRESETS[key];
                        return (
                            <button
                                key={key}
                                onClick={() => applyPreset(key)}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                                    preset === key 
                                    ? 'bg-chloris-50 dark:bg-chloris-900/30 border-chloris-500 text-chloris-700 dark:text-chloris-400 ring-1 ring-chloris-500/20' 
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/10'
                                }`}
                            >
                                <P.icon className="w-5 h-5" />
                                <span className="text-[10px] font-bold uppercase">{P.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Parameters */}
            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Settings2 className="w-4 h-4" /> Genetic Params
                    </h3>
                    <button 
                        onClick={handleReset} 
                        className="text-[10px] font-bold uppercase text-slate-500 hover:text-chloris-500 flex items-center gap-1"
                    >
                        <RefreshCw className="w-3 h-3" /> Clear
                    </button>
                </div>

                {/* Angle Slider */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Divergence (θ)</label>
                        <span className={`font-mono text-xs font-bold px-2 py-1 rounded-md border transition-colors ${
                            Math.abs(divergenceAngle - GOLDEN_ANGLE) < 0.05
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50' 
                            : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/5'
                        }`}>
                            {divergenceAngle.toFixed(3)}°
                        </span>
                    </div>
                    <input 
                        type="range" min="137.0" max="138.0" step="0.001"
                        value={divergenceAngle}
                        onChange={(e) => setDivergenceAngle(parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400">
                        <span>137.0°</span>
                        <span className="text-amber-500 font-bold cursor-pointer hover:underline" onClick={() => setDivergenceAngle(GOLDEN_ANGLE)}>Perfect (137.5°)</span>
                        <span>138.0°</span>
                    </div>
                </div>

                {/* Node Count */}
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Biomass Limit</label>
                        <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">{maxNodes}</span>
                    </div>
                    <input 
                        type="range" min="100" max="2000" step="50"
                        value={maxNodes}
                        onChange={(e) => setMaxNodes(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>

                 {/* Spread */}
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Spread Factor (c)</label>
                        <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">{c}</span>
                    </div>
                    <input 
                        type="range" min="2" max="20" step="0.5"
                        value={c}
                        onChange={(e) => setC(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>
            </div>
        </div>
        
        {/* Footer Action */}
        <div className="pt-4 mt-auto">
            <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-full py-4 rounded-xl font-display font-bold text-sm tracking-widest uppercase transition-all shadow-lg flex items-center justify-center gap-2
                ${isPlaying 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200' 
                    : 'bg-gradient-to-r from-chloris-600 to-chloris-500 hover:from-chloris-500 hover:to-chloris-400 text-white'
                }`}
            >
                {isPlaying ? <><Pause className="w-4 h-4" /> Pause Simulation</> : <><Play className="w-4 h-4" /> Resume Growth</>}
            </button>
        </div>
      </div>

      {/* MAIN VISUALIZER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50 dark:bg-[#060909]">
        
        {/* Header overlay */}
        <header className="absolute top-0 left-0 right-0 h-20 border-b border-slate-200 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-xl flex items-center px-8 justify-between z-20">
            <div className="flex items-center gap-6">
                <button onClick={onBack} className="group w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-chloris-500 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-100 to-rose-100 dark:from-fuchsia-900/20 dark:to-rose-900/20 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-800/50 shadow-sm">
                        <Flower className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white font-display uppercase">Golden Ratio Bloom</h1>
                        <span className="text-[10px] text-slate-500 font-mono">Generative Phyllotaxis Engine</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                     <label className="text-[10px] font-bold uppercase text-slate-500">Overlay Guide</label>
                     <button 
                        onClick={() => setShowGuide(!showGuide)} 
                        className={`w-10 h-5 rounded-full flex items-center transition-colors p-1 ${showGuide ? 'bg-chloris-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                     >
                         <div className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${showGuide ? 'translate-x-5' : ''}`}></div>
                     </button>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Elements</span>
                    <span className="font-mono text-xl font-bold text-slate-700 dark:text-slate-200">{nodeCount}</span>
                </div>
            </div>
        </header>

        {/* SVG Canvas */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Ambient Glow based on preset */}
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] opacity-30 pointer-events-none ${
                    preset === 'succulent' ? 'from-emerald-200/50 via-transparent to-transparent dark:from-emerald-900/30' :
                    preset === 'sunflower' ? 'from-amber-200/50 via-transparent to-transparent dark:from-amber-900/30' :
                    'from-fuchsia-200/50 via-transparent to-transparent dark:from-fuchsia-900/30'
                }`}></div>
                
                <svg 
                    ref={svgRef}
                    viewBox="0 0 800 600" 
                    className="w-full h-full max-w-5xl max-h-[800px] drop-shadow-2xl"
                    preserveAspectRatio="xMidYMid meet"
                >
                    {/* Definitions for filters */}
                    <defs>
                        <filter id="organic-shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                            <feOffset dx="0" dy="1" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.3" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Render Nodes */}
                    <g>{nodes}</g>
                    
                    {/* Guide Overlay */}
                    {showGuide && (
                        <g className="animate-in fade-in duration-500">
                            <circle cx="400" cy="300" r="5" fill="red" />
                            {/* Spiral approximation lines */}
                            {[1, 2, 3, 5, 8, 13].map(i => (
                                <path 
                                    key={i}
                                    d={`M400,300 q${i*10},${i*10} ${i*20},${i*5}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="0.5"
                                    className="text-slate-400 opacity-50"
                                    transform={`rotate(${i * 137.5}, 400, 300)`}
                                />
                            ))}
                        </g>
                    )}
                </svg>
                
                {/* Formula HUD */}
                <div className="absolute bottom-8 left-8 p-4 rounded-xl bg-white/80 dark:bg-black/40 backdrop-blur border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-500 shadow-lg hidden md:block">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-white/10">
                        <span className="font-bold text-slate-700 dark:text-white uppercase">Formula</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex gap-4"><span className="text-slate-400">r</span> <span>= c × √n</span></div>
                        <div className="flex gap-4"><span className="text-slate-400">θ</span> <span>= n × {divergenceAngle.toFixed(2)}°</span></div>
                        <div className="flex gap-4"><span className="text-slate-400">x</span> <span>= r × cos(θ)</span></div>
                        <div className="flex gap-4"><span className="text-slate-400">y</span> <span>= r × sin(θ)</span></div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};


import React from 'react';

interface IconProps {
  className?: string;
}

export const ChlorisIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="budGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9"/>
        </linearGradient>
        <linearGradient id="leafGradient" x1="5" y1="5" x2="19" y2="14" gradientUnits="userSpaceOnUse">
           {/* Updated to Fern Palette - #75ab86 (Chloris 400) and #3f6d50 (Chloris 600) */}
           <stop offset="0%" stopColor="#75ab86" stopOpacity="0.8" />
           <stop offset="100%" stopColor="#3f6d50" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      
      {/* The Enclosure (Technical Simulation Boundary) - Thinner, more precise */}
      <path 
        d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z" 
        className="stroke-slate-300 dark:stroke-slate-600" 
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      
      {/* Inner Orbital Ring */}
      <path 
        d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19Z" 
        className="stroke-chloris-400/30" 
        strokeWidth="1"
      />

      {/* The Fresh Growth (Chloris) - Geometric & Sharp */}
      <g className="origin-bottom transition-transform duration-1000 hover:scale-110">
        {/* Central Stem/Bud */}
        <path 
          d="M12 19V11C12 11 10.5 8 12 3C13.5 8 12 11 12 11" 
          stroke="url(#budGradient)" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        
        {/* Left Leaf - Stylized */}
        <path 
          d="M12 15C12 15 8.5 15 6.5 12C4.5 9 6 6 6 6C6 6 8.5 7 10.5 10C12 13 12 15 12 15Z" 
          className="fill-emerald-400 dark:fill-emerald-500"
          fillOpacity="0.7"
        />
        
        {/* Right Leaf - Stylized */}
        <path 
          d="M12 15C12 15 15.5 15 17.5 12C19.5 9 18 6 18 6C18 6 15.5 7 13.5 10C12 13 12 15 12 15Z" 
          className="fill-teal-400 dark:fill-teal-500"
          fillOpacity="0.7"
        />
        
        {/* Seed Point */}
        <circle cx="12" cy="15" r="1.5" className="fill-white dark:fill-slate-900" />
        <circle cx="12" cy="15" r="0.5" className="fill-chloris-600" />
      </g>
    </svg>
  );
};


import React, { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { PhenologyEngine } from './components/PhenologyEngine';
import { GeneticMapper } from './components/GeneticMapper';
import { ClimateLab } from './components/ClimateLab';
import { MarketYields } from './components/MarketYields';
import { CultivarDB } from './components/CultivarDB';
import { NutrientAlchemy } from './components/NutrientAlchemy';
import { VisionDiagnostics } from './components/VisionDiagnostics';
import { GoldenRatioBloom } from './components/GoldenRatioBloom';
import { Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  // Simple view state management
  const [currentView, setCurrentView] = useState<string>('menu');
  const [isDark, setIsDark] = useState(true);

  // Handle Theme Toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Navigation handlers
  const navigateTo = (view: string) => {
    setCurrentView(view);
  };

  const goBack = () => {
    setCurrentView('menu');
  };

  // Render logic
  const renderView = () => {
      switch(currentView) {
          case 'phenology':
              return <PhenologyEngine onBack={goBack} />;
          case 'genetics':
              return <GeneticMapper onBack={goBack} />;
          case 'climatelab':
              return <ClimateLab onBack={goBack} />;
          case 'marketyields':
              return <MarketYields onBack={goBack} />;
          case 'cultivardb':
              return <CultivarDB onBack={goBack} />;
          case 'nutrientalchemy':
              return <NutrientAlchemy onBack={goBack} />;
          case 'visiondiagnostics':
              return <VisionDiagnostics onBack={goBack} />;
          case 'goldenratio':
              return <GoldenRatioBloom onBack={goBack} />;
          case 'menu':
          default:
              return <MainMenu onNavigate={navigateTo} />;
      }
  }

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-transparent text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      {renderView()}

      {/* Theme Changer Button - Left Hand Side */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-110 hover:shadow-emerald-500/20 transition-all duration-300"
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default App;

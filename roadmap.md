# FloraChronos Roadmap

## Phase 1: Foundation (Core Engine) - *COMPLETE*
- [x] **Phenology Engine**: GDD, DLI, and Photoperiod logic.
- [x] **Crop Database**: 50+ profiles with physiological constants.
- [x] **AI Integration**: Gemini 2.5 Flash for logic and reasoning.
- [x] **UI/UX**: Glassmorphism design, Responsive Input Panel.
- [x] **Visualization**: Interactive Area and Bar charts.
- [x] **Basic Persistence**: LocalStorage for saving simulation runs.
- [x] **Comparison Engine**: Side-by-side diffing of historical runs.

## Phase 1.5: Foundation Hardening (Immediate Next Steps)
*Focus: Usability, Data Portability, and Trust.*
- [ ] **Global Unit System**: 
    - Toggle between Metric (C°, L) and Imperial (F°, Gal).
    - Auto-convert inputs and database values.
- [ ] **Report Export**:
    - "Download Recipe" button generating a PDF/CSV of the growth cycle.
    - Printable timeline for greenhouse operators.
- [ ] **Smart Presets**:
    - One-click configurations for "Seedling", "Vegetative", "Generative", and "Finishing" stages.
    - USDA Hardiness Zone selector for outdoor temperature auto-fill.
- [ ] **Input Guardrails**:
    - Client-side physics validation (e.g., Dew Point cannot exceed Temp).
    - Warning banners for impossible biological parameters before AI cost is incurred.

## Phase 2: Expansion (Scientific Modules)
- [ ] **Genetic Mapper Module** (Mockup Complete):
    - Implement backend breeding logic.
    - Visual Punnett Squares for trait inheritance.
- [ ] **Climate Lab Module** (Mockup Complete):
    - Complete Psychrometric Chart integration.
    - HVAC sizing calculator (BTU/hr load).
- [ ] **Nutrient Alchemy** (Mockup Complete):
    - Mulder’s Chart visualization for nutrient antagonism.
    - Reservoir mixing calculator.

## Phase 3: Integration (Connectivity)
- [ ] **Real-Time Weather Data**:
    - Integrate OpenWeatherMap/NOAA APIs for live outdoor simulations.
- [ ] **Market Yields Module**:
    - Connect projected harvest dates with historical market pricing tickers.
    - ROI calculator based on localized energy costs.
- [ ] **Custom Cultivar Creator**:
    - Interface for users to contribute new strains to the DB.

## Phase 4: Advanced Tech (The Horizon)
- [ ] **Computer Vision (VisionDiagnostics)**:
    - Upload leaf photos for deficiency detection (Nitrogen, Cal-Mag, Pests).
    - AI-driven "Harvest Readiness" scanner (Trichome analysis).
- [ ] **IoT Sensor Webhooks**:
    - Ingest MQTT data from Home Assistant/TrolMaster.
    - Real-time "Alerting" if live sensors deviate from the Simulation plan.
- [ ] **PWA Offline Mode**:
    - Full offline support for field workers without signal.

## Vision
To become the standard operating system for precision agriculture and hobbyist botany, bridging the gap between raw academic data and actionable grower insights.
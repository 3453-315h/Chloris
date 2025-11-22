# FloraChronos - Project Review

## 1. Executive Summary
FloraChronos is an advanced computational biology platform designed to simulate plant phenology. Unlike simple garden planners, it utilizes Growing Degree Days (GDD), Daily Light Integral (DLI), and Photoperiodism models to calculate precise growth stages. The core logic is powered by the Google Gemini 2.5 Flash model, anchored by a rigid system instruction set derived from specific scientific literature (PMC10004775, HortScience, etc.).

## 2. Architecture Overview

### Frontend
*   **Framework**: React 19 (Functional Components + Hooks).
*   **Styling**: Tailwind CSS with custom animations and a "Glassmorphism" UI design language.
*   **Routing**: Internal state-based routing (SPA) managed in `App.tsx` to switch between the Main Menu and specific Modules.
*   **Visualization**: `Recharts` for rendering GDD accumulation areas and DLI bar charts.
*   **Icons**: `lucide-react` for consistent iconography.

### Data Layer
*   **Crop Database (`services/cropDatabase.ts`)**: A robust, in-memory object-relational mapping of over 50+ crop varieties. It stores physiological constants such as:
    *   Base Temperature ($T_{base}$)
    *   Optimal Temperature ($T_{opt}$)
    *   Photoperiodic Response (Short-Day, Long-Day, Day-Neutral)
    *   DLI Requirements (Min/Opt)
    *   Scientific Classification

### Simulation Engine (`services/geminiService.ts`)
*   **AI Model**: Google Gemini 2.5 Flash.
*   **Logic**: The application constructs a detailed prompt containing the specific crop's physiological constraints and the user's environmental inputs.
*   **Validation**: The AI is instructed to return strict JSON based on specific biological rules (e.g., inhibiting flowering if photoperiod thresholds are not met).

## 3. Key Features
*   **Phenology Engine**: Calculates specific start/end dates for germination, vegetative, flowering, and harvest stages.
*   **Environmental Stress Analysis**: Real-time feedback on DLI (too low/high) and photoperiod compatibility.
*   **Scientific Grounding**: Simulations are explicitly referenced against known datasets (e.g., Cannabis sativa constraints from PMC10004775).
*   **Interactive Dashboard**: Visualizes the "Invisible" factors of plant growth (Thermal Time accumulation).

## 4. Code Quality & Aesthetics
*   **Modular Design**: Components are separated into logical units (`InputPanel`, `ResultsDashboard`, `Visualizations`).
*   **Type Safety**: Comprehensive TypeScript interfaces for `CropProfile`, `ClimateConfig`, and `SimulationResult`.
*   **UX/UI**: The application features a high-end, dark-mode aesthetic suitable for professional agricultural software. Input validation provides immediate visual feedback (e.g., red warning banners for inhibitory photoperiods).

## 5. Conclusion
FloraChronos represents a significant step forward in accessible agricultural modeling. By combining static scientific data (the database) with generative AI's reasoning capabilities (the simulation), it bridges the gap between raw data and actionable insights.
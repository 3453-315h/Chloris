
# Cultivar Database (CultivarDB) Implementation

## Overview
The Cultivar Database is the central repository for all biological entities within FloraChronos. While the `PhenologyEngine` focuses on *time* and `ClimateLab` focuses on *physics*, CultivarDB focuses on **identity**.

It acts as a digital "Seed Bank," providing users with deep insights into the genetic lineage, chemical profile, and resistance traits of specific cultivars.

## Features

### 1. Genomic Passport
Visualizes high-level genetic data without requiring massive raw sequencing files.
*   **Lineage**: Displays Mother/Father/Breeder info.
*   **Generation**: Tracks stability (F1, S1, IBL, Landrace).
*   **Genotype Tags**: Visible badges for dominant alleles (e.g., `LL` for Broad Leaf).

### 2. Chemotype Radar
Uses a Radar (Spider) Chart to visualize the flavor/effect profile.
*   **Axes**: Myrcene, Limonene, Caryophyllene, Pinene, Linalool.
*   **Data**: Normalized 0-100 scale relative to species maximums.

### 3. Resistance Profiler
A quick-glance stat block showing the plant's hardiness against:
*   Mold (Botrytis/PM)
*   Pests (Mites/Aphids)
*   Drought
*   Cold Stress

### 4. Advanced Filtering
Users can filter the database by:
*   **Category**: Cannabis, Veg, Fruit.
*   **Photoperiod Type**: Short-Day vs Auto.
*   **Resistance**: "Show me strains with Mold Resistance > 8".

## Implementation Strategy

### Data Structure
The `CropProfile` interface is extended to include `chemotype` and `resistance` objects. This avoids breaking existing modules while enriching the DB view.

### UI/UX Design
*   **Layout**: Follows the "Control Center" aesthetic of the app.
    *   **Left Panel**: Faceted Search & Filters.
    *   **Right Panel**: Grid view of Cards.
    *   **Detail Overlay**: Clicking a card opens a detailed view overlaying the grid, preserving context.
*   **Visuals**:
    *   Use `recharts` for the Chemotype Radar.
    *   Use color-coded progress bars for Resistance.
    *   Use a "Family Tree" style text layout for Lineage.

### Integration
*   **Route**: Accessible via Main Menu -> Cultivar Database.
*   **Cross-Linking**: Future roadmap includes a "Simulate This" button on the detail view that jumps straight to the Phenology Engine with that crop pre-selected.

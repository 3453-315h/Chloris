# Market Yields & ROI Module Documentation

## 1. Crop Yield Database
*Data derived from commercial greenhouse standards and controlled environment agriculture (CEA) literature.*

### Cannabis Sativa (High Value Biomass)
| Variety | Type | Indoor Yield ($g/m^2$) | Outdoor Yield (g/plant) | Harvest Efficiency ($g/W$) |
| :--- | :--- | :--- | :--- | :--- |
| **Northern Lights** | Indica | 500 - 600g | 600 - 900g | 1.2 - 1.6 |
| **Durban Poison** | Sativa | 400 - 500g | 800 - 1200g | 1.0 - 1.3 |
| **Blue Dream** | Hybrid | 550 - 650g | 900 - 1500g | 1.4 - 1.8 |
| **Granddaddy Purple** | Indica | 450 - 550g | 500 - 800g | 1.1 - 1.4 |
| **White Widow Auto** | Ruderalis | 350 - 450g | 50 - 150g | 0.8 - 1.1 |

> **Note**: Yields assume optimal DLI (40+ mol/m²/d) and CO2 enrichment (800-1200ppm). Subtract 20% for ambient conditions.

### Solanaceae (Fruiting Vegetables)
| Variety | Growth Habit | Yield per Plant (Indoor) | Yield per Plant (Outdoor) | Market Unit |
| :--- | :--- | :--- | :--- | :--- |
| **Roma Tomato** | Determinate | 3 - 5 kg | 4 - 7 kg | $/lb |
| **Beefsteak Tomato** | Indeterminate | 8 - 12 kg (extended) | 10 - 15 kg | $/lb |
| **Cherry Tomato** | Indeterminate | 6 - 9 kg | 8 - 10 kg | $/pint |
| **Bell Pepper** | Bush | 2 - 3 kg | 3 - 4 kg | $/each |

### Leafy Greens & Alliums
| Variety | Cycle Time | Yield ($g/head$) | Density (heads/$m^2$) | Annual Yield ($kg/m^2$) |
| :--- | :--- | :--- | :--- | :--- |
| **Romaine Lettuce** | 60 Days | 300 - 400g | 12 - 16 | 25 - 35 kg |
| **Sweet Onion** | 110 Days | 250 - 400g | 20 - 30 | 15 - 20 kg |

---

## 2. Market Economics
*Estimated US National Average Prices (2024 estimates).*

### Market Ticker Configuration
*   **Cannabis (High Grade)**: $1,200 - $2,200 / lb (Wholesale)
*   **Cannabis (Mid Grade)**: $600 - $1,000 / lb (Wholesale)
*   **Tomatoes (Heirloom/Beefsteak)**: $2.50 - $4.00 / lb
*   **Tomatoes (Roma)**: $1.20 - $1.90 / lb
*   **Peppers (Colored Bell)**: $1.00 - $1.50 / each
*   **Lettuce (Artisan)**: $2.00 - $3.50 / head

---

## 3. Implementation Plan (Market Yields Module)

### Core Components

#### A. Harvest Estimator
**Logic**:
1.  Retrieve `roomDims` (Length x Width) from **Climate Lab**.
2.  Calculate `Canopy Area` (Area * 0.8 utilization factor).
3.  Retrieve `Crop Type` from **Phenology Engine**.
4.  Apply formula:
    ```typescript
    const canopyAreaM2 = (room.l * room.w) * 0.092903 * 0.8;
    const estimatedBiomass = canopyAreaM2 * crop.avgYieldPerM2;
    ```

#### B. Energy Calculator (OpEx)
**Logic**:
1.  Retrieve `lightingWatts` and `hvacLoad` from **Climate Lab**.
2.  Retrieve `durationDays` from **Phenology Engine**.
3.  User Input: `Electricity Cost ($/kWh)`.
4.  Apply formula:
    ```typescript
    const totalWatts = lightingWatts + (coolingTonnage * 3500); // Approx HVAC draw
    const totalKwh = (totalWatts / 1000) * hoursPerDay * durationDays;
    const opEx = totalKwh * costPerKwh;
    ```

#### C. ROI Dashboard
**Visuals**:
*   **Revenue Bar**: Green bar representing (Yield * MarketPrice).
*   **Cost Bar**: Red bar representing OpEx.
*   **Net Profit**: Big numeric display.
*   **Efficiency Metric**: "Grams per Watt" gauge.

### Interface Design
*   **Left Panel**: Financial Inputs (Energy cost, Nutrient cost, Market price override).
*   **Right Dashboard**: 
    *   Top: "Projected Harvest Value".
    *   Middle: Charts showing Cost breakdown (Light vs. HVAC vs. Water).
    *   Bottom: Historical ROI comparison (linked to `savedRuns`).

---

## 4. Scientific Adjustments (Simulated)
*Algorithms to adjust yield based on stress factors.*

*   **DLI Stress**: If `avgDLI` < `minDLI`, reduce yield by 1.5% per missing mol.
*   **VPD Stress**: If `timeInVpdZone` < 50%, reduce yield by 10-20%.
*   **CO2 Boost**: If `co2` > 800ppm AND `temp` > 28°C, increase yield by 15-20% (Cannabis/Tomato only).
*   **Genetic Potential**: Apply specific multipliers based on `GeneticMapper` results (e.g., Hybrid Vigor = 1.1x).

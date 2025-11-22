
# Genetic Mapper Guide

## Overview
The **Genetic Mapper** module in FloraChronos allows users to simulate plant breeding by selecting two parent cultivars. It combines **Mendelian genetics** (for discrete traits) with **AI-driven analysis** (for complex quantitative traits like yield or stability).

## How It Works

### 1. Trait Inheritance (Mendelian)
The application tracks specific loci (gene positions) for crops in the database. When parents are selected, the engine generates a 2x2 Punnett Square for each matching trait.

**Current Mapped Traits:**
*   **Leaf Morphology (L/l)**: Determines leaf shape (Broad vs. Narrow).
    *   *Dominant (L)*: Broad Leaf (Indica-style)
    *   *Recessive (l)*: Narrow Leaf (Sativa-style)
*   **Flowering Type (A/a)**:
    *   *Dominant (A)*: Photoperiod dependence.
    *   *Recessive (a)*: Autoflowering capability.
*   **Pigmentation (P/p)**:
    *   *Dominant (P)*: Green foliage.
    *   *Recessive (p)*: Purple/Anthocyanin production.
*   **Growth Habit (Tomato) (SP/sp)**:
    *   *Dominant (SP)*: Indeterminate (Vining).
    *   *Recessive (sp)*: Determinate (Bush).

### 2. Polygenic Prediction (AI)
Complex traits like Yield, Potency, and Terpene profiles are not controlled by a single gene. The Genetic Mapper uses the Gemini AI to analyze the parent profiles and predict:
*   **Hybrid Vigor**: Will the F1 generation exceed the parents in performance?
*   **Stability**: Is the offspring likely to be uniform (stable) or highly variable (unstable)?
*   **Phenotype Description**: A textual description of the likely outcome.

## Usage Instructions

1.  **Select Parents**: Choose a "Parent A" (Pollen Donor) and "Parent B" (Receptor) from the list.
2.  **Check Compatibility**: The system will warn you if you attempt to cross different species (e.g., Tomato x Pepper).
3.  **Run Cross**: Click the button to sequence the genome.
4.  **Analyze Results**:
    *   View the Punnett Squares for specific trait probabilities.
    *   Read the "Breeder's Log" for expert insights into the stability of the cross.

## Scientific Context
*   **F1 Hybrids**: The first generation of offspring from distinct parents. Often shows "Hybrid Vigor" but is genetically unstable if bred further (F2).
*   **True Breeding**: Homozygous parents (e.g., AA x AA) produce identical offspring.


import { GoogleGenAI, Type } from "@google/genai";
import { ClimateConfig, CropProfile, SimulationResult, BreedingResult } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY is missing");
    }
    return new GoogleGenAI({ apiKey });
};

export const runBreedingSimulation = async (
  parentA: CropProfile,
  parentB: CropProfile
): Promise<BreedingResult> => {
  const ai = getClient();
  
  const systemInstruction = `
  You are Chloris-Gen, an expert plant geneticist.
  Your task is to simulate the breeding outcome of two plant parents.
  
  Rules:
  1. **Taxonomy Check**: Verify they are compatible species. If not, warn in the analysis.
  2. **Hybrid Vigor**: Estimate if the F1 offspring will show heterosis (better growth) or depression.
  3. **Stability**: F1 hybrids are usually unstable for breeding further.
  4. **Traits**: Analyze provided Mendelian traits.
  `;

  const prompt = `
  BREEDING SIMULATION
  -------------------
  Parent A (Male/Pollen): ${parentA.name} (${parentA.variety})
  - Scientific: ${parentA.scientificName}
  - Known Traits: ${JSON.stringify(parentA.geneticTraits || [])}
  
  Parent B (Female/Receptor): ${parentB.name} (${parentB.variety})
  - Scientific: ${parentB.scientificName}
  - Known Traits: ${JSON.stringify(parentB.geneticTraits || [])}

  Task:
  1. Name the potential offspring (Creative but scientific).
  2. Predict the Quantitative Yield (e.g. "High due to hybrid vigor").
  3. Analyze genetic stability.
  4. Write a professional "Breeder's Note" explaining the outcome.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          offspringName: { type: Type.STRING },
          predictedYield: { type: Type.STRING },
          geneticStability: { type: Type.STRING, enum: ['F1 Hybrid (Unstable)', 'True Breeding (Stable)', 'Polyhybrid (Highly Unstable)'] },
          aiAnalysis: { type: Type.STRING },
          traits: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                punnettSquare: { 
                   type: Type.ARRAY,
                   items: { type: Type.ARRAY, items: { type: Type.STRING }}
                },
                probabilities: { 
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            phenotype: { type: Type.STRING },
                            probability: { type: Type.NUMBER }
                        }
                    }
                } 
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) throw new Error("AI Breeding Failed");
  
  return JSON.parse(response.text) as BreedingResult;
};

export const runGrowthSimulation = async (
    crop: CropProfile,
    climate: ClimateConfig,
    startDate: string
): Promise<SimulationResult> => {
    const ai = getClient();

    // Calculate DLI for the prompt context
    const dli = (climate.ppfd * climate.photoperiod * 3600) / 1_000_000;
    
    // Determine photoperiod status relative to crop using advanced config if available
    let photoperiodNote = "Optimal";
    let vernalizationNote = "N/A";
    let spectrumNote = "Standard Full Spectrum";

    if (crop.photoperiodConfig) {
        const { criticalDayLength, responseType, vernalization, additionalTriggers, spectrumSensitivity } = crop.photoperiodConfig;
        
        // Logic for Primary Day Length Sensitivity
        if (crop.type === 'Short-Day') {
             if (climate.photoperiod > criticalDayLength) {
                 photoperiodNote = responseType === 'Obligate' 
                    ? `CRITICAL FAILURE: Photoperiod (${climate.photoperiod}h) exceeds Critical Day Length (${criticalDayLength}h). Flowering will NOT initiate.` 
                    : `Inhibitory: Photoperiod (${climate.photoperiod}h) > ${criticalDayLength}h. Flowering delayed significantly (Facultative).`;
             }
        } else if (crop.type === 'Long-Day') {
             if (climate.photoperiod < criticalDayLength) {
                 photoperiodNote = responseType === 'Obligate' 
                    ? `CRITICAL FAILURE: Photoperiod (${climate.photoperiod}h) below Critical Day Length (${criticalDayLength}h). Plant will remain rosette/vegetative.` 
                    : `Sub-optimal: Photoperiod (${climate.photoperiod}h) < ${criticalDayLength}h. Flowering/Bolting delayed (Facultative).`;
             }
        }

        // Logic for Additional Triggers (Multi-stage)
        if (additionalTriggers && additionalTriggers.length > 0) {
            photoperiodNote += " [Multi-stage Constraints: ";
            additionalTriggers.forEach(trig => {
                photoperiodNote += `Stage '${trig.stage}' req ${trig.responseType === 'Obligate' ? 'Strict' : 'Soft'} limit of ${trig.criticalDayLength}h; `;
            });
            photoperiodNote += "]";
        }

        // Logic for Vernalization (Temp + Photoperiod)
        if (vernalization && vernalization.required) {
            let vStatus = [];
            // Check Temp
            if (climate.temperatureNight > vernalization.tempThreshold) {
                vStatus.push(`Night temp (${climate.temperatureNight}°C) > threshold (${vernalization.tempThreshold}°C)`);
            }
            // Check Photoperiod (if specified)
            if (vernalization.photoperiodThreshold) {
                // Usually vernalization requires short days. Assume threshold is MAX daylength for vernalization.
                if (climate.photoperiod > vernalization.photoperiodThreshold) {
                     vStatus.push(`Photoperiod (${climate.photoperiod}h) > vernalization limit (${vernalization.photoperiodThreshold}h)`);
                }
            }
            
            if (vStatus.length > 0) {
                vernalizationNote = `WARNING: Vernalization incomplete. ${vStatus.join(' AND ')}. ${vernalization.description || 'Development may be arrested.'}`;
            } else {
                vernalizationNote = "Satisfied (Theoretical)";
            }
        }

        // Logic for Spectral Sensitivity
        if (spectrumSensitivity === 'High') {
            spectrumNote = "High Sensitivity: Red:Far-Red ratio is critical for phytochrome equilibrium. Ensure spectrum is tuned.";
        }

    } else {
        // Fallback to basic Type-based logic
        if (crop.type === 'Short-Day' && climate.photoperiod > 13) photoperiodNote = "Inhibitory (Vegetative only)";
        if (crop.type === 'Long-Day' && climate.photoperiod < 12) photoperiodNote = "Slow/Inhibitory";
    }

    // Determine CO2 Status for prompt
    let co2Note = "Ambient";
    if (climate.co2 < 400) co2Note = "Sub-ambient (Limiting Factor)";
    else if (climate.co2 > 800) co2Note = "Enriched (Enhanced Photosynthesis)";
    
    if (crop.co2Range) {
        if (climate.co2 > crop.co2Range.max) co2Note = `Excessive (Risk of Toxicity > ${crop.co2Range.max})`;
        else if (climate.co2 >= 800 && climate.co2 <= crop.co2Range.max) co2Note = "Optimized Enrichment (High Yield Potential)";
    }

    const systemInstruction = `
    You are Chloris, a highly advanced plant physiology and phenology engine backed by scientific literature (PMC10004775, HortScience, Frontiers in Plant Science).
    
    Your task is to calculate specific growth stages based on Thermal Time (GDD), DLI, CO2 Enrichment, and Photoperiodic constraints.
    
    RULES:
    1. **Use the Database Values**: The user has provided specific Base Temp (${crop.baseTemp}°C), Optimal Temp (${crop.optimalTemp}°C).
    2. **Photoperiodism & Critical Day Length**: 
       - STRICTLY enforce the "Photoperiod Status" provided in the environment data.
       - If status is "CRITICAL FAILURE" or "Inhibitory (Vegetative only)", the stages MUST reflect this. Do NOT show a Harvest stage if flowering never triggers. Instead, show "Prolonged Vegetative" or "Senescence".
    3. **DLI Analysis**: Compare calculated DLI (${dli.toFixed(2)}) against the crop's specific requirements (Min: ${crop.minDLI}, Opt: ${crop.optimalDLI}).
    4. **CO2 Fertilization Effect**: If CO2 is > 800ppm and Light/Temp are optimal, increase predicted growth rate and yield score. If CO2 is limiting (<400), reduce yield.
    5. **Vernalization**: If the input data mentions unmet vernalization requirements (Temp or Photoperiod), simulate failure to transition to reproductive stages.
    6. **Yield Scoring**: Calculate a 'score' (0-100) representing environmental suitability. 100 = Perfect Topt, DLI, CO2 and Photoperiod. <40 = Critical Stress.
    7. **Scientific Output**: Provide citations or physiological explanations (e.g., "Phytochrome Pfr/Pr ratio", "Florigen (FT) expression", "Rubisco Carboxylase Activity").

    Output must be valid JSON matching the schema.
    `;

    const prompt = `
    SIMULATION PARAMETERS:
    ----------------------
    Crop: ${crop.name}
    Scientific Name: ${crop.scientificName}
    Variety: ${crop.variety}
    Type: ${crop.type}
    Maturity (Standard): ${crop.expectedMaturityDays} days
    
    ADVANCED PHENOLOGY CONFIG:
    - Critical Day Length: ${crop.photoperiodConfig ? crop.photoperiodConfig.criticalDayLength + ' hours' : 'Standard'}
    - Response Type: ${crop.photoperiodConfig ? crop.photoperiodConfig.responseType : 'Standard'}
    - Vernalization: ${crop.photoperiodConfig?.vernalization?.required ? 'Required' : 'None'}
    - Spectral Sensitivity: ${crop.photoperiodConfig?.spectrumSensitivity || 'Standard'}
    
    ENVIRONMENT:
    - Start Date: ${startDate}
    - Photoperiod: ${climate.photoperiod} hours
    - Photoperiod Status: ${photoperiodNote}
    - Vernalization Status: ${vernalizationNote}
    - Spectrum Note: ${spectrumNote}
    - Day/Night Temp: ${climate.temperatureDay}/${climate.temperatureNight} °C
    - CO2 Concentration: ${climate.co2} ppm (${co2Note})
    - RH: ${climate.humidity}%
    - DLI: ${dli.toFixed(2)} mol/m²/d
    
    TASK:
    Generate a detailed phenological timeline. 
    Calculate specific Accumulated GDD for each stage using Base Temp ${crop.baseTemp}°C.
    If the Photoperiod Status indicates failure, the yield projection score should be < 20.
    Provide a quantifiable yield estimate (e.g., "400-500g/m²" or "High/Moderate/Low" if exact mass unavailable).
    If CO2 is enriched (${climate.co2} > 800), explicitly mention "CO2 Fertilization" in the stress analysis or scientific notes.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    cropName: { type: Type.STRING },
                    sowingDate: { type: Type.STRING },
                    harvestDate: { type: Type.STRING },
                    totalGDD: { type: Type.NUMBER, description: "Total Accumulated Growing Degree Days" },
                    averageDLI: { type: Type.NUMBER },
                    yieldProjection: { 
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING, description: "Short textual summary of yield" },
                            score: { type: Type.NUMBER, description: "0-100 suitability score" },
                            estimatedYield: { type: Type.STRING, description: "Quantifiable metric or specific classification" }
                        }
                    },
                    stressAnalysis: { type: Type.STRING, description: "Analysis of environmental stress factors" },
                    scientificNotes: { type: Type.STRING, description: "Explanation citing physiological mechanisms" },
                    stages: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                stage: { type: Type.STRING },
                                startDate: { type: Type.STRING },
                                endDate: { type: Type.STRING },
                                durationDays: { type: Type.NUMBER },
                                description: { type: Type.STRING },
                                accumulatedGDD: { type: Type.NUMBER },
                                requiredDLI: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!response.text) {
        throw new Error("No response from AI");
    }

    return JSON.parse(response.text) as SimulationResult;
};

export const analyzePlantImage = async (base64Image: string, mimeType: string) => {
    const ai = getClient();

    const systemInstruction = `
    You are an expert Plant Pathologist and Agronomist using Computer Vision.
    Analyze the provided image of a plant.
    Identify any nutrient deficiencies, pests, fungal diseases, or environmental stress.
    Provide a confidence score.
    Recommend specific organic or salt-based remedies.
    If the plant looks healthy, report that.
    `;

    const prompt = "Analyze this plant leaf/canopy. Diagnose any issues.";

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                { inlineData: { mimeType: mimeType, data: base64Image } },
                { text: prompt }
            ]
        },
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    diagnosis: { type: Type.STRING },
                    confidence: { type: Type.NUMBER, description: "0-100 score" },
                    symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                    cause: { type: Type.STRING },
                    remedy: { type: Type.STRING },
                    isHealthy: { type: Type.BOOLEAN }
                }
            }
        }
    });

    if (!response.text) throw new Error("Vision Analysis Failed");
    return JSON.parse(response.text);
};

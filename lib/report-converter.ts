import { unique } from "next/dist/build/utils";

// A generic type for summary items used across multiple pages
interface SummaryItem {
  title: string;
  paragraph: string;
}

// Page 3: Contextual Info
export interface Page3Data {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: string;
  why_you_move: string;
  fitness_goal: string;
  pre_workout_feeling: string;
  post_workout_feeling: string;
  effort_level: string; // e.g., "7/10"
}

// Page 5: Mobility
export interface Page5Data {
  knee_flexion: {
    "Rep Count": number;
    "Total Duration": number;
    "Max Knee Flexion Left": number;
    "Max Knee Flexion Right": number;
    "Max Knee Extension Left": number;
    "Max Knee Extension Right": number;
    "Range of Motion": string;
  };
  knee_to_wall: {
    "Total Time": number;
    "Max Knee Flexion Left": number;
    "Max Knee Flexion Right": number;
    "Ankle Mobility": string;
  };
  lunge_stretch: {
    "Max Rep Count": number;
    "Average Hip Flexion Angle": number;
    "Average Knee Flexion Angle Left": number;
    "Average Knee Flexion Angle Right": number;
    "Hold Duration Left (s)": number;
    "Hold Duration Right (s)": number;
    "Quadriceps Stretch": string;
    "Hip Stability": string;
  };
  summary: SummaryItem[];
}

// Page 6: Strength
export interface Page6Data {
  squats: {
    "Rep Count": number;
    "Left Knee Flexion Avg": number;
    "Right Knee Flexion Avg": number;
    "Squat Depth Rating": string;
    "Repetition Consistency": string;
    "Stability": string;
    "Fatigue Score": string;
  };
  lunges: {
    "Rep Count": number;
    "Total Duration": string;
    "Average Knee Angle Left": number;
    "Average Knee Angle Right": number;
    "Average Hip Angle": number;
    "Lunge Depth Rating": string;
    "Repetition Consistency": string;
    "Stability": string;
    "Fatigue Score": string;
  };
  core: {
    "Average Hip Angle": number;
    "Total Hold Duration": string;
  };
  summary: SummaryItem[];
}

// Page 7: Endurance
export interface Page7Data {
  plank: {
    "Average Hip Angle": number;
    "Total Hold Duration": string;
    "Stability": string;
  };
  step_up: {
    duration?: number;
    rep_count?: number;
    rep_time?: number;
  };
  sprint: {
    max_velocity: number;
    deceleration: number;
  };
  summary: SummaryItem[];
}

// Page 9: Movement Signature
export interface Page9Data {
  identity:string,
  scores: {
    endurance: number;
    strength: number;
    mobility: number;
  };
}

// Page 10: Training with Purpose
export interface Page10Data {
  strengths: SummaryItem[];
  improvements: SummaryItem[];
  risks: SummaryItem[];
}

// Page 11: The Next Move is Yours
export interface MetricToBeat {
  name: string;
  current_score: string;
  target_score: string;
  unit: string;
}

export interface Page11Data {
  metrics: MetricToBeat[];
}

// Page 12: Conclusion
export interface Page12Data {
  report_id: string;
}

// Page 1: Basic info
export interface Page1Data {
  id:string,
  uniqueId:string,
  email:string,
  name: string;
}

// The master interface composing all page-specific data structures
export interface FitnessReportData {
  page1: Page1Data;
  page3: Page3Data;
  page5: Page5Data;
  page6: Page6Data;
  page7: Page7Data;
  page9: Page9Data;
  page10: Page10Data;
  page11: Page11Data;
  page12: Page12Data;
}

// Helper to clean and map exercise data for PDF schema
function cleanAndMapExerciseData(raw: any, mapping: Record<string, string> = {}): any {
  if (!raw || typeof raw !== 'object') return null; // Return null if no data
  
  const cleaned: any = {};
  for (const [key, value] of Object.entries(raw)) {
    // Skip unwanted fields
    if (
      key === 'status' ||
      key === 'output_key' ||
      key === 'errorType' ||
      key === 'errorMessage'
    ) {
      continue;
    }
    
    // Map field names if needed, otherwise use the original key
    const mappedKey = mapping[key] || key;
    cleaned[mappedKey] = value;
  }
  return cleaned;
}

// Helper function to create summary items from section evaluations
function createSummaryItemsFromEvaluations(evaluations: any[], section: string): SummaryItem[] {
  const evaluation = evaluations?.find(e => e.section === section);
  if (!evaluation?.comments || typeof evaluation.comments !== 'object') {
    return [];
  }
  return Object.entries(evaluation.comments).map(([title, paragraph]) => ({
    title,
    paragraph: paragraph as string,
  }));
}

interface CustomerData {
  id: string
  name: string
  age: number
  gender: string
  height: number
  weight: number
  sleepLevels: number
  activityLevel: string
  calorieIntake: number
  mood: string
  uniqueId: string
  createdAt: string
  updatedAt: string
  tests: any[]
  sectionEvaluations: any[]
  trainingPurposes: any[]
  scoresToBeat: any[]
  movementSignature: any
  client: any
}

export function convertCustomerDataToReportData(customerData: CustomerData): FitnessReportData {
  // Get the most recent test
  const latestTest = customerData.tests?.[0] || null
  
  // Get the most recent ratings
  const latestRatings = latestTest?.ratings || null
  
  // Get section evaluations
  const mobilityEval = customerData.sectionEvaluations?.find(e => e.section === 'mobility')?.dropdowns || {};
  const strengthEval = customerData.sectionEvaluations?.find(e => e.section === 'strength')?.dropdowns || {};
  const enduranceEval = customerData.sectionEvaluations?.find(e => e.section === 'endurance')?.dropdowns || {};
  
  // Get section evaluation summaries
  const mobilitySummary = createSummaryItemsFromEvaluations(customerData.sectionEvaluations, 'mobility');
  const strengthSummary = createSummaryItemsFromEvaluations(customerData.sectionEvaluations, 'strength');
  const enduranceSummary = createSummaryItemsFromEvaluations(customerData.sectionEvaluations, 'endurance');
  
  // Get movement signature
  const movementSignature = customerData.movementSignature
  
  // Get training purposes
  const trainingPurposes = customerData.trainingPurposes || []
  
  // Get scores to beat
  const scoresToBeat = customerData.scoresToBeat || []
  
  // Helper function to extract exercise data
  const getExerciseData = (exerciseName: string) => {
    if (!latestTest?.exercises) return null
    return latestTest.exercises.find((ex: any) => ex.name === exerciseName)
  }
  
  // Helper function to extract analysis results
  const getAnalysisResults = (exerciseName: string) => {
    const exercise = getExerciseData(exerciseName)
    if (!exercise?.assetFiles) return null
    
    // Look for any file with analysis results (processed or otherwise)
    const fileWithAnalysis = exercise.assetFiles.find((file: any) => 
      file.analysisResults
    )
    
    if (!fileWithAnalysis?.analysisResults) return null
    
    let analysisData = fileWithAnalysis.analysisResults
    
    // Handle different analysis result formats
    if (analysisData.body && typeof analysisData.body === 'string') {
      try {
        analysisData = JSON.parse(analysisData.body)
      } catch (e) {
        // If parsing fails, use the original structure
      }
    }
    
    return analysisData
  }
  
  // Helper function to create summary items from training purposes
  const createSummaryItems = (category: string): SummaryItem[] => {
    return trainingPurposes
      .filter(p => p.category === category)
      .map(p => ({
        title: p.title,
        paragraph: p.paragraph
      }))
  }
  
  // Helper function to convert scores to beat to metrics
  const convertScoresToMetrics = (): MetricToBeat[] => {
    return scoresToBeat.map(score => ({
      name: score.title,
      current_score: score.current.toString(),
      target_score: score.best.toString(),
      unit: 'score' // You might want to customize this based on the score type
    }))
  }
  
  // Field mappings for renaming
  const squatsMapping = {
    "Left Knee Flexion Recurring Min": "Left Knee Flexion Avg",
    "Right Knee Flexion Recurring Min": "Right Knee Flexion Avg",
  };
  const lungesMapping = {
    "Min Knee Angle Left": "Average Knee Angle Left",
    "Min Knee Angle Right": "Average Knee Angle Right",
    "Max Hip Angle": "Average Hip Angle",
  };
  const stepUpMapping = {
    "Rep Count": "rep_count",
    "Total Time (s)": "duration",
  };

  // Extract and clean/map exercise-specific data
  const kneeFlexionData = cleanAndMapExerciseData(getAnalysisResults('knee_flexion'));
  const kneeToWallData = cleanAndMapExerciseData(getAnalysisResults('knee_to_wall'));
  const lungeStretchData = cleanAndMapExerciseData(getAnalysisResults('lunge_stretch'));
  const squatsData = cleanAndMapExerciseData(getAnalysisResults('squats'), squatsMapping);
  const lungesData = cleanAndMapExerciseData(getAnalysisResults('lunges'), lungesMapping);
  const plankData = cleanAndMapExerciseData(getAnalysisResults('plank_hold'));
  const stepUpData = cleanAndMapExerciseData(getAnalysisResults('stepUp'), stepUpMapping);
  const sprintData = cleanAndMapExerciseData(getAnalysisResults('sprint'));
  
  return {
    page1: { 
      name: customerData.name,
      email:customerData.client.email,
      id:customerData.id,
      uniqueId:customerData.uniqueId
    },
    
    page3: {
      name: customerData.name,
      age: customerData.age,
      height: customerData.height,
      weight: customerData.weight,
      gender: customerData.gender,
      why_you_move: customerData.client?.whyMove || '',
      fitness_goal: customerData.client?.fitnessGoal || '',
      pre_workout_feeling: customerData.mood || '',
      post_workout_feeling: latestRatings?.FeltAfterWorkOut || '',
      effort_level: latestRatings?.RPE ? `${latestRatings.RPE}/10` : '',
    },
    
    page5: {
      knee_flexion: kneeFlexionData ? {
        ...kneeFlexionData,
        "Range of Motion": mobilityEval["Range of Motion"] || "NA"
      } : {
        "Rep Count": 0,
        "Total Duration": 0,
        "Max Knee Flexion Left": 0,
        "Max Knee Flexion Right": 0,
        "Max Knee Extension Left": 0,
        "Max Knee Extension Right": 0,
        "Range of Motion": mobilityEval["Range of Motion"] || "NA",
      },
      knee_to_wall: kneeToWallData ? {
        ...kneeToWallData,
        "Ankle Mobility": mobilityEval["Ankle Mobility"] || "NA"
      } : {
        "Total Time": 0,
        "Max Knee Flexion Left": 0,
        "Max Knee Flexion Right": 0,
        "Ankle Mobility": mobilityEval["Ankle Mobility"] || "NA",
      },
      lunge_stretch: lungeStretchData ? {
        ...lungeStretchData,
        "Quadriceps Stretch": mobilityEval["Quadriceps Stretch"] || "NA",
        "Hip Stability": mobilityEval["Hip Stability"] || "NA"
      } : {
        "Max Rep Count": 0,
        "Average Hip Flexion Angle": 0,
        "Average Knee Flexion Angle Left": 0,
        "Average Knee Flexion Angle Right": 0,
        "Hold Duration Left (s)": 0,
        "Hold Duration Right (s)": 0,
        "Quadriceps Stretch": mobilityEval["Quadriceps Stretch"] || "NA",
        "Hip Stability": mobilityEval["Hip Stability"] || "NA",
      },
      summary: mobilitySummary,
    },
    
    page6: {
      squats: squatsData ? {
        ...squatsData,
        "Squat Depth Rating": strengthEval["Squat Depth Rating"] || "NA",
        "Repetition Consistency": strengthEval["Repetition Consistency (Squat)"] || "NA",
        "Stability": strengthEval["Stability (Squat)"] || "NA",
        "Fatigue Score": strengthEval["Fatigue Score (Squat)"] || "NA"
      } : {
        "Rep Count": 0,
        "Left Knee Flexion Avg": 0,
        "Right Knee Flexion Avg": 0,
        "Squat Depth Rating": strengthEval["Squat Depth Rating"] || "NA",
        "Repetition Consistency": strengthEval["Repetition Consistency (Squat)"] || "NA",
        "Stability": strengthEval["Stability (Squat)"] || "NA",
        "Fatigue Score": strengthEval["Fatigue Score (Squat)"] || "NA",
      },
      lunges: lungesData ? {
        ...lungesData,
        "Lunge Depth Rating": strengthEval["Lunge Depth Rating"] || "NA",
        "Repetition Consistency": strengthEval["Repetition Consistency (Lunge)"] || "NA",
        "Stability": strengthEval["Stability (Lunge)"] || "NA",
        "Fatigue Score": strengthEval["Fatigue Score (Lunge)"] || "NA"
      } : {
        "Rep Count": 0,
        "Total Duration": "0s",
        "Average Knee Angle Left": 0,
        "Average Knee Angle Right": 0,
        "Average Hip Angle": 0,
        "Lunge Depth Rating": strengthEval["Lunge Depth Rating"] || "NA",
        "Repetition Consistency": strengthEval["Repetition Consistency (Lunge)"] || "NA",
        "Stability": strengthEval["Stability (Lunge)"] || "NA",
        "Fatigue Score": strengthEval["Fatigue Score (Lunge)"] || "NA",
      },
      core: plankData ? { // Remap plank data for core section
        "Average Hip Angle": plankData["Average Hip Angle"] || 0,
        "Total Hold Duration": plankData["Total Hold Duration"] || "0s",
      } : {
        "Average Hip Angle": 0,
        "Total Hold Duration": "0s",
      },
      summary: strengthSummary,
    },
    
    page7: {
      plank: plankData ? {
        ...plankData,
        "Stability": enduranceEval["Stability Score (for Plank Hold)"] || "NA",
      } : {
        "Average Hip Angle": 0,
        "Total Hold Duration": "0s",
        "Stability": enduranceEval["Stability Score (for Plank Hold)"] || "NA",
      },
      step_up: stepUpData || {
        duration: 0,
        rep_count: 0,
        rep_time: 0,
      },
      sprint: sprintData || {
        max_velocity: 0,
        deceleration: 0,
      },
      summary: enduranceSummary,
    },
    
    page9: {
      identity:movementSignature.identity,
      scores: {
        endurance: movementSignature?.enduranceRating || 5,
        strength: movementSignature?.strengthRating || 5,
        mobility: movementSignature?.mobilityRating || 5,
      },
    },
    
    page10: {
      strengths: createSummaryItems('expand'),
      improvements: createSummaryItems('improve'),
      risks: createSummaryItems('injury'),
    },
    
    page11: {
      metrics: convertScoresToMetrics(),
    },
    
    page12: {
      report_id: `${customerData.uniqueId || customerData.id.slice(-6)}`,
    },
  }
}

// Helper function to download data as JSON file
export function downloadAsJSON(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Helper function to download data as text file
export function downloadAsText(data: any, filename: string) {
  const textString = JSON.stringify(data, null, 2)
  const blob = new Blob([textString], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Helper function to generate filename with timestamp
export function generateFilename(customerName: string, extension: string): string {
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_')
  return `${sanitizedName}_fitness_report_${timestamp}.${extension}`
} 

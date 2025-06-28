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
    rep_count: string;
    duration: string;
    angle_left: number;
    angle_right: number;
    rating: string;
  };
  knee_to_wall: {
    rep_count: string;
    duration: string;
    distance_left: number;
    distance_right: number;
    rating: string;
  };
  lunge_stretch: {
    rep_count: string;
    hold_duration: string;
    hip_flexion_left: number;
    hip_flexion_right: number;
    stability_rating: string;
  };
  summary: SummaryItem[];
}

// Page 6: Strength
export interface Page6Data {
  squats: {
    rep_count: number;
    duration: number;
    depth_rating: string;
    consistency: string;
    stability: string;
    flexion_left: number;
    flexion_right: number;
    fatigue_score: string; // e.g., "2/5"
  };
  lunges: {
    rep_count: number;
    duration: number;
    depth_rating: string;
    consistency: string;
    stability: string;
    flexion_left: number;
    flexion_right: number;
    fatigue_score: string; // e.g., "2.5/5"
  };
  core: {
    hold_duration: number;
    rating: string; // e.g., "3/5"
  };
  summary: SummaryItem[];
}

// Page 7: Endurance
export interface Page7Data {
  plank: {
    rep_count: number;
    duration: number;
    hip_angle: number;
    stability: string;
  };
  step_up: {
    duration: number;
    rep_count: number;
    rep_time: number;
  };
  sprint: {
    max_velocity: number;
    deceleration: number;
  };
  summary: SummaryItem[];
}

// Page 9: Movement Signature
export interface Page9Data {
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

// The master interface composing all page-specific data structures
export interface FitnessReportData {
  page1: { name: string };
  page3: Page3Data;
  page5: Page5Data;
  page6: Page6Data;
  page7: Page7Data;
  page9: Page9Data;
  page10: Page10Data;
  page11: Page11Data;
  page12: Page12Data;
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
  const mobilityEval = customerData.sectionEvaluations?.find(e => e.section === 'mobility')
  const strengthEval = customerData.sectionEvaluations?.find(e => e.section === 'strength')
  const enduranceEval = customerData.sectionEvaluations?.find(e => e.section === 'endurance')
  
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
    
    const processedFile = exercise.assetFiles.find((file: any) => 
      file.fileType === 'processed' && file.analysisResults
    )
    
    return processedFile?.analysisResults || null
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
  
  // Extract exercise-specific data
  const kneeFlexionData = getAnalysisResults('knee_flexion')
  const kneeToWallData = getAnalysisResults('knee_to_wall')
  const lungeStretchData = getAnalysisResults('lunge_stretch')
  const squatsData = getAnalysisResults('squats')
  const lungesData = getAnalysisResults('lunges')
  const plankData = getAnalysisResults('plank_hold')
  const stepUpData = getAnalysisResults('stepUp')
  const sprintData = getAnalysisResults('sprint')
  
  return {
    page1: { 
      name: customerData.name 
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
      knee_flexion: {
        rep_count: kneeFlexionData?.rep_count || '',
        duration: kneeFlexionData?.duration || '',
        angle_left: kneeFlexionData?.angle_left || 0,
        angle_right: kneeFlexionData?.angle_right || 0,
        rating: mobilityEval?.dropdowns?.knee_flexion_rating || '',
      },
      knee_to_wall: {
        rep_count: kneeToWallData?.rep_count || '',
        duration: kneeToWallData?.duration || '',
        distance_left: kneeToWallData?.distance_left || 0,
        distance_right: kneeToWallData?.distance_right || 0,
        rating: mobilityEval?.dropdowns?.knee_to_wall_rating || '',
      },
      lunge_stretch: {
        rep_count: lungeStretchData?.rep_count || '',
        hold_duration: lungeStretchData?.hold_duration || '',
        hip_flexion_left: lungeStretchData?.hip_flexion_left || 0,
        hip_flexion_right: lungeStretchData?.hip_flexion_right || 0,
        stability_rating: lungeStretchData?.stability_rating || '',
      },
      summary: createSummaryItems('expand'),
    },
    
    page6: {
      squats: {
        rep_count: squatsData?.rep_count || 0,
        duration: squatsData?.duration || 0,
        depth_rating: strengthEval?.dropdowns?.squat_depth || '',
        consistency: strengthEval?.dropdowns?.squat_consistency || '',
        stability: strengthEval?.dropdowns?.squat_stability || '',
        flexion_left: squatsData?.flexion_left || 0,
        flexion_right: squatsData?.flexion_right || 0,
        fatigue_score: squatsData?.fatigue_score || '',
      },
      lunges: {
        rep_count: lungesData?.rep_count || 0,
        duration: lungesData?.duration || 0,
        depth_rating: strengthEval?.dropdowns?.lunge_depth || '',
        consistency: strengthEval?.dropdowns?.lunge_consistency || '',
        stability: strengthEval?.dropdowns?.lunge_stability || '',
        flexion_left: lungesData?.flexion_left || 0,
        flexion_right: lungesData?.flexion_right || 0,
        fatigue_score: lungesData?.fatigue_score || '',
      },
      core: {
        hold_duration: plankData?.hold_duration || 0,
        rating: enduranceEval?.dropdowns?.core_rating || '',
      },
      summary: createSummaryItems('improve'),
    },
    
    page7: {
      plank: {
        rep_count: plankData?.rep_count || 0,
        duration: plankData?.duration || 0,
        hip_angle: plankData?.hip_angle || 0,
        stability: enduranceEval?.dropdowns?.plank_stability || '',
      },
      step_up: {
        duration: stepUpData?.duration || 0,
        rep_count: stepUpData?.rep_count || 0,
        rep_time: stepUpData?.rep_time || 0,
      },
      sprint: {
        max_velocity: sprintData?.max_velocity || 0,
        deceleration: sprintData?.deceleration || 0,
      },
      summary: createSummaryItems('injury'),
    },
    
    page9: {
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
      report_id: `NT-${customerData.uniqueId || customerData.id.slice(-6)}`,
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
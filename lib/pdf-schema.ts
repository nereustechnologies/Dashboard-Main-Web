// TypeScript interface definitions for the exact data schema that PDF components expect
// Based on analysis of all Page Layout components (Page1Layout through Page12Layout)

// Common types used across multiple pages
export interface SummaryItem {
  title: string;
  paragraph: string;
}

export interface MetricToBeat {
  name: string;
  current_score: string;
  target_score: string;
  unit: string;
}

// Page 1: Basic Info
export interface Page1Data {
  name: string;
}

// Page 3: Contextual Info (also used by Page 2)
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

// Page 5: Mobility Assessment
export interface Page5Data {
  knee_flexion: {
    "Rep Count": number;
    "Total Duration": number;
    "Max Knee Flexion Left": number;
    "Max Knee Flexion Right": number;
    "Max Knee Extension Left": number;
    "Max Knee Extension Right": number;
    "Range of Motion"?: string;
  };
  knee_to_wall: {
    "Total Time": number;
    "Max Knee Flexion Left": number;
    "Max Knee Flexion Right": number;
    "Ankle Mobility"?: string;
  };
  lunge_stretch: {
    "Max Rep Count": number;
    "Average Hip Flexion Angle": number;
    "Average Knee Flexion Angle Left": number;
    "Average Knee Flexion Angle Right": number;
    "Hold Duration Left (s)": number;
    "Hold Duration Right (s)": number;
    "Quadriceps Stretch"?: string;
    "Hip Stability"?: string;
  };
  summary: SummaryItem[];
}

// Page 6: Strength Assessment
export interface Page6Data {
  squats: {
    "Rep Count": number;
    "Left Knee Flexion Avg": number;
    "Right Knee Flexion Avg": number;
    "Squat Depth Rating"?: string;
    "Repetition Consistency"?: string;
    "Stability"?: string;
    "Fatigue Score"?: string;
    // Note: PDF currently uses hardcoded values like "Deep Squat", "Satisfactory", "Good", "2/5"
    // rather than dynamic data for these evaluation fields
  };
  lunges: {
    "Rep Count": number;
    "Total Duration": string;
    "Average Knee Angle Left": number;
    "Average Knee Angle Right": number;
    "Average Hip Angle": number;
    "Lunge Depth Rating"?: string;
    "Repetition Consistency"?: string;
    "Stability"?: string;
    "Fatigue Score"?: string;
    // Note: PDF currently uses hardcoded values like "Deep Lunge", "Satisfactory", "Good"
    // rather than dynamic data for these evaluation fields
  };
  core: {
    "Average Hip Angle": number;
    "Total Hold Duration": string;
  };
  summary: SummaryItem[];
}

// Page 7: Endurance Assessment
export interface Page7Data {
  plank: {
    "Average Hip Angle": number;
    "Total Hold Duration": string;
    "Stability"?: string;
  };
  step_up: {
    duration?: number;
    rep_count?: number;
    rep_time?: number;
    errorType?: string; // Used to check for N/A values
    errorMessage?: string;
  };
  sprint: {
    max_velocity: number;
    deceleration: number;
  };
  summary: SummaryItem[];
}

// Page 9: Movement Signature Scores
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

// Page 11: Metrics to Beat
export interface Page11Data {
  metrics: MetricToBeat[];
}

// Page 12: Report Conclusion
export interface Page12Data {
  report_id: string;
}

// Master interface that combines all page data
export interface FitnessReportData {
  page1: Page1Data;
  page3: Page3Data; // Used by both Page2Layout and Page3Layout
  page5: Page5Data;
  page6: Page6Data;
  page7: Page7Data;
  page9: Page9Data;
  page10: Page10Data;
  page11: Page11Data;
  page12: Page12Data;
}

// Notes about the current PDF implementation:
// 1. Page4Layout and Page8Layout are static and require no data
// 2. Page2Layout uses the same data as Page3Layout (Page3Data)
// 3. Page9Layout requires both page9 and page1 data (for name access)
// 4. Many "evaluation" fields in Pages 5-7 are currently hardcoded in the components:
//    - Page5: "Good", "Range of Motion" values are hardcoded
//    - Page6: "Deep Squat", "Satisfactory", "Good", "2/5" are hardcoded
//    - Page7: "Good", "N/A", "12", "1.4s" values are hardcoded or conditionally shown
// 5. The summary arrays are filtered to remove empty entries (title/paragraph)
// 6. Error fields (errorType, errorMessage, status, output_key) should be filtered out 
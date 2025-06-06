import { type SensorDataPoint } from "@/hooks/use-websocket" // Assuming SensorDataPoint is exported from here or another accessible path

interface SensorIMUData {
  AX: number; AY: number; AZ: number;
  GX: number; GY: number; GZ: number;
  MX: number; MY: number; MZ: number;
}

export function formatTime(timeInSeconds: number) {
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = timeInSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

export function formatMillisecondsToMMSS(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function formatSensorDataForCSV(data: { [key: string]: any[] }) {
  // Define the headers for the CSV
  const headers = ["AX", "AY", "AZ", "GX", "GY", "GZ", "MX", "MY", "MZ"];
  let csvContent = headers.join(",") + "\n";

  console.log('Formatting Sensor Data:', data);
 
  // Get the length of the first array to determine number of rows
  const firstKey = Object.keys(data)[0];
  const numRows = data[firstKey]?.length || 0;

  // Map through each index in parallel
  for (let i = 0; i < numRows; i++) {
    const row = headers.map(header => {
      const value = data[header]?.[i] ?? "";
      return `"${value}"`;
    });
    csvContent += row.join(",") + "\n";
  }

  console.log('Generated CSV Content:', csvContent);
  return csvContent;
}

// Helper to get CSV Headers and map keys for a given exerciseId
// This structure should ideally be centralized or derived from a single source of truth for exercise definitions.
const getExerciseCsvConfig = (exerciseId: string): { headers: string[]; dataKeys: string[] } => {
  // Maps CSV Header to the key in the recorded data object
  const configMap: Record<string, { headers: string[]; dataKeys: string[] }> = {
    knee_flexion: {
      headers: ["Timestamp", "Knee Angle Left (°)", "Knee Angle Right (°)", "Leg Used", "Phase Label", "Rep Count"],
      dataKeys: ["timestamp", "kneeAngleLeft", "kneeAngleRight", "leg", "phaseLabel", "repCount"],
    },
    lunge_stretch: {
      headers: ["Timestamp", "Hip Flexion Angle (°)", "Knee Flexion Angle Left (°)", "Knee Flexion Angle Right (°)", "Leg Used", "Phase Label", "Hold Duration (s)", "Reps"],
      dataKeys: ["timestamp", "hipFlexionAngle", "kneeFlexionAngleLeft", "kneeFlexionAngleRight", "leg", "phaseLabel", "holdDuration", "reps"],
    },
    knee_to_wall: {
      headers: ["Timestamp", "Knee Angle Left (°)", "Knee Angle Right (°)", "Leg Used", "Phase Label", "Rep Count"],
      dataKeys: ["timestamp", "kneeAngleLeft", "kneeAngleRight", "leg", "phaseLabel", "repCount"],
    },
    squats: {
      headers: ["Timestamp", "Knee Angle Left (°)", "Knee Angle Right (°)", "Hip Angle (°)", "Phase Label", "Rep Count"],
      dataKeys: ["timestamp", "kneeAngleLeft", "kneeAngleRight", "hipAngle", "phaseLabel", "repCount"],
    },
    lunges: {
      headers: ["Timestamp", "Knee Angle Left (°)", "Knee Angle Right (°)", "Hip Angle (°)", "Leg Used", "Phase Label", "Rep Count"],
      dataKeys: ["timestamp", "kneeAngleLeft", "kneeAngleRight", "hipAngle", "leg", "phaseLabel", "repCount"],
    },
    plank_hold: {
      headers: ["Timestamp", "Hip Angle (°)", "Phase Label", "Hold Duration (s)"],
      dataKeys: ["timestamp", "hipAngle", "phaseLabel", "holdDuration"],
    },
    sprint: {
      headers: ["Timestamp", "Velocity (m/s)", "Acceleration (m/s²)", "Stride Length (m)", "Cadence (steps/min)", "Phase Label"],
      dataKeys: ["timestamp", "velocity", "acceleration", "strideLength", "cadence", "phaseLabel"],
    },
    shuttle_run: {
      headers: ["Timestamp", "Velocity (m/s)", "Acceleration (m/s²)", "Stride Length (m)", "Cadence (steps/min)", "Phase Label", "Rep Count"],
      dataKeys: ["timestamp", "velocity", "acceleration", "strideLength", "cadence", "phaseLabel", "repCount"],
    },
    generic: { // Fallback for other exercises
      headers: ["Timestamp", "Action", "Leg", "Rep Count"],
      dataKeys: ["timestamp", "action", "leg", "repCount"],
    },
  }
  return configMap[exerciseId] || configMap.generic
}

/**
 * Prepares exercise event data as a CSV string.
 * @param exerciseId The ID of the exercise.
 * @param customerData Object containing customer details, expects at least a 'name' property.
 * @param recordedEvents Array of recorded event objects for the exercise.
 * @returns Object containing fileName and csvContent, or null if no data.
 */
export function prepareExerciseEventsCSV(
  exerciseId: string,
  customerData: { name: string; id: string }, // Added id to customerData
  recordedEvents: any[]
): { fileName: string; csvContent: string } | null {
  if (!recordedEvents || recordedEvents.length === 0) {
    console.log(`No recorded exercise data to prepare for ${exerciseId}.`);
    return null;
  }

  const { headers, dataKeys } = getExerciseCsvConfig(exerciseId);

  const csvRows = [
    headers.join(','), // Header row
    ...recordedEvents.map(event => {
      return dataKeys.map(key => {
        let value = event[key];
        if (key === 'timestamp' && typeof value === 'number') {
          value = formatTime(value);
        } else {
          value = value !== undefined && value !== null ? String(value) : "";
        }
        if (String(value).includes(',') || String(value).includes('"')) {
          value = `"${String(value).replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    })
  ];

  const csvContent = csvRows.join('\n');
  const fileName = "exercise_events.csv";
  
  return { fileName, csvContent };
}

/**
 * Prepares raw sensor data as a CSV string.
 * @param exerciseId The ID of the exercise.
 * @param sensorData Array of SensorDataPoint objects.
 * @param customerData Object containing customer details, expects 'name' and 'id'.
 * @returns Object containing fileName and csvContent, or null if no data.
 */
export function prepareRawSensorDataCSV(
  exerciseId: string,
  sensorData: SensorDataPoint[],
  customerData: { name: string; id: string }
): { fileName: string; csvContent: string } | null {
  if (!sensorData || sensorData.length === 0) {
    console.log(`No raw sensor data to prepare for ${exerciseId}.`);
    return null;
  }

  const headers = [
    "Timestamp", "SampleIndex",
    "LeftThigh_AX", "LeftThigh_AY", "LeftThigh_AZ", "LeftThigh_GX", "LeftThigh_GY", "LeftThigh_GZ", "LeftThigh_MX", "LeftThigh_MY", "LeftThigh_MZ",
    "LeftShin_AX", "LeftShin_AY", "LeftShin_AZ", "LeftShin_GX", "LeftShin_GY", "LeftShin_GZ", "LeftShin_MX", "LeftShin_MY", "LeftShin_MZ",
    "RightThigh_AX", "RightThigh_AY", "RightThigh_AZ", "RightThigh_GX", "RightThigh_GY", "RightThigh_GZ", "RightThigh_MX", "RightThigh_MY", "RightThigh_MZ",
    "RightShin_AX", "RightShin_AY", "RightShin_AZ", "RightShin_GX", "RightShin_GY", "RightShin_GZ", "RightShin_MX", "RightShin_MY", "RightShin_MZ"
  ];

  const csvRows = [
    headers.join(','),
    ...sensorData.map(dataPoint => {
      const row = [
        formatMillisecondsToMMSS(dataPoint.timestamp),
        dataPoint.sample_index,
        dataPoint.left_thigh?.AX, dataPoint.left_thigh?.AY, dataPoint.left_thigh?.AZ,
        dataPoint.left_thigh?.GX, dataPoint.left_thigh?.GY, dataPoint.left_thigh?.GZ,
        dataPoint.left_thigh?.MX, dataPoint.left_thigh?.MY, dataPoint.left_thigh?.MZ,
        dataPoint.left_shin?.AX, dataPoint.left_shin?.AY, dataPoint.left_shin?.AZ,
        dataPoint.left_shin?.GX, dataPoint.left_shin?.GY, dataPoint.left_shin?.GZ,
        dataPoint.left_shin?.MX, dataPoint.left_shin?.MY, dataPoint.left_shin?.MZ,
        dataPoint.right_thigh?.AX, dataPoint.right_thigh?.AY, dataPoint.right_thigh?.AZ,
        dataPoint.right_thigh?.GX, dataPoint.right_thigh?.GY, dataPoint.right_thigh?.GZ,
        dataPoint.right_thigh?.MX, dataPoint.right_thigh?.MY, dataPoint.right_thigh?.MZ,
        dataPoint.right_shin?.AX, dataPoint.right_shin?.AY, dataPoint.right_shin?.AZ,
        dataPoint.right_shin?.GX, dataPoint.right_shin?.GY, dataPoint.right_shin?.GZ,
        dataPoint.right_shin?.MX, dataPoint.right_shin?.MY, dataPoint.right_shin?.MZ,
      ];
      return row.map(val => (val !== undefined && val !== null ? String(val) : "")).join(',');
    })
  ];

  const csvContent = csvRows.join('\n');
  const fileName = `${customerData.name}_${exerciseId}_raw_sensor_data.csv`;

  return { fileName, csvContent };
}

// The downloadCSV, downloadSensorDataAsCSV, and uploadSensorData functions are removed 
// as their functionality will be replaced by preparing CSV data and uploading to S3.

export interface IndividualSensorCSV {
  sensorName: string;
  fileName: string;
  csvContent: string;
}

/**
 * Prepares raw sensor data as multiple CSV strings, one for each sensor.
 * @param exerciseId The ID of the exercise.
 * @param sensorData Array of SensorDataPoint objects.
 * @param customerData Object containing customer details, expects 'name' and 'id'.
 * @returns Array of objects, each containing sensorName, fileName, and csvContent, or empty array if no data.
 */
export function prepareIndividualSensorDataCSVs(
  exerciseId: string,
  sensorData: SensorDataPoint[],
  customerData: { name: string; id: string }
): IndividualSensorCSV[] {
  if (!sensorData || sensorData.length === 0) {
    console.log(`No raw sensor data to prepare for ${exerciseId}.`);
    return [];
  }

  const sensorKeys: Array<keyof SensorDataPoint> = ['left_thigh', 'left_shin', 'right_thigh', 'right_shin'];
  const results: IndividualSensorCSV[] = [];

  // Standard headers for each individual sensor CSV
  const individualHeaders = ["Timestamp", "SampleIndex", "AX", "AY", "AZ", "GX", "GY", "GZ", "MX", "MY", "MZ"];

  sensorKeys.forEach(sensorKey => {
    const relevantDataPoints = sensorData.filter(dp => dp[sensorKey] != null);
    if (relevantDataPoints.length === 0) {
      console.log(`No data for sensor ${String(sensorKey)} in ${exerciseId}.`);
      return;
    }

    const csvRows = [
      individualHeaders.join(','),
      ...relevantDataPoints.map(dataPoint => {
        const sensorValues = dataPoint[sensorKey] as SensorIMUData | undefined; // Explicitly type sensorValues
        if (!sensorValues) return ""; 

        const row = [
          formatMillisecondsToMMSS(dataPoint.timestamp),
          dataPoint.sample_index,
          sensorValues.AX, sensorValues.AY, sensorValues.AZ,
          sensorValues.GX, sensorValues.GY, sensorValues.GZ,
          sensorValues.MX, sensorValues.MY, sensorValues.MZ,
        ];
        return row.map(val => (val !== undefined && val !== null ? String(val) : "")).join(',');
      }).filter(row => row !== "")
    ];

    if (csvRows.length <= 1) { // Only headers, no data
        console.log(`No processable data rows for sensor ${String(sensorKey)} in ${exerciseId} after mapping.`);
        return;
    }

    const csvContent = csvRows.join('\n');
    // Filename will be like: "LeftThigh_raw_sensor_data.csv". customerName and exerciseId will be prepended later.
    const baseFileName = `${String(sensorKey).replace(/_/g, '-')}_raw_sensor_data.csv`; 
    
    results.push({
      sensorName: String(sensorKey),
      fileName: baseFileName,
      csvContent,
    });
  });

  return results;
}
  
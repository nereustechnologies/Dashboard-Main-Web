import { type SensorDataPoint } from "@/hooks/use-bluetooth" // Assuming SensorDataPoint is exported from here or another accessible path

interface SensorIMUData {
  accX: number; accY: number; accZ: number;
  gyrX: number; gyrY: number; gyrZ: number;
  magX: number; magY: number; magZ: number;
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

export function formatSensorDataForCSV(
  data: Record<string, number[]>, // Data where keys match some/all of the headers
  headers: string[] // The headers to use for the CSV, also defines order
): string {
  let csvContent = headers.join(",") + "\n";
  console.log('Formatting Sensor Data with headers:', headers, 'Data:', data);

  let numRows = 0;
  if (headers.length > 0) {
    for (const header of headers) {
      if (data[header]) {
        numRows = Math.max(numRows, data[header].length);
      }
    }
  }
  // If headers is empty, numRows remains 0, and only headers row (empty if headers is empty) + newline is returned.

  for (let i = 0; i < numRows; i++) {
    const row = headers.map(header => {
      const value = data[header]?.[i];
      // Quote values to handle potential commas or quotes within the data itself.
      // Ensure undefined/null are represented as empty strings in CSV.
      const stringValue = value !== undefined && value !== null ? String(value) : "";
      return `"${stringValue.replace(/"/g, '""')}"`; // Escape double quotes
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
    stepUp: {
      headers: ["Timestamp", "Knee Angle Left", "Knee Angle Right", "Phase Label", "Rep Count"],
dataKeys: ["timestamp", "kneeAngleLeft", "kneeAngleRight", "phaseLabel", "repCount"],

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
  customerData: { name: string; id: string },
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
          value = formatTime(value); // Assuming formatTime is appropriate here, not formatMillisecondsToMMSS
        } else {
          value = value !== undefined && value !== null ? String(value) : "";
        }
        // Escape quotes and wrap in quotes if value contains comma or quote
        if (String(value).includes(',') || String(value).includes('"')) {
          value = `"${String(value).replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    })
  ];

  const csvContent = csvRows.join('\n');
  const fileName = `events.csv`;
  
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
    "LeftThigh_accX", "LeftThigh_accY", "LeftThigh_accZ", "LeftThigh_gyrX", "LeftThigh_gyrY", "LeftThigh_gyrZ", "LeftThigh_magX", "LeftThigh_magY", "LeftThigh_magZ",
    "LeftShin_accX", "LeftShin_accY", "LeftShin_accZ", "LeftShin_gyrX", "LeftShin_gyrY", "LeftShin_gyrZ", "LeftShin_magX", "LeftShin_magY", "LeftShin_magZ",
    "RightThigh_accX", "RightThigh_accY", "RightThigh_accZ", "RightThigh_gyrX", "RightThigh_gyrY", "RightThigh_gyrZ", "RightThigh_magX", "RightThigh_magY", "RightThigh_magZ",
    "RightShin_accX", "RightShin_accY", "RightShin_accZ", "RightShin_gyrX", "RightShin_gyrY", "RightShin_gyrZ", "RightShin_magX", "RightShin_magY", "RightShin_magZ"
  ];

  const csvRows = [
    headers.join(','),
    ...sensorData.map(dataPoint => {
      const row = [
        formatMillisecondsToMMSS(dataPoint.timestamp),
        dataPoint.sample_index,
        dataPoint.left_thigh?.accX, dataPoint.left_thigh?.accY, dataPoint.left_thigh?.accZ,
        dataPoint.left_thigh?.gyrX, dataPoint.left_thigh?.gyrY, dataPoint.left_thigh?.gyrZ,
        dataPoint.left_thigh?.magX, dataPoint.left_thigh?.magY, dataPoint.left_thigh?.magZ,
        dataPoint.left_shin?.accX, dataPoint.left_shin?.accY, dataPoint.left_shin?.accZ,
        dataPoint.left_shin?.gyrX, dataPoint.left_shin?.gyrY, dataPoint.left_shin?.gyrZ,
        dataPoint.left_shin?.magX, dataPoint.left_shin?.magY, dataPoint.left_shin?.magZ,
        dataPoint.right_thigh?.accX, dataPoint.right_thigh?.accY, dataPoint.right_thigh?.accZ,
        dataPoint.right_thigh?.gyrX, dataPoint.right_thigh?.gyrY, dataPoint.right_thigh?.gyrZ,
        dataPoint.right_thigh?.magX, dataPoint.right_thigh?.magY, dataPoint.right_thigh?.magZ,
        dataPoint.right_shin?.accX, dataPoint.right_shin?.accY, dataPoint.right_shin?.accZ,
        dataPoint.right_shin?.gyrX, dataPoint.right_shin?.gyrY, dataPoint.right_shin?.gyrZ,
        dataPoint.right_shin?.magX, dataPoint.right_shin?.magY, dataPoint.right_shin?.magZ,
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
  // customerData: { name: string; id: string }
): IndividualSensorCSV[] {
  if (!sensorData || sensorData.length === 0) {
    console.log(`No raw sensor data to prepare for ${exerciseId}.`);
    return [];
  }

  const sensorKeys: Array<keyof SensorDataPoint> = ['left_thigh', 'left_shin', 'right_thigh', 'right_shin'];
  const results: IndividualSensorCSV[] = [];

  // Standard headers for each individual sensor CSV
  const individualHeaders = ["Timestamp", "SampleIndex", "accX", "accY", "accZ", "gyrX", "gyrY", "gyrZ", "magX", "magY", "magZ"];

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
          sensorValues.accX, sensorValues.accY, sensorValues.accZ,
          sensorValues.gyrX, sensorValues.gyrY, sensorValues.gyrZ,
          sensorValues.magX, sensorValues.magY, sensorValues.magZ,
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

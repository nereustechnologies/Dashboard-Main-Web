import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"

// Modify the GET function to return more detailed exercise-specific data with the right column structure
export async function GET(request: NextRequest, { params }: { params: { exerciseId: string } }) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exerciseId = params.exerciseId
    const url = new URL(request.url)
    const customerId = url.searchParams.get("customerId")
    const includeAllData = url.searchParams.get("includeAllData") === "true"

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    // Generate exercise-specific CSV data based on the exercise type
    let exerciseData = []
    let csvHeaders = []

    // Configure columns based on exercise type
    if (exerciseId === "knee_flexion") {
      csvHeaders = ["Timestamp", "Knee Angle Left (°)", "Knee Angle Right (°)", "Leg Used", "Phase Label", "Rep Count"]
      exerciseData = generateKneeFlexionData()
    } else if (exerciseId === "lunge_stretch") {
      csvHeaders = [
        "Timestamp",
        "Hip Flexion Angle (°)",
        "Knee Flexion Angle Left (°)",
        "Knee Flexion Angle Right (°)",
        "Leg Used",
        "Phase Label",
        "Hold Duration (s)",
        "Reps",
      ]
      exerciseData = generateLungeStretchData()
    } else if (exerciseId === "knee_to_wall") {
      csvHeaders = ["Timestamp", "Knee Angle Left (°)", "Knee Angle Right (°)", "Leg Used", "Phase Label", "Rep Count"]
      exerciseData = generateKneeToWallData()
    } else if (exerciseId === "squats") {
      csvHeaders = [
        "Timestamp",
        "Knee Angle Left (°)",
        "Knee Angle Right (°)",
        "Hip Angle (°)",
        "Phase Label",
        "Rep Count",
      ]
      exerciseData = generateSquatsData()
    } else if (exerciseId === "lunges") {
      csvHeaders = [
        "Timestamp",
        "Knee Angle Left (°)",
        "Knee Angle Right (°)",
        "Hip Angle (°)",
        "Leg Used",
        "Phase Label",
        "Rep Count",
      ]
      exerciseData = generateLungesData()
    } else if (exerciseId === "plank_hold") {
      csvHeaders = ["Timestamp", "Hip Angle (°)", "Phase Label", "Hold Duration (s)"]
      exerciseData = generatePlankHoldData()
    } else if (exerciseId === "stepUp") {
      csvHeaders = [
        "Timestamp",
        "Knee Angle Left",
        "Knee Angle Right",
        "Phase Label",
        "Rep Count",
      ]
      exerciseData = generateStepUpData()
    } 
    else {
      // Generic format for other exercises
      csvHeaders = ["Timestamp", "Action", "Leg", "Rep Count"]
      exerciseData = generateGenericExerciseData()
    }

    // If includeAllData is true, also return sensor data
    let sensorData = null
    if (includeAllData) {
      sensorData = await getSensorDataForExercise(exerciseId, customerId, user.id)
    }

    return NextResponse.json({
      success: true,
      exerciseData: exerciseData,
      csvHeaders: csvHeaders,
      sensorData: sensorData,
    })
  } catch (error) {
    console.error("Error fetching exercise data:", error)
    return NextResponse.json({ error: "An error occurred while fetching exercise data" }, { status: 500 })
  }
}

// Helper functions to generate exercise-specific data with the right format
function generateKneeFlexionData() {
  return [
    {
      Timestamp: "00:00:01",
      "Knee Angle Left (°)": 45,
      "Knee Angle Right (°)": "-",
      "Leg Used": "Left",
      "Phase Label": "Rep Began",
      "Rep Count": 1,
    },
    {
      Timestamp: "00:00:02",
      "Knee Angle Left (°)": 90,
      "Knee Angle Right (°)": "-",
      "Leg Used": "Left",
      "Phase Label": "Max Knee Flexion",
      "Rep Count": 1,
    },
    {
      Timestamp: "00:00:03",
      "Knee Angle Left (°)": 5,
      "Knee Angle Right (°)": "-",
      "Leg Used": "Left",
      "Phase Label": "Max Knee Extension",
      "Rep Count": 1,
    },
    {
      Timestamp: "00:00:04",
      "Knee Angle Left (°)": 45,
      "Knee Angle Right (°)": "-",
      "Leg Used": "Left",
      "Phase Label": "Rep Ended",
      "Rep Count": 1,
    },
    {
      Timestamp: "00:00:05",
      "Knee Angle Left (°)": "-",
      "Knee Angle Right (°)": 48,
      "Leg Used": "Right",
      "Phase Label": "Rep Began",
      "Rep Count": 2,
    },
    {
      Timestamp: "00:00:06",
      "Knee Angle Left (°)": "-",
      "Knee Angle Right (°)": 90,
      "Leg Used": "Right",
      "Phase Label": "Max Knee Flexion",
      "Rep Count": 2,
    },
    {
      Timestamp: "00:00:07",
      "Knee Angle Left (°)": "-",
      "Knee Angle Right (°)": 12,
      "Leg Used": "Right",
      "Phase Label": "Max Knee Extension",
      "Rep Count": 2,
    },
    {
      Timestamp: "00:00:08",
      "Knee Angle Left (°)": "-",
      "Knee Angle Right (°)": 48,
      "Leg Used": "Right",
      "Phase Label": "Rep Ended",
      "Rep Count": 2,
    },
  ]
}

function generateLungeStretchData() {
  return [
    {
      Timestamp: "00:00:01",
      "Hip Flexion Angle (°)": 20,
      "Knee Flexion Angle Left (°)": 90,
      "Knee Flexion Angle Right (°)": 10,
      "Leg Used": "Left",
      "Phase Label": "Hold Began",
      "Hold Duration (s)": 0,
      Reps: 1,
    },
    {
      Timestamp: "00:00:05",
      "Hip Flexion Angle (°)": 22,
      "Knee Flexion Angle Left (°)": 92,
      "Knee Flexion Angle Right (°)": 12,
      "Leg Used": "Left",
      "Phase Label": "Holding",
      "Hold Duration (s)": 4,
      Reps: 1,
    },
    {
      Timestamp: "00:00:10",
      "Hip Flexion Angle (°)": 21,
      "Knee Flexion Angle Left (°)": 91,
      "Knee Flexion Angle Right (°)": 11,
      "Leg Used": "Left",
      "Phase Label": "Hold Ended",
      "Hold Duration (s)": 9,
      Reps: 1,
    },
    {
      Timestamp: "00:00:12",
      "Hip Flexion Angle (°)": 18,
      "Knee Flexion Angle Left (°)": 10,
      "Knee Flexion Angle Right (°)": 90,
      "Leg Used": "Right",
      "Phase Label": "Hold Began",
      "Hold Duration (s)": 0,
      Reps: 2,
    },
    {
      Timestamp: "00:00:17",
      "Hip Flexion Angle (°)": 19,
      "Knee Flexion Angle Left (°)": 12,
      "Knee Flexion Angle Right (°)": 92,
      "Leg Used": "Right",
      "Phase Label": "Holding",
      "Hold Duration (s)": 5,
      Reps: 2,
    },
    {
      Timestamp: "00:00:22",
      "Hip Flexion Angle (°)": 17,
      "Knee Flexion Angle Left (°)": 10,
      "Knee Flexion Angle Right (°)": 91,
      "Leg Used": "Right",
      "Phase Label": "Hold Ended",
      "Hold Duration (s)": 10,
      Reps: 2,
    },
  ]
}

function generateKneeToWallData() {
  return [
    {
      Timestamp: "00:00:01",
      "Knee Angle Left (°)": 20,
      "Knee Angle Right (°)": "-",
      "Leg Used": "Left",
      "Phase Label": "Rep Began",
      "Rep Count": 1,
    },
    {
      Timestamp: "00:00:02",
      "Knee Angle Left (°)": 50,
      "Knee Angle Right (°)": "-",
      "Leg Used": "Left",
      "Phase Label": "Max Knee Flexion",
      "Rep Count": 1,
    },
    {
      Timestamp: "00:00:03",
      "Knee Angle Left (°)": 20,
      "Knee Angle Right (°)": "-",
      "Leg Used": "Left",
      "Phase Label": "Rep Ended",
      "Rep Count": 1,
    },
    {
      Timestamp: "00:00:04",
      "Knee Angle Left (°)": "-",
      "Knee Angle Right (°)": 18,
      "Leg Used": "Right",
      "Phase Label": "Rep Began",
      "Rep Count": 2,
    },
    {
      Timestamp: "00:00:05",
      "Knee Angle Left (°)": "-",
      "Knee Angle Right (°)": 55,
      "Leg Used": "Right",
      "Phase Label": "Max Knee Flexion",
      "Rep Count": 2,
    },
    {
      Timestamp: "00:00:06",
      "Knee Angle Left (°)": "-",
      "Knee Angle Right (°)": 18,
      "Leg Used": "Right",
      "Phase Label": "Rep Ended",
      "Rep Count": 2,
    },
  ]
}

function generateSquatsData() {
  return [
    {
      Timestamp: "00:00:01",
      "Knee Angle Left (°)": 30,
      "Knee Angle Right (°)": 30,
      "Hip Angle (°)": 60,
      "Phase Label": "Rep Began",
      "Rep Count": 1,
    },
    {
      Timestamp: "00:00:02",
      "Knee Angle Left (°)": 90,
      "Knee Angle Right (°)": 90,
      "Hip Angle (°)": 110,
      "Phase Label": "Full Squat",
      "Rep Count": 1,
    },
    {
      Timestamp: "00:00:03",
      "Knee Angle Left (°)": 30,
      "Knee Angle Right (°)": 30,
      "Hip Angle (°)": 60,
      "Phase Label": "Rep Ended",
      "Rep Count": 1,
    },
    {
      Timestamp: "00:00:04",
      "Knee Angle Left (°)": 32,
      "Knee Angle Right (°)": 32,
      "Hip Angle (°)": 62,
      "Phase Label": "Rep Began",
      "Rep Count": 2,
    },
    {
      Timestamp: "00:00:05",
      "Knee Angle Left (°)": 88,
      "Knee Angle Right (°)": 88,
      "Hip Angle (°)": 108,
      "Phase Label": "Full Squat",
      "Rep Count": 2,
    },
    {
      Timestamp: "00:00:06",
      "Knee Angle Left (°)": 32,
      "Knee Angle Right (°)": 32,
      "Hip Angle (°)": 62,
      "Phase Label": "Rep Ended",
      "Rep Count": 2,
    },
  ]
}

function generateLungesData() {
  return [
    {
      Timestamp: "00:00:01",
      "Knee Angle Left (°)": 30,
      "Knee Angle Right (°)": 90,
      "Hip Angle (°)": 110,
      "Leg Used": "Left",
      "Phase Label": "Rep Began",
      "Rep Count": 1,
    },
    {
      Timestamp: "00:00:02",
      "Knee Angle Left (°)": 90,
      "Knee Angle Right (°)": 100,
      "Hip Angle (°)": 130,
      "Leg Used": "Left",
      "Phase Label": "Full Lunge",
      "Rep Count": 1,
    },
    {
      Timestamp: "00:00:03",
      "Knee Angle Left (°)": 30,
      "Knee Angle Right (°)": 90,
      "Hip Angle (°)": 110,
      "Leg Used": "Left",
      "Phase Label": "Rep Ended",
      "Rep Count": 1,
    },
    {
      Timestamp: "00:00:04",
      "Knee Angle Left (°)": 28,
      "Knee Angle Right (°)": 88,
      "Hip Angle (°)": 108,
      "Leg Used": "Right",
      "Phase Label": "Rep Began",
      "Rep Count": 2,
    },
    {
      Timestamp: "00:00:05",
      "Knee Angle Left (°)": 88,
      "Knee Angle Right (°)": 98,
      "Hip Angle (°)": 128,
      "Leg Used": "Right",
      "Phase Label": "Full Lunge",
      "Rep Count": 2,
    },
    {
      Timestamp: "00:00:06",
      "Knee Angle Left (°)": 28,
      "Knee Angle Right (°)": 88,
      "Hip Angle (°)": 108,
      "Leg Used": "Right",
      "Phase Label": "Rep Ended",
      "Rep Count": 2,
    },
  ]
}

function generatePlankHoldData() {
  return [
    { Timestamp: "00:00:01", "Hip Angle (°)": 175, "Phase Label": "Hold Started", "Hold Duration (s)": 1 },
    { Timestamp: "00:00:02", "Hip Angle (°)": 176, "Phase Label": "Holding", "Hold Duration (s)": 2 },
    { Timestamp: "00:00:03", "Hip Angle (°)": 174, "Phase Label": "Holding", "Hold Duration (s)": 3 },
    { Timestamp: "00:00:04", "Hip Angle (°)": 172, "Phase Label": "Holding", "Hold Duration (s)": 4 },
    { Timestamp: "00:00:05", "Hip Angle (°)": 170, "Phase Label": "Holding", "Hold Duration (s)": 5 },
    { Timestamp: "00:00:06", "Hip Angle (°)": 160, "Phase Label": "Hold Ended", "Hold Duration (s)": 6 },
  ]
}

function generateStepUpData() {
  return [
  {
    Timestamp: "00:00:01",
    "Knee Angle Left": 45,
    "Knee Angle Right": 43,
    "Phase Label": "step Ups Started",
    "Rep Count": 1,
  },
  {
    Timestamp: "00:00:02",
    "Knee Angle Left": 52,
    "Knee Angle Right": 50,
    "Phase Label": "",
    "Rep Count": 1,
  },
  {
    Timestamp: "00:00:03",
    "Knee Angle Left": 58,
    "Knee Angle Right": 55,
    "Phase Label": "",
    "Rep Count": 1,
  },
  {
    Timestamp: "00:00:04",
    "Knee Angle Left": 62,
    "Knee Angle Right": 60,
    "Phase Label": "",
    "Rep Count": 1,
  },
  {
    Timestamp: "00:00:05",
    "Knee Angle Left": 59,
    "Knee Angle Right": 58,
    "Phase Label": "",
    "Rep Count": 1,
  },
  {
    Timestamp: "00:00:06",
    "Knee Angle Left": 55,
    "Knee Angle Right": 53,
    "Phase Label": "",
    "Rep Count": 1,
  },
  {
    Timestamp: "00:00:07",
    "Knee Angle Left": 48,
    "Knee Angle Right": 47,
    "Phase Label": "",
    "Rep Count": 1,
  },
]

}



function generateGenericExerciseData() {
  return [
    { Timestamp: "00:00:01", Action: "Exercise Started", Leg: "N/A", "Rep Count": 1 },
    { Timestamp: "00:00:02", Action: "Rep Began", Leg: "Left", "Rep Count": 1 },
    { Timestamp: "00:00:03", Action: "Rep Ended", Leg: "Left", "Rep Count": 1 },
    { Timestamp: "00:00:04", Action: "Rep Began", Leg: "Right", "Rep Count": 2 },
    { Timestamp: "00:00:05", Action: "Rep Ended", Leg: "Right", "Rep Count": 2 },
    { Timestamp: "00:00:06", Action: "Exercise Ended", Leg: "N/A", "Rep Count": 2 },
  ]
}

async function getSensorDataForExercise(exerciseId: string, customerId: string, userId: string) {
  // This would fetch real sensor data in production
  // For now, generate mock sensor data
  return {
    leftLower: generateMockSensorData(20),
    leftUpper: generateMockSensorData(20),
    rightLower: generateMockSensorData(20),
    rightUpper: generateMockSensorData(20),
  }
}

// This function remains the same
function generateMockSensorData(count: number) {
  const data = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - (count - i) * 1000).toISOString()

    data.push({
      accX: (Math.random() * 0.2).toFixed(6),
      accY: (0.99 + Math.random() * 0.01).toFixed(6),
      accZ: (Math.random() * 0.1).toFixed(6),
      gyrX: (Math.random() * 2 - 1).toFixed(2),
      gyrY: (Math.random() * 2 - 2).toFixed(2),
      gyrZ: (Math.random() * 2 - 1).toFixed(2),
      magX: (Math.random() * 2 - 1).toFixed(2),
      magY: (Math.random() * 2 - 1).toFixed(2),
      magZ: (Math.random() * 2 - 1).toFixed(2),
      timestamp,
    })
  }

  return data
}


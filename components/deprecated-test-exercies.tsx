"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useTestStep } from "@/components/test-step-context";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Activity,
  Download,
  Database,
} from "lucide-react"

interface TestExercisesProps {
  onComplete: (exerciseData: any) => void
  customerData: any
}

interface Exercise {
  id: string;
  name: string;
  completed: boolean;
}

interface ExerciseState {
  mobility: Exercise[];
  strength: Exercise[];
  endurance: Exercise[];
}

type ExerciseCategory = keyof ExerciseState;

interface SensorData {
  AX: number;
  AY: number;
  AZ: number;
  GX: number;
  GY: number;
  GZ: number;
  MX: number;
  MY: number;
  MZ: number;
}

interface WebSocketData {
  left_thigh: SensorData;
  left_shin: SensorData;
  right_thigh: SensorData;
  right_shin: SensorData;
  timestamp: number;
  sample_index: number;
}

interface SensorDataState {
  [timestamp: string]: WebSocketData;
}

interface SensorCSVContent {
  left_thigh: string;
  left_shin: string;
  right_thigh: string;
  right_shin: string;
}

export default function TestExercises({ onComplete, customerData }: TestExercisesProps) {
  const [activeCategory, setActiveCategory] = useState("mobility")
  const [activeExercise, setActiveExercise] = useState<string | null>(null)
  const [exerciseStarted, setExerciseStarted] = useState(false)
  const { step, setStep } = useTestStep();
  const [timer, setTimer] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [mobilityCompleted, setMobilityCompleted] = useState(false)
  const [strengthCompleted, setStrengthCompleted] = useState(false)
  const [enduranceCompleted, setEnduranceCompleted] = useState(false)
  const [exerciseData, setExerciseData] = useState<any[]>([])
  const [currentLeg, setCurrentLeg] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [showSensorData, setShowSensorData] = useState(false)
  const [generatingZip, setGeneratingZip] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null) // Added state for last action
  const [sensorData, setSensorData] = useState<SensorDataState>({}) // Add state for WebSocket sensor data
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)

  // Reference to store CSV data
  const csvDataRef = useRef<{ [key: string]: any[] }>({})

  const orderedCategories = ["mobility", "strength", "endurance"];

  const socketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    const socket = new WebSocket('ws://localhost:8765');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('✅ Connected to Python WebSocket Server');
      setIsWebSocketConnected(true);
    };

    socket.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const jsonData = JSON.parse(event.data) as WebSocketData;
          if (typeof jsonData === 'object' && jsonData !== null) {
            // Store the raw sensor data with timestamp
            setSensorData(prevData => {
              const newData = { ...prevData };
              const timestamp = jsonData.timestamp || Date.now();
              newData[timestamp] = jsonData;
              return newData;
            });
          }
        } catch (e) {
          console.log('Received non-JSON string or malformed JSON:', event.data);
        }
      }
    };

    socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setIsWebSocketConnected(false);
    };

    socket.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setIsWebSocketConnected(false);
    };
  };

  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsWebSocketConnected(false);
    }
  };

  const exercises = {
    mobility: [
      { id: "knee_flexion", name: "Knee Flexion & Extension", completed: false },
      { id: "lunge_stretch", name: "Lunge Stretch", completed: false },
      { id: "knee_to_wall", name: "Knee to Wall", completed: false },
    ],
    strength: [
      { id: "squats", name: "Squats", completed: false },
      { id: "lunges", name: "Lunges", completed: false },
    ],
    endurance: [
      { id: "plank_hold", name: "Plank Hold", completed: false },
      { id: "stepUp", name: "step Ups", completed: false },
     
    ],
  }

  const [exerciseState, setExerciseState] = useState(exercises)

  useEffect(() => {
    // Check if all exercises in a category are completed
    const allMobilityCompleted = exerciseState.mobility.every((ex) => ex.completed)
    const allStrengthCompleted = exerciseState.strength.every((ex) => ex.completed)
    const allEnduranceCompleted = exerciseState.endurance.every((ex) => ex.completed)

    setMobilityCompleted(allMobilityCompleted)
    setStrengthCompleted(allStrengthCompleted)
    setEnduranceCompleted(allEnduranceCompleted)
  }, [exerciseState])

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const startExercise = (exerciseId: string) => {
    setActiveExercise(exerciseId)
    setExerciseStarted(true)
    setTimer(0)
    setCurrentLeg(null)
    setError("")
    setShowSensorData(false)
    setLastAction(null) // Reset last action
    setSensorData({}) // Clear previous sensor data

    // Connect to WebSocket when starting exercise
    connectWebSocket();

    // Initialize CSV data for this exercise if it doesn't exist
    if (!csvDataRef.current[exerciseId]) {
      csvDataRef.current[exerciseId] = []
    }

    // Start timer
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)

    setTimerInterval(interval)

    // Record exercise start
    recordAction("Exercise Started")
  }

  const downloadCSV = async (exerciseId: string) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      // Fetch exercise data from API with a flag to include all data (including sensor data)
      const response = await fetch(
        `/api/exercise-data/${exerciseId}?customerId=${customerData.id}&includeAllData=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch exercise data")
      }

      const data = await response.json()
      const exerciseData = data.exerciseData
      const csvHeaders = data.csvHeaders
      const sensorData = data.sensorData

      if (!exerciseData || exerciseData.length === 0) {
        alert("No data available for this exercise")
        return
      }

      // Create CSV content with proper headers
      let csvContent = csvHeaders.join(",") + "\n"

      exerciseData.forEach((row: any) => {
        const values = csvHeaders.map((header: string) => {
          const value = row[header] || ""
          // Escape commas and quotes
          return `"${value.toString().replace(/"/g, '""')}"`
        })
        csvContent += values.join(",") + "\n"
      })

      // Create and download the exercise data CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${exerciseId}_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Remove the automatic sensor data download code
      // If sensor data is available, automatically download it as well
      // if (sensorData) {
      //   // Download sensor data for each sensor
      //   ;["leftLower", "leftUpper", "rightLower", "rightUpper"].forEach((sensor, index) => {
      //     if (sensorData[sensor] && sensorData[sensor].length > 0) {
      //       const sensorHeaders = ["timestamp", "accX", "accY", "accZ", "gyrX", "gyrY", "gyrZ", "magX", "magY", "magZ"]
      //       let sensorCsvContent = sensorHeaders.join(",") + "\n"
      //
      //       sensorData[sensor].forEach((row: any) => {
      //         const values = sensorHeaders.map((header: string) => {
      //           const value = row[header] || ""
      //           return `"${value.toString().replace(/"/g, '""')}"`
      //         })
      //         sensorCsvContent += values.join(",") + "\n"
      //       })
      //
      //       // Create and download the sensor data CSV file
      //       const sensorBlob = new Blob([sensorCsvContent], { type: "text/csv;charset=utf-8;" })
      //       const sensorUrl = URL.createObjectURL(sensorBlob)
      //       const sensorLink = document.createElement("a")
      //       sensorLink.setAttribute("href", sensorUrl)
      //       sensorLink.setAttribute(
      //         "download",
      //         `${exerciseId}_${sensor}_sensor_data_${new Date().toISOString().split("T")[0]}.csv`,
      //       )
      //
      //       // Add a small delay between downloads to prevent browser blocking
      //       setTimeout(
      //         () => {
      //           document.body.appendChild(sensorLink)
      //           sensorLink.click()
      //           document.body.removeChild(sensorLink)
      //         },
      //         500 * (index + 1),
      //       )
      //     }
      //   })
      // }

      // Remove the original link
    } catch (error) {
      console.error("Error downloading CSV:", error)
      alert(error instanceof Error ? error.message : "An error occurred while downloading CSV")
    }
  }

  const formatSensorDataForCSV = (data: SensorDataState): SensorCSVContent => {
    // Define the headers for each sensor's CSV
    const headers = ["timestamp", "sample_index", "AX", "AY", "AZ", "GX", "GY", "GZ", "MX", "MY", "MZ"];
    
    // Create separate CSV content for each sensor
    const sensorCSVs: SensorCSVContent = {
      left_thigh: headers.join(",") + "\n",
      left_shin: headers.join(",") + "\n",
      right_thigh: headers.join(",") + "\n",
      right_shin: headers.join(",") + "\n"
    };

    // Process each data point
    Object.entries(data).forEach(([timestamp, sensorData]) => {
      // Each sensor's data
      const sensors = ["left_thigh", "left_shin", "right_thigh", "right_shin"] as const;
      
      sensors.forEach(sensor => {
        if (sensorData[sensor]) {
          const row = [
            timestamp,
            sensorData.sample_index,
            sensorData[sensor].AX.toFixed(6),
            sensorData[sensor].AY.toFixed(6),
            sensorData[sensor].AZ.toFixed(6),
            sensorData[sensor].GX.toFixed(6),
            sensorData[sensor].GY.toFixed(6),
            sensorData[sensor].GZ.toFixed(6),
            sensorData[sensor].MX.toFixed(6),
            sensorData[sensor].MY.toFixed(6),
            sensorData[sensor].MZ.toFixed(6)
          ];
          
          sensorCSVs[sensor] += row.join(",") + "\n";
        }
      });
    });

    return sensorCSVs;
  };

  const downloadSensorCSV = (sensorName: keyof SensorCSVContent, exerciseId: string, sensorData: SensorDataState) => {
    try {
      const sensorCSVs = formatSensorDataForCSV(sensorData);
      const csvContent = sensorCSVs[sensorName];
      // Convert string to Uint8Array
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(csvContent);
      const blob = new Blob([uint8Array], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${exerciseId}_${sensorName}_sensor_data_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading sensor data:", error);
    }
  };

  const recordAction = async (action: string, leg?: string) => {
    if (!activeExercise) return

    const timestamp = formatTime(timer)
    setLastAction(action) // Set last action

    // Build exercise-specific data
    let exerciseData: Record<string, any> = {
      timestamp,
      action,
      leg: leg || currentLeg || "N/A",
      exerciseId: activeExercise,
      customerId: customerData.id,
    }

    if (action === "Exercise Skipped") {
      exerciseData.phaseLabel = "Skipped";
      exerciseData.repCount = 0; // Default rep count for skipped

      if (activeExercise === "knee_flexion" || activeExercise === "knee_to_wall") {
        exerciseData.kneeAngleLeft = "-";
        exerciseData.kneeAngleRight = "-";
      } else if (activeExercise === "lunge_stretch") {
        exerciseData.hipFlexionAngle = 0;
        exerciseData.kneeFlexionAngleLeft = "-";
        exerciseData.kneeFlexionAngleRight = "-";
        exerciseData.phaseLabel = "Skipped"; // Already set, but good to be explicit
        exerciseData.holdDuration = 0;
        exerciseData.reps = 0; // Specific field for lunge_stretch
      } else if (activeExercise === "squats") {
        exerciseData.kneeAngleLeft = "-";
        exerciseData.kneeAngleRight = "-";
        exerciseData.hipAngle = "-";
      } else if (activeExercise === "lunges") {
        exerciseData.kneeAngleLeft = "-";
        exerciseData.kneeAngleRight = "-";
        exerciseData.hipAngle = "-";
      } else if (activeExercise === "plank_hold") {
        exerciseData.hipAngle = "-";
        exerciseData.holdDuration = 0;
      } else if (activeExercise === "stepUp") {
        exerciseData.velocity = "0";
        exerciseData.acceleration = "0";
        exerciseData.strideLength = "0";
        exerciseData.cadence = "0";
      } 
    } else {
      // Add exercise-specific fields based on exercise type for non-skipped actions
      const repCount = calculateRepCount()

      if (activeExercise === "knee_flexion" || activeExercise === "knee_to_wall") {
        exerciseData = {
          ...exerciseData,
          kneeAngleLeft: leg === "left" || currentLeg === "left" ? generateRandomAngle(5, 90) : "-",
          kneeAngleRight: leg === "right" || currentLeg === "right" ? generateRandomAngle(12, 90) : "-",
          phaseLabel: action,
          repCount,
        }
      } else if (activeExercise === "lunge_stretch") {
        exerciseData = {
          ...exerciseData,
          hipFlexionAngle: generateRandomAngle(17, 22),
          kneeFlexionAngleLeft:
            leg === "left" || currentLeg === "left" ? generateRandomAngle(90, 92) : generateRandomAngle(10, 12),
          kneeFlexionAngleRight:
            leg === "right" || currentLeg === "right" ? generateRandomAngle(90, 92) : generateRandomAngle(10, 12),
          phaseLabel: action,
          holdDuration: action === "Hold Ended" ? timer : 0,
          reps: repCount,
        }
      } else if (activeExercise === "squats") {
        exerciseData = {
          ...exerciseData,
          kneeAngleLeft: generateRandomAngle(30, 90),
          kneeAngleRight: generateRandomAngle(30, 90),
          hipAngle: generateRandomAngle(60, 110),
          phaseLabel: action,
          repCount,
        }
      } else if (activeExercise === "lunges") {
        exerciseData = {
          ...exerciseData,
          kneeAngleLeft: generateRandomAngle(28, 90),
          kneeAngleRight: generateRandomAngle(88, 100),
          hipAngle: generateRandomAngle(108, 130),
          phaseLabel: action,
          repCount,
        }
      } else if (activeExercise === "plank_hold") {
        exerciseData = {
          ...exerciseData,
          hipAngle: generateRandomAngle(160, 176),
          phaseLabel: action,
          holdDuration: action === "Hold Ended" ? timer : action === "Holding" ? timer - 1 : 1,
        }
      } else if (activeExercise === "stepUp") {
        exerciseData = {
          ...exerciseData,
          velocity: generateRandomValue(2.5, 9.3),
          acceleration: generateRandomValue(-1.2, 3.1),
          strideLength: generateRandomValue(1.0, 1.75),
          cadence: generateRandomValue(160, 192),
          phaseLabel: action,
        }
      } 
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      // Send exercise data to API
      const response = await fetch("/api/exercise-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(exerciseData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to record exercise data")
      }

      // Add to exercise data
      setExerciseData((prev) => [...prev, exerciseData])

      // Add to CSV data
      if (csvDataRef.current[activeExercise]) {
        csvDataRef.current[activeExercise].push(exerciseData)
      }

      console.log(`Recording: ${action}, Time: ${timestamp}, Leg: ${leg || currentLeg || "N/A"}`)
    } catch (error) {
      console.error("Error recording exercise data:", error)
      setError(error instanceof Error ? error.message : "An error occurred while recording exercise data")
    }
  }

  // Helper functions for generating random values for exercise data
  function generateRandomAngle(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  function generateRandomValue(min: number, max: number) {
    return (Math.random() * (max - min) + min).toFixed(1)
  }

  function calculateRepCount() {
    // Simple logic to determine rep count based on actions recorded
    const actionsForExercise = exerciseData.filter((data) => data.exerciseId === activeExercise && data.action !== "Exercise Skipped")
    const endActions = actionsForExercise.filter(
      (data) => data.action === "Rep Ended" || data.action === "Hold Ended" || data.action === "stepUp ended",
    )

    return endActions.length + 1
  }

  const setLeg = (leg: string) => {
    setCurrentLeg(leg)
    recordAction(`Selected ${leg} Leg`, leg)
  }

  const toggleSensorData = () => {
    setShowSensorData(!showSensorData)
    if (!showSensorData && activeExercise) {
      // Prepare for CSV download when showing the export option
      console.log(`Preparing CSV export for ${activeExercise}`)
    }
  }

  const generateAndCompleteTest = async () => {
    setGeneratingZip(true)
    setError("")

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      // Prepare data for zip generation
      const zipData = {
        customerId: customerData.id,
        customerName: customerData.name,
        exerciseData: csvDataRef.current,
        date: new Date().toISOString().split("T")[0],
      }

      // Generate zip file via API
      const response = await fetch("/api/generate-zip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(zipData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate exercise report")
      }

      const data = await response.json()

      // Show success message or prompt to download
      alert(`Test completed! Report has been saved for ${customerData.name}.`)

      // Pass the data back to parent
      onComplete({
        exercises: csvDataRef.current,
        zipFileId: data.zipFileId,
      })
    } catch (error) {
      console.error("Error generating test report:", error)
      setError(error instanceof Error ? error.message : "An error occurred while generating the test report")
    } finally {
      setGeneratingZip(false)
    }
  }

  const completeExercise = async () => {
    if (!activeExercise) return;

    try {
      // Find the current exercise in the state and mark it as completed
      setExerciseState((prevState: ExerciseState) => {
        const updatedState = { ...prevState };
        for (const category of ['mobility', 'strength', 'endurance'] as ExerciseCategory[]) {
          const exerciseIndex = updatedState[category].findIndex((ex) => ex.id === activeExercise);
          if (exerciseIndex !== -1) {
            updatedState[category] = [
              ...updatedState[category].slice(0, exerciseIndex),
              { ...updatedState[category][exerciseIndex], completed: true },
              ...updatedState[category].slice(exerciseIndex + 1),
            ];
            break;
          }
        }
        return updatedState;
      });

      // Stop the timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      // Upload sensor data if available
      if (Object.keys(sensorData).length > 0) {
        // Convert sensor data to CSV format
        const csvContent = formatSensorDataForCSV(sensorData);
        const csvBlob = new Blob([csvContent.toString()], { type: 'text/csv' });
        const csvFile = new File([csvBlob], `${activeExercise}_${Date.now()}.csv`, { type: 'text/csv' });

        // Create form data and append the file and customerId
        const formData = new FormData();
        formData.append('file', csvFile);
        if (customerData && customerData.id) {
          formData.append('customerId', customerData.name);
        }

        // Upload to API
        const response = await fetch('/api/sensorupload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload sensor data');
        }

        // Download local copy as well
        downloadSensorCSV("left_thigh", activeExercise, sensorData);
        downloadSensorCSV("left_shin", activeExercise, sensorData);
        downloadSensorCSV("right_thigh", activeExercise, sensorData);
        downloadSensorCSV("right_shin", activeExercise, sensorData);
      }

      // Disconnect WebSocket when exercise is completed
      disconnectWebSocket();

      // Reset exercise state
      setActiveExercise(null);
      setExerciseStarted(false);
      setTimer(0);
      setCurrentLeg(null);
      setLastAction(null);
    } catch (error) {
      console.error('Error completing exercise:', error);
      setError('Failed to complete exercise. Please try again.');
    }
  };

  const handleSkipExercise = async () => {
    if (!activeExercise) return;

    // Record the skip action
    await recordAction("Exercise Skipped", currentLeg || undefined);

    // Mark exercise as completed
    setExerciseState((prevState: ExerciseState) => {
      const updatedState = { ...prevState };
      const categories: ExerciseCategory[] = ["mobility", "strength", "endurance"];
      
      for (const category of categories) {
        const exerciseIndex = updatedState[category].findIndex((ex) => ex.id === activeExercise);
        if (exerciseIndex !== -1) {
          updatedState[category] = [
            ...updatedState[category].slice(0, exerciseIndex),
            { ...updatedState[category][exerciseIndex], completed: true },
            ...updatedState[category].slice(exerciseIndex + 1),
          ];
          break;
        }
      }
      return updatedState;
    });

    // Stop the timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    // Disconnect WebSocket when exercise is skipped
    disconnectWebSocket();

    // Reset exercise state
    setActiveExercise(null);
    setExerciseStarted(false);
    setTimer(0);
    setCurrentLeg(null);
    setLastAction("Exercise Skipped"); // Update last action
  };

  const currentCategoryIndex = orderedCategories.indexOf(activeCategory);

  const canGoToPreviousCategory = !exerciseStarted && currentCategoryIndex > 0;
  const previousCategoryName = canGoToPreviousCategory ? orderedCategories[currentCategoryIndex - 1] : "";

  const canGoToNextCategory = !exerciseStarted && currentCategoryIndex < orderedCategories.length - 1;
  const nextCategoryName = canGoToNextCategory ? orderedCategories[currentCategoryIndex + 1] : "";
  let isNextCategoryEnabled = false;
  if (canGoToNextCategory) {
    if (activeCategory === "mobility" && mobilityCompleted) {
      isNextCategoryEnabled = true;
    } else if (activeCategory === "strength" && strengthCompleted) {
      isNextCategoryEnabled = true;
    }
  }

  const retryExercise = (exerciseId: string) => {
    // Mark the exercise as not completed
    setExerciseState((prevState: ExerciseState) => {
      const updatedState = { ...prevState };
      for (const category of ['mobility', 'strength', 'endurance'] as ExerciseCategory[]) {
        const exerciseIndex = updatedState[category].findIndex((ex) => ex.id === exerciseId);
        if (exerciseIndex !== -1) {
          updatedState[category] = [
            ...updatedState[category].slice(0, exerciseIndex),
            { ...updatedState[category][exerciseIndex], completed: false },
            ...updatedState[category].slice(exerciseIndex + 1),
          ];
          break;
        }
      }
      return updatedState;
    });
    // Optionally clear previous sensor data and exercise data for this exercise
    setExerciseData((prev) => prev.filter((d) => d.exerciseId !== exerciseId));
    csvDataRef.current[exerciseId] = [];
    setSensorData({});
    setShowSensorData(false);
    setActiveExercise(null);
    setExerciseStarted(false);
    setTimer(0);
    setCurrentLeg(null);
    setLastAction(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Activity size={20} className="text-[#00D4EF]" />
          Test Exercises
        </h3>
        <p className="text-sm text-gray-400">Complete all exercises in order: Mobility → Strength → Endurance</p>
      </div>

      {error && <div className="p-3 text-sm bg-red-500/20 border border-red-500 rounded text-red-500">{error}</div>}

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mobility" className={mobilityCompleted ? "text-green-500" : ""}>
            Mobility
            {mobilityCompleted && " ✓"}
          </TabsTrigger>
          <TabsTrigger
            value="strength"
            className={strengthCompleted ? "text-green-500" : ""}
          >
            Strength
            {strengthCompleted && " ✓"}
          </TabsTrigger>
          <TabsTrigger
            value="endurance"
            className={enduranceCompleted ? "text-green-500" : ""}
          >
            Endurance
            {enduranceCompleted && " ✓"}
          </TabsTrigger>
        </TabsList>

        {/* Mobility Exercises */}
        <TabsContent value="mobility">
          <div className="space-y-4">
            {exerciseState.mobility.map((exercise) => (
              <Card
                key={exercise.id}
                className={`border ${exercise.completed ? "border-green-500" : "border-gray-700"} bg-gray-900`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{exercise.name}</h4>
                      {exercise.completed && (
                        <Badge className="bg-green-500 mt-1 flex items-center gap-1">
                          <CheckCircle size={12} />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {exercise.completed && (
                        <>
                          <Button
                            onClick={() => downloadCSV(exercise.id)}
                            variant="outline"
                            size="sm"
                            className="border-green-500 text-green-500"
                          >
                            <Download size={16} className="mr-1" />
                            CSV
                          </Button>
                          <Button
                            onClick={() => {
                              setActiveExercise(exercise.id)
                              setShowSensorData(true)
                            }}
                            variant="outline"
                            size="sm"
                            className="border-blue-500 text-blue-500"
                          >
                            <Database size={16} className="mr-1" />
                            Sensor Data
                          </Button>
                          <Button
                            onClick={() => retryExercise(exercise.id)}
                            variant="outline"
                            size="sm"
                            className="border-yellow-500 text-yellow-500"
                          >
                            Retry Exercise
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => startExercise(exercise.id)}
                        disabled={exerciseStarted || exercise.completed}
                        className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black"
                      >
                        <Play size={16} className="mr-1" />
                        Start Exercise
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Strength Exercises */}
        <TabsContent value="strength">
          <div className="space-y-4">
            {exerciseState.strength.map((exercise) => (
              <Card
                key={exercise.id}
                className={`border ${exercise.completed ? "border-green-500" : "border-gray-700"} bg-gray-900`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{exercise.name}</h4>
                      {exercise.completed && (
                        <Badge className="bg-green-500 mt-1 flex items-center gap-1">
                          <CheckCircle size={12} />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {exercise.completed && (
                        <>
                          <Button
                            onClick={() => downloadCSV(exercise.id)}
                            variant="outline"
                            size="sm"
                            className="border-green-500 text-green-500"
                          >
                            <Download size={16} className="mr-1" />
                            CSV
                          </Button>
                          <Button
                            onClick={() => {
                              setActiveExercise(exercise.id)
                              setShowSensorData(true)
                            }}
                            variant="outline"
                            size="sm"
                            className="border-blue-500 text-blue-500"
                          >
                            <Database size={16} className="mr-1" />
                            Sensor Data
                          </Button>
                          <Button
                            onClick={() => retryExercise(exercise.id)}
                            variant="outline"
                            size="sm"
                            className="border-yellow-500 text-yellow-500"
                          >
                            Retry Exercise
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => startExercise(exercise.id)}
                        disabled={exerciseStarted || exercise.completed}
                        className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black"
                      >
                        <Play size={16} className="mr-1" />
                        Start Exercise
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Endurance Exercises */}
        <TabsContent value="endurance">
          <div className="space-y-4">
            {exerciseState.endurance.map((exercise) => (
              <Card
                key={exercise.id}
                className={`border ${exercise.completed ? "border-green-500" : "border-gray-700"} bg-gray-900`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{exercise.name}</h4>
                      {exercise.completed && (
                        <Badge className="bg-green-500 mt-1 flex items-center gap-1">
                          <CheckCircle size={12} />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {exercise.completed && (
                        <>
                          <Button
                            onClick={() => downloadCSV(exercise.id)}
                            variant="outline"
                            size="sm"
                            className="border-green-500 text-green-500"
                          >
                            <Download size={16} className="mr-1" />
                            CSV
                          </Button>
                          <Button
                            onClick={() => {
                              setActiveExercise(exercise.id)
                              setShowSensorData(true)
                            }}
                            variant="outline"
                            size="sm"
                            className="border-blue-500 text-blue-500"
                          >
                            <Database size={16} className="mr-1" />
                            Sensor Data
                          </Button>
                          <Button
                            onClick={() => retryExercise(exercise.id)}
                            variant="outline"
                            size="sm"
                            className="border-yellow-500 text-yellow-500"
                          >
                            Retry Exercise
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => startExercise(exercise.id)}
                        disabled={exerciseStarted || exercise.completed}
                        className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black"
                      >
                        <Play size={16} className="mr-1" />
                        Start Exercise
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Active Exercise Interface */}
      {exerciseStarted && activeExercise && (
        <Card className="border-[#00D4EF] bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {activeExercise === "knee_flexion" && "Knee Flexion & Extension"}
                {activeExercise === "lunge_stretch" && "Lunge Stretch"}
                {activeExercise === "knee_to_wall" && "Knee to Wall"}
                {activeExercise === "squats" && "Squats"}
                {activeExercise === "lunges" && "Lunges"}
                {activeExercise === "plank_hold" && "Plank Hold"}
                {activeExercise === "stepUp" && "step Ups"}

              </span>
              <span className="text-xl font-mono flex items-center gap-2">
                <Clock size={18} className="text-[#00D4EF]" />
                {formatTime(timer)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Action</Label>
                <div className="space-y-2">
                  {activeExercise === "knee_flexion" && (
                    <div className="space-y-2">
                      <Button
                        onClick={() => recordAction("Rep Began")}
                        className={`w-full ${lastAction === "Rep Began" ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Rep Began
                      </Button>
                      <Button
                        onClick={() => recordAction("Max Knee Flexion")}
                        className={`w-full ${lastAction === "Max Knee Flexion" ? "bg-purple-600 hover:bg-purple-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Max Knee Flexion
                      </Button>
                      <Button
                        onClick={() => recordAction("Max Knee Extension")}
                        className={`w-full ${lastAction === "Max Knee Extension" ? "bg-yellow-600 hover:bg-yellow-700 text-black ring-2 ring-black ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Max Knee Extension
                      </Button>
                      <Button
                        onClick={() => recordAction("Rep Ended")}
                        className={`w-full ${lastAction === "Rep Ended" ? "bg-red-600 hover:bg-red-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Rep Ended
                      </Button>
                    </div>
                  )}

                  {activeExercise === "lunge_stretch" && (
                    <div className="space-y-2">
                      <Button
                        onClick={() => recordAction("Hold Began")}
                        className={`w-full ${lastAction === "Hold Began" ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Hold Began
                      </Button>
                      <Button
                        onClick={() => recordAction("Holding")}
                        className={`w-full ${lastAction === "Holding" ? "bg-purple-600 hover:bg-purple-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Holding
                      </Button>
                      <Button
                        onClick={() => recordAction("Hold Ended")}
                        className={`w-full ${lastAction === "Hold Ended" ? "bg-red-600 hover:bg-red-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Hold Ended
                      </Button>
                    </div>
                  )}

                  {activeExercise === "knee_to_wall" && (
                    <div className="space-y-2">
                      <Button
                        onClick={() => recordAction("Rep Began")}
                        className={`w-full ${lastAction === "Rep Began" ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Rep Began
                      </Button>
                      <Button
                        onClick={() => recordAction("Max Knee Flexion")}
                        className={`w-full ${lastAction === "Max Knee Flexion" ? "bg-purple-600 hover:bg-purple-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Max Knee Flexion
                      </Button>
                      <Button
                        onClick={() => recordAction("Rep Ended")}
                        className={`w-full ${lastAction === "Rep Ended" ? "bg-red-600 hover:bg-red-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Rep Ended
                      </Button>
                    </div>
                  )}

                  {activeExercise === "squats" && (
                    <div className="space-y-2">
                      <Button
                        onClick={() => recordAction("Rep Began")}
                        className={`w-full ${lastAction === "Rep Began" ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Rep Began
                      </Button>
                      <Button
                        onClick={() => recordAction("Full Squat")}
                        className={`w-full ${lastAction === "Full Squat" ? "bg-purple-600 hover:bg-purple-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Full Squat
                      </Button>
                      <Button
                        onClick={() => recordAction("Rep Ended")}
                        className={`w-full ${lastAction === "Rep Ended" ? "bg-red-600 hover:bg-red-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Rep Ended
                      </Button>
                    </div>
                  )}

                  {activeExercise === "lunges" && (
                    <div className="space-y-2">
                      <Button
                        onClick={() => recordAction("Rep Began")}
                        className={`w-full ${lastAction === "Rep Began" ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Rep Began
                      </Button>
                      <Button
                        onClick={() => recordAction("Full Lunge")}
                        className={`w-full ${lastAction === "Full Lunge" ? "bg-purple-600 hover:bg-purple-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Full Lunge
                      </Button>
                      <Button
                        onClick={() => recordAction("Rep Ended")}
                        className={`w-full ${lastAction === "Rep Ended" ? "bg-red-600 hover:bg-red-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Rep Ended
                      </Button>
                    </div>
                  )}

                  {activeExercise === "plank_hold" && (
                    <div className="space-y-2">
                      <Button
                        onClick={() => recordAction("Hold Started")}
                        className={`w-full ${lastAction === "Hold Started" ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Hold Started
                      </Button>
                      <Button
                        onClick={() => recordAction("Holding")}
                        className={`w-full ${lastAction === "Holding" ? "bg-purple-600 hover:bg-purple-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Holding
                      </Button>
                      <Button
                        onClick={() => recordAction("Hold Ended")}
                        className={`w-full ${lastAction === "Hold Ended" ? "bg-red-600 hover:bg-red-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Hold Ended
                      </Button>
                    </div>
                  )}

                  {activeExercise === "stepUp" && (
                    <div className="space-y-2">
                      <Button
                        onClick={() => recordAction("stepUp Started")}
                        className={`w-full ${lastAction === "stepUp Started" ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        step Ups Started
                      </Button>
                      <Button
                        onClick={() => recordAction("steppingUp")}
                        className={`w-full ${lastAction === "steppingUp" ? "bg-purple-600 hover:bg-purple-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Stepping Up
                      </Button>
                      <Button
                        onClick={() => recordAction("stepUp Ended")}
                        className={`w-full ${lastAction === "stepUp Ended" ? "bg-red-600 hover:bg-red-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        Step Ups Ended
                      </Button>
                    </div>
                  )}

                  
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Leg</Label>
                <div className="space-y-2">
                  <Button
                    onClick={() => setLeg("left")}
                    className={`w-full ${currentLeg === "left" ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-600"} ${lastAction === "Selected left Leg" ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""}`}
                  >
                    <ArrowLeft size={16} className="mr-1" />
                    Left Leg
                  </Button>
                  <Button
                    onClick={() => setLeg("right")}
                    className={`w-full ${currentLeg === "right" ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-600"} ${lastAction === "Selected right Leg" ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""}`}
                  >
                    <ArrowRight size={16} className="mr-1" />
                    Right Leg
                  </Button>
                </div>

                <div className="mt-4">
                  <Label className="mb-2 block">Timer Controls</Label>
                  <div className="flex gap-2">
                    {timerInterval ? (
                      <Button
                        onClick={() => {
                          if (timerInterval) {
                            clearInterval(timerInterval)
                            setTimerInterval(null)
                            recordAction("Timer Paused")
                          }
                        }}
                        className={`flex-1 ${lastAction === "Timer Paused" ? "bg-yellow-600 hover:bg-yellow-700 text-black ring-2 ring-black ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                      >
                        <Pause size={16} className="mr-1" />
                        Pause
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          const interval = setInterval(() => {
                            setTimer((prev) => prev + 1)
                          }, 1000)
                          setTimerInterval(interval)
                          recordAction("Timer Resumed")
                        }}
                        className={`flex-1 ${lastAction === "Timer Resumed" ? "bg-green-600 hover:bg-green-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                        disabled={!exerciseStarted}
                      >
                        <Play size={16} className="mr-1" />
                        Resume
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        setTimer(0)
                        recordAction("Timer Reset")
                      }}
                      className={`flex-1 ${lastAction === "Timer Reset" ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
                    >
                      <RotateCcw size={16} className="mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={completeExercise} className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black mr-2">
                <CheckCircle size={16} className="mr-1" />
                Complete Exercise
              </Button>
              <Button
                onClick={handleSkipExercise}
                variant="outline"
                className="bg-orange-600 hover:bg-orange-700 text-white border-orange-700"
              >
                Skip Exercise
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sensor Data Export */}
      {showSensorData && activeExercise && !exerciseStarted && (
        <Card className="border-[#00D4EF]/20 bg-black">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-[#00D4EF] flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sensor Data Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="mb-4">Sensor data is available for download as CSV files.</p>
              <Button
                onClick={() => downloadCSV(activeExercise)}
                className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black mb-4"
              >
                <Download size={16} className="mr-2" />
                Download Exercise Data (CSV)
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="text-lg mb-4 text-center">Sensor Data</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => downloadSensorCSV("left_thigh", activeExercise, sensorData)}
                  variant="outline"
                  className="border-blue-500 text-blue-500"
                >
                  <Download size={16} className="mr-2" />
                  Left Thigh Data
                </Button>
                <Button
                  onClick={() => downloadSensorCSV("left_shin", activeExercise, sensorData)}
                  variant="outline"
                  className="border-green-500 text-green-500"
                >
                  <Download size={16} className="mr-2" />
                  Left Shin Data
                </Button>
                <Button
                  onClick={() => downloadSensorCSV("right_thigh", activeExercise, sensorData)}
                  variant="outline"
                  className="border-yellow-500 text-yellow-500"
                >
                  <Download size={16} className="mr-2" />
                  Right Thigh Data
                </Button>
                <Button
                  onClick={() => downloadSensorCSV("right_shin", activeExercise, sensorData)}
                  variant="outline"
                  className="border-purple-500 text-purple-500"
                >
                  <Download size={16} className="mr-2" />
                  Right Shin Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center mt-8">
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={() => setStep(2)} className="border-gray-700">
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const idx = orderedCategories.indexOf(activeCategory);
              if (idx > 0) setActiveCategory(orderedCategories[idx - 1]);
            }}
            className="border-gray-600 text-gray-300"
            disabled={orderedCategories.indexOf(activeCategory) === 0}
          >
            <ArrowLeft size={16} className="mr-1" />
            Previous Section
          </Button>
          <Button
            onClick={() => {
              const idx = orderedCategories.indexOf(activeCategory);
              if (idx < orderedCategories.length - 1) setActiveCategory(orderedCategories[idx + 1]);
            }}
            className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black"
            disabled={orderedCategories.indexOf(activeCategory) === orderedCategories.length - 1}
          >
            Next Section
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {generatingZip && (
            <span className="text-sm text-gray-400 flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating report...
            </span>
          )}

          <Button
            onClick={() => generateAndCompleteTest()}
            disabled={!mobilityCompleted || !strengthCompleted || !enduranceCompleted || generatingZip}
            className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black"
          >
            Complete Testing
          </Button>
        </div>
      </div>
    </div>
  )
}
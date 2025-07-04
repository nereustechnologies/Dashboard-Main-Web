"use client"

import { useState, useRef } from "react"

export function useExerciseData() {
  const [exerciseData, setExerciseData] = useState<any[]>([])
  const [error, setError] = useState("")
  const csvDataRef = useRef<{ [key: string]: any[] }>({})

  const addExerciseData = (data: any) => {
    setExerciseData((prev) => [...prev, data])
    
    // Add to CSV data
    if (csvDataRef.current[data.exerciseId]) {
      csvDataRef.current[data.exerciseId].push(data)
    }
  }

  const initializeExerciseCSVData = (exerciseId: string) => {
    if (!csvDataRef.current[exerciseId]) {
      csvDataRef.current[exerciseId] = []
    }
  }

  const clearExerciseData = (exerciseId: string) => {
    setExerciseData((prev) => prev.filter((d) => d.exerciseId !== exerciseId))
    csvDataRef.current[exerciseId] = []
  }

  const recordAction = async (
    action: string,
    activeExercise: string | null,
    customerData: any,
    timer: number,
    currentLeg: string | null,
    testId: string,
    leg?: string
  ) => {
    if (!activeExercise) return

    const timestamp = formatTime(timer)

    // Build exercise-specific data
    let exerciseDataItem: Record<string, any> = {
      timestamp,
      action,
      leg: leg || currentLeg || "N/A",
      exerciseId: activeExercise,
      customerId: customerData.id,
      testId,
    }

    if (action === "Exercise Skipped") {
      exerciseDataItem.phaseLabel = "Skipped";
      exerciseDataItem.repCount = 0;

      if (activeExercise === "knee_flexion" || activeExercise === "knee_to_wall") {
        exerciseDataItem.kneeAngleLeft = "-";
        exerciseDataItem.kneeAngleRight = "-";
      } else if (activeExercise === "lunge_stretch") {
        exerciseDataItem.hipFlexionAngle = 0;
        exerciseDataItem.kneeFlexionAngleLeft = "-";
        exerciseDataItem.kneeFlexionAngleRight = "-";
        exerciseDataItem.phaseLabel = "Skipped";
        exerciseDataItem.holdDuration = 0;
        exerciseDataItem.reps = 0;
      } else if (activeExercise === "squats") {
        exerciseDataItem.kneeAngleLeft = "-";
        exerciseDataItem.kneeAngleRight = "-";
        exerciseDataItem.hipAngle = "-";
      } else if (activeExercise === "lunges") {
        exerciseDataItem.kneeAngleLeft = "-";
        exerciseDataItem.kneeAngleRight = "-";
        exerciseDataItem.hipAngle = "-";
      } else if (activeExercise === "plank_hold") {
        exerciseDataItem.hipAngle = "-";
        exerciseDataItem.holdDuration = 0;
      } else if (activeExercise === "stepUp") {
        exerciseDataItem.kneeAngleLeft = "0";
        exerciseDataItem.KneeAngleRight = "0";
        exerciseDataItem.repCount = "1";
      } 
    } else {
      // Add exercise-specific fields based on exercise type for non-skipped actions
      const repCount = calculateRepCount(exerciseData, activeExercise)

      if (activeExercise === "knee_flexion" || activeExercise === "knee_to_wall") {
        exerciseDataItem = {
          ...exerciseDataItem,
          kneeAngleLeft: leg === "left" || currentLeg === "left" ? "-" : "-", // Was generateRandomAngle(5, 90)
          kneeAngleRight: leg === "right" || currentLeg === "right" ? "-" : "-", // Was generateRandomAngle(12, 90)
          phaseLabel: action,
          repCount,
        }
      } else if (activeExercise === "lunge_stretch") {
        exerciseDataItem = {
          ...exerciseDataItem,
          // hipFlexionAngle, kneeFlexionAngleLeft, kneeFlexionAngleRight already removed as per previous request
          phaseLabel: action,
          holdDuration: action === "Hold Ended" ? timer : 0,
          reps: repCount,
        }
      } else if (activeExercise === "squats") {
        exerciseDataItem = {
          ...exerciseDataItem,
          kneeAngleLeft: "-", // Was generateRandomAngle(30, 90)
          kneeAngleRight: "-", // Was generateRandomAngle(30, 90)
          hipAngle: "-", // Was generateRandomAngle(60, 110)
          phaseLabel: action,
          repCount,
        }
      } else if (activeExercise === "lunges") {
        exerciseDataItem = {
          ...exerciseDataItem,
          kneeAngleLeft: "-", // Was generateRandomAngle(28, 90)
          kneeAngleRight: "-", // Was generateRandomAngle(88, 100)
          hipAngle: "-", // Was generateRandomAngle(108, 130)
          phaseLabel: action,
          repCount,
        }
      } else if (activeExercise === "plank_hold") {
        exerciseDataItem = {
          ...exerciseDataItem,
          hipAngle: "-", // Was generateRandomAngle(160, 176)
          phaseLabel: action,
          holdDuration: action === "Hold Ended" ? timer : action === "Holding" ? timer - 1 : 1,
        }
      } else if (activeExercise === "stepUp") {
        exerciseDataItem = {
          ...exerciseDataItem,
          KneeAngleLeft: "0", // Was generateRandomValue(2.5, 9.3)
          KneeAngleRight: "0", // Was generateRandomValue(-1.2, 3.1)
          phaseLabel: action,
          repCount:1
        }
      } 
    }

    try {
   
        const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch("/api/exercise-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(exerciseDataItem),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to record exercise data")
      }
      addExerciseData(exerciseDataItem)

      console.log(`Recording (to CSV data): ${action}, Time: ${timestamp}, Leg: ${leg || currentLeg || "N/A"}`)
    } catch (error) {
      console.error("Error recording exercise data (to CSV):", error)
      setError(error instanceof Error ? error.message : "An error occurred while recording exercise data (to CSV)")
      // throw error // Decide if you still want to throw the error, which might affect UI
    }
  }

  return {
    exerciseData,
    setExerciseData,
    error,
    setError,
    csvDataRef,
    addExerciseData,
    initializeExerciseCSVData,
    clearExerciseData,
    recordAction,
  }
}

// Helper functions
function formatTime(timeInSeconds: number) {
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = timeInSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}


function calculateRepCount(exerciseData: any[], activeExercise: string) {
  // Simple logic to determine rep count based on actions recorded
  const actionsForExercise = exerciseData.filter((data) => data.exerciseId === activeExercise && data.action !== "Exercise Skipped")
  const endActions = actionsForExercise.filter(
    (data) => data.action === "Rep Ended" || data.action === "Hold Ended" || data.action === "stepUp Ended",
  )

  return endActions.length + 1
}

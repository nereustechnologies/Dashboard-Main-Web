"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, ArrowLeft, Activity } from "lucide-react"
import { useTestStep } from "@/components/test-step-context"
import { useExerciseState } from "@/hooks/use-exercise-state"
import { useBluetooth, type SensorDataPoint } from "@/hooks/use-bluetooth"
import { useExerciseData } from "@/hooks/use-exercise-data"
import { ExerciseCategory } from "@/components/exercise-category"
import { ActiveExerciseInterface } from "@/components/active-exercise-interface"
// import { SensorDataExport } from "@/components/sensor-data-export"
import {
  prepareExerciseEventsCSV,
  prepareIndividualSensorDataCSVs,
  type IndividualSensorCSV,
} from "@/lib/exercise-utils"

interface TestExercisesProps {
  onComplete: (exerciseData: any) => void
  customerData: any
  testId: string
}

export default function TestExercises({ onComplete, customerData, testId }: TestExercisesProps) {
  const { step, setStep } = useTestStep()
  const [activeCategory, setActiveCategory] = useState("mobility")
  const [activeExercise, setActiveExercise] = useState<string | null>(null)
  const [exerciseStarted, setExerciseStarted] = useState(false)
  const [timer, setTimer] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [currentLeg, setCurrentLeg] = useState<string | null>(null)
  const [showSensorData, setShowSensorData] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [exerciseStartTime, setExerciseStartTime] = useState<number>(0)
  const {
    exerciseState,
    mobilityCompleted,
    strengthCompleted,
    enduranceCompleted,
    completeExercise,
    retryExercise,
  } = useExerciseState()

  const { sensorData, startRecording, stopRecordingAndGetData, clearSensorData } = useBluetooth()

  const {
    exerciseData,
    setExerciseData,
    error,
    setError,
    csvDataRef,
    initializeExerciseCSVData,
    clearExerciseData: clearExerciseLogData,
    recordAction,
  } = useExerciseData()

  const downloadCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const orderedCategories = ["mobility", "strength", "endurance"]

  const startExercise = (exerciseId: string) => {
    setActiveExercise(exerciseId)
    setExerciseStarted(true)
    setTimer(0)
    setCurrentLeg(null)
    setError("")
    setShowSensorData(false)
    setLastAction(null)
    clearSensorData()

    const startTime = Date.now()
    setExerciseStartTime(startTime)

    startRecording(startTime)

    // Initialize CSV data for this exercise if it doesn't exist
    initializeExerciseCSVData(exerciseId)

    // Start timer
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)

    setTimerInterval(interval)

    // Record exercise start
    handleRecordAction("Exercise Started", undefined, exerciseId)
  }

  const handleCompleteExercise = async () => {
    if (!activeExercise) return

    try {
      // Mark exercise as completed
      completeExercise(activeExercise)

      // Stop the timer
      if (timerInterval) {
        clearInterval(timerInterval)
        setTimerInterval(null)
      }

      const token = localStorage.getItem("token")
      if (!token) {
        setError("Authentication required to upload data.")
        return
      }

      // Stop recording and get sensor data
      const sensorDataToUpload = stopRecordingAndGetData()

      // Prepare and upload individual sensor data CSVs
      if (sensorDataToUpload.length > 0) {
        const individualSensorCSVs = prepareIndividualSensorDataCSVs(activeExercise, sensorDataToUpload, customerData)

        for (const sensorCSV of individualSensorCSVs) {
          if (sensorCSV.csvContent) {
            downloadCSV(sensorCSV.csvContent, `${activeExercise}_${sensorCSV.fileName}`)
            try {
              console.log(`Uploading CSV: ${sensorCSV.fileName} for exercise ${activeExercise}`)
              const response = await fetch("/api/upload-csv", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  customerId: customerData.id,
                  testId: testId,
                  fileName: `${activeExercise}/${sensorCSV.fileName}`,
                  fileType: sensorCSV.fileName.replace(/\.csv$/, ""),
                  csvContent: sensorCSV.csvContent,
                }),
              })
              if (!response.ok) {
                const errorData = await response.json()
                console.error(
                  `Failed to upload ${sensorCSV.fileName} for ${activeExercise}:`,
                  errorData.error || response.statusText,
                )
                // setError(`Failed to upload ${sensorCSV.fileName}.`); // Optional: accumulate errors or show first
              } else {
                console.log(`Successfully uploaded ${sensorCSV.fileName} for ${activeExercise}`)
              }
            } catch (uploadError) {
              console.error(`Error uploading ${sensorCSV.fileName} for ${activeExercise}:`, uploadError)
              // setError(`Error uploading ${sensorCSV.fileName}.`);
            }
          }
        }
      }

      // Prepare and upload exercise log data as CSV
      if (csvDataRef.current[activeExercise] && csvDataRef.current[activeExercise].length > 0) {
        const preparedExerciseEvents = prepareExerciseEventsCSV(
          activeExercise,
          customerData,
          csvDataRef.current[activeExercise],
        )
        if (preparedExerciseEvents) {
          downloadCSV(preparedExerciseEvents.csvContent, `${activeExercise}_${preparedExerciseEvents.fileName}`)
          try {
            console.log(`Uploading CSV: ${preparedExerciseEvents.fileName} for exercise ${activeExercise}`)
            const response = await fetch("/api/upload-csv", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                customerId: customerData.id,
                testId: testId,
                fileName: `${activeExercise}/${preparedExerciseEvents.fileName}`,
                fileType: "exercise_events",
                csvContent: preparedExerciseEvents.csvContent,
              }),
            })
            if (!response.ok) {
              const errorData = await response.json()
              console.error(
                `Failed to upload ${preparedExerciseEvents.fileName} for ${activeExercise}:`,
                errorData.error || response.statusText,
              )
              // setError(`Failed to upload exercise log for ${activeExercise}.`);
            } else {
              console.log(`Successfully uploaded ${preparedExerciseEvents.fileName} for ${activeExercise}`)
            }
          } catch (uploadError) {
            console.error(`Error uploading ${preparedExerciseEvents.fileName} for ${activeExercise}:`, uploadError)
            // setError(`Error uploading exercise log for ${activeExercise}.`);
          }
        }
      }

      // Reset exercise state
      setActiveExercise(null)
      setExerciseStarted(false)
      setTimer(0)
      setCurrentLeg(null)
      setLastAction(null)
    } catch (error) {
      console.error("Error completing exercise:", error)
      setError("Failed to complete exercise. Please try again.")
    }
  }

  const handleSkipExercise = async () => {
    if (!activeExercise) return

    // Record the skip action
    await handleRecordAction("Exercise Skipped")

    // Mark exercise as completed
    completeExercise(activeExercise)

    // Stop the timer
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }

    // Reset exercise state
    setActiveExercise(null)
    setExerciseStarted(false)
    setTimer(0)
    setCurrentLeg(null)
    setLastAction("Exercise Skipped")
  }

  const handleRetryExercise = (exerciseId: string) => {
    // Mark the exercise as not completed
    retryExercise(exerciseId)

    // Clear previous data for this exercise
    clearExerciseLogData(exerciseId)
    clearSensorData()
    setShowSensorData(false)
    setActiveExercise(null)
    setExerciseStarted(false)
    setTimer(0)
    setCurrentLeg(null)
    setLastAction(null)
  }

  const handleRecordAction = async (action: string, leg?: string, exerciseIdOverride?: string) => {
    const targetExercise = exerciseIdOverride || activeExercise
    if (!targetExercise) return

    setLastAction(action)

    try {
      await recordAction(action, targetExercise, customerData, timer, currentLeg, testId, leg)
    } catch (error) {
      // Error is already handled in the hook
    }
  }

  const handleSetLeg = (leg: string) => {
    setCurrentLeg(leg)
    handleRecordAction(`Selected ${leg} Leg`, leg)
  }

  const handleTimerControl = (action: 'pause' | 'resume' | 'reset') => {
    switch (action) {
      case 'pause':
        if (timerInterval) {
          clearInterval(timerInterval)
          setTimerInterval(null)
          handleRecordAction("Timer Paused")
        }
        break
      case 'resume':
        const interval = setInterval(() => {
          setTimer((prev) => prev + 1)
        }, 1000)
        setTimerInterval(interval)
        handleRecordAction("Timer Resumed")
        break
      case 'reset':
        setTimer(0)
        handleRecordAction("Timer Reset")
        break
    }
  }

  const handleShowSensorData = (exerciseId: string) => {
    setActiveExercise(exerciseId)
    setShowSensorData(true)
  }

  const completeTest = async () => {
    setIsCompleting(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch("/api/tests/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ testId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to complete the test.")
      }

      alert("Test completed successfully!")

      onComplete({
        exercises: csvDataRef.current,
      })
    } catch (error) {
      console.error("Error completing test:", error)
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setError(errorMessage)
    } finally {
      setIsCompleting(false)
    }
  }

  const currentCategoryIndex = orderedCategories.indexOf(activeCategory)
  const canGoToPreviousCategory = !exerciseStarted && currentCategoryIndex > 0
  const canGoToNextCategory = !exerciseStarted && currentCategoryIndex < orderedCategories.length - 1

  const categoryCompletionStatus = {
    mobility: mobilityCompleted,
    strength: strengthCompleted,
    endurance: enduranceCompleted,
  }

  const isNextCategoryEnabled =
    canGoToNextCategory && categoryCompletionStatus[activeCategory as keyof typeof categoryCompletionStatus]

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
          <TabsTrigger value="mobility" className={mobilityCompleted ? "text-green-500" : ""} disabled={exerciseStarted}>
            Mobility
            {mobilityCompleted && " ✓"}
          </TabsTrigger>
          <TabsTrigger
            value="strength"
            className={strengthCompleted ? "text-green-500" : ""}
            disabled={!mobilityCompleted || exerciseStarted}
          >
            Strength
            {strengthCompleted && " ✓"}
          </TabsTrigger>
          <TabsTrigger
            value="endurance"
            className={enduranceCompleted ? "text-green-500" : ""}
            disabled={!strengthCompleted || exerciseStarted}
          >
            Endurance
            {enduranceCompleted && " ✓"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mobility">
          <ExerciseCategory
            exercises={exerciseState.mobility}
            onStartExercise={startExercise}
            onRetryExercise={handleRetryExercise}
            onShowSensorData={handleShowSensorData}
            exerciseStarted={exerciseStarted}
            customerData={customerData}
          />
        </TabsContent>

        <TabsContent value="strength">
          <ExerciseCategory
            exercises={exerciseState.strength}
            onStartExercise={startExercise}
            onRetryExercise={handleRetryExercise}
            onShowSensorData={handleShowSensorData}
            exerciseStarted={exerciseStarted}
            customerData={customerData}
          />
        </TabsContent>

        <TabsContent value="endurance">
          <ExerciseCategory
            exercises={exerciseState.endurance}
            onStartExercise={startExercise}
            onRetryExercise={handleRetryExercise}
            onShowSensorData={handleShowSensorData}
            exerciseStarted={exerciseStarted}
            customerData={customerData}
          />
        </TabsContent>
      </Tabs>

      {/* Active Exercise Interface */}
      {exerciseStarted && activeExercise && (
        <ActiveExerciseInterface
          activeExercise={activeExercise}
          timer={timer}
          currentLeg={currentLeg}
          lastAction={lastAction}
          timerInterval={timerInterval}
          exerciseStarted={exerciseStarted}
          onRecordAction={handleRecordAction}
          onSetLeg={handleSetLeg}
          onCompleteExercise={handleCompleteExercise}
          onSkipExercise={handleSkipExercise}
          onTimerControl={handleTimerControl}
        />
      )}

      {/* {showSensorData && activeExercise && !exerciseStarted && (
        <SensorDataExport
          activeExercise={activeExercise}
          customerData={customerData}
          sensorData={sensorData}
          recordedExerciseEvents={csvDataRef.current[activeExercise] || []}
        />
      )} */}

      <div className="flex justify-between items-center mt-8">
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={() => setStep(2)} className="border-gray-700">
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const idx = orderedCategories.indexOf(activeCategory)
              if (idx > 0) setActiveCategory(orderedCategories[idx - 1])
            }}
            className="border-gray-600 text-gray-300"
            disabled={!canGoToPreviousCategory}
          >
            <ArrowLeft size={16} className="mr-1" />
            Previous Section
          </Button>
          <Button
            onClick={() => {
              const idx = orderedCategories.indexOf(activeCategory)
              if (idx < orderedCategories.length - 1) setActiveCategory(orderedCategories[idx + 1])
            }}
            className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black"
            disabled={!isNextCategoryEnabled}
          >
            Next Section
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {isCompleting && (
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
              Completing Test...
            </span>
          )}
          <Button
            onClick={completeTest}
            disabled={!mobilityCompleted || !strengthCompleted || !enduranceCompleted || isCompleting}
            className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black"
          >
            Complete Testing
          </Button>
        </div>
      </div>
    </div>
  )
}

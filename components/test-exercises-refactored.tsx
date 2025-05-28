"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, ArrowLeft, Activity } from "lucide-react"
import { useTestStep } from "@/components/test-step-context"
import { useExerciseState } from "@/hooks/use-exercise-state"
import { useWebSocket } from "@/hooks/use-websocket"
import { useExerciseData } from "@/hooks/use-exercise-data"
import { ExerciseCategory } from "@/components/exercise-category"
import { ActiveExerciseInterface } from "@/components/active-exercise-interface"
import { SensorDataExport } from "@/components/sensor-data-export"
import { uploadSensorData, downloadSensorDataAsCSV } from "@/lib/exercise-utils"

interface TestExercisesProps {
  onComplete: (exerciseData: any) => void
  customerData: any
}

export default function TestExercises({ onComplete, customerData }: TestExercisesProps) {
  const { step, setStep } = useTestStep()
  const [activeCategory, setActiveCategory] = useState("mobility")
  const [activeExercise, setActiveExercise] = useState<string | null>(null)
  const [exerciseStarted, setExerciseStarted] = useState(false)
  const [timer, setTimer] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [currentLeg, setCurrentLeg] = useState<string | null>(null)
  const [showSensorData, setShowSensorData] = useState(false)
  const [generatingZip, setGeneratingZip] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)

  const {
    exerciseState,
    mobilityCompleted,
    strengthCompleted,
    enduranceCompleted,
    completeExercise,
    retryExercise,
  } = useExerciseState()

  const {
    sensorData,
    isWebSocketConnected,
    connectWebSocket,
    disconnectWebSocket,
    clearSensorData,
  } = useWebSocket()

  const {
    exerciseData,
    setExerciseData,
    error,
    setError,
    csvDataRef,
    initializeExerciseCSVData,
    clearExerciseData,
    recordAction,
  } = useExerciseData()

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

    // Connect to WebSocket when starting exercise
    connectWebSocket()

    // Initialize CSV data for this exercise if it doesn't exist
    initializeExerciseCSVData(exerciseId)

    // Start timer
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)

    setTimerInterval(interval)

    // Record exercise start
    handleRecordAction("Exercise Started")
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

      // Upload sensor data if available
      if (Object.keys(sensorData).length > 0) {
        await uploadSensorData(activeExercise, sensorData, customerData)
        // Download local copy as well
        downloadSensorDataAsCSV(activeExercise, sensorData)
      }

      // Disconnect WebSocket when exercise is completed
      disconnectWebSocket()

      // Reset exercise state
      setActiveExercise(null)
      setExerciseStarted(false)
      setTimer(0)
      setCurrentLeg(null)
      setLastAction(null)
    } catch (error) {
      console.error('Error completing exercise:', error)
      setError('Failed to complete exercise. Please try again.')
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

    // Disconnect WebSocket when exercise is skipped
    disconnectWebSocket()

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
    clearExerciseData(exerciseId)
    clearSensorData()
    setShowSensorData(false)
    setActiveExercise(null)
    setExerciseStarted(false)
    setTimer(0)
    setCurrentLeg(null)
    setLastAction(null)
  }

  const handleRecordAction = async (action: string, leg?: string) => {
    if (!activeExercise) return

    setLastAction(action)

    try {
      await recordAction(action, activeExercise, customerData, timer, currentLeg, leg)
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

  const currentCategoryIndex = orderedCategories.indexOf(activeCategory)
  const canGoToPreviousCategory = !exerciseStarted && currentCategoryIndex > 0
  const canGoToNextCategory = !exerciseStarted && currentCategoryIndex < orderedCategories.length - 1

  let isNextCategoryEnabled = false
  if (canGoToNextCategory) {
    if (activeCategory === "mobility" && mobilityCompleted) {
      isNextCategoryEnabled = true
    } else if (activeCategory === "strength" && strengthCompleted) {
      isNextCategoryEnabled = true
    }
  }

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
          <TabsTrigger value="strength" className={strengthCompleted ? "text-green-500" : ""}>
            Strength
            {strengthCompleted && " ✓"}
          </TabsTrigger>
          <TabsTrigger value="endurance" className={enduranceCompleted ? "text-green-500" : ""}>
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

      {/* Sensor Data Export */}
      {showSensorData && activeExercise && !exerciseStarted && (
        <SensorDataExport
          activeExercise={activeExercise}
          customerData={customerData}
          sensorData={sensorData}
        />
      )}

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
            disabled={orderedCategories.indexOf(activeCategory) === 0}
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

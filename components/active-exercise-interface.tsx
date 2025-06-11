"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Clock, ArrowLeft, ArrowRight, CheckCircle, Play, Pause, RotateCcw } from "lucide-react"
import { formatTime } from "@/lib/exercise-utils"

interface ActiveExerciseInterfaceProps {
  activeExercise: string
  timer: number
  currentLeg: string | null
  lastAction: string | null
  timerInterval: NodeJS.Timeout | null
  exerciseStarted: boolean
  onRecordAction: (action: string, leg?: string) => void
  onSetLeg: (leg: string) => void
  onCompleteExercise: () => void
  onSkipExercise: () => void
  onTimerControl: (action: 'pause' | 'resume' | 'reset') => void
}

export function ActiveExerciseInterface({
  activeExercise,
  timer,
  currentLeg,
  lastAction,
  timerInterval,
  exerciseStarted,
  onRecordAction,
  onSetLeg,
  onCompleteExercise,
  onSkipExercise,
  onTimerControl,
}: ActiveExerciseInterfaceProps) {
  const getExerciseName = (exerciseId: string) => {
    const names: { [key: string]: string } = {
      knee_flexion: "Knee Flexion & Extension",
      lunge_stretch: "Lunge Stretch",
      knee_to_wall: "Knee to Wall",
      squats: "Squats",
      lunges: "Lunges",
      plank_hold: "Plank Hold",
      sprint: "50m Sprint",
      shuttle_run: "5-10-5 Shuttle Run",
    }
    return names[exerciseId] || exerciseId
  }

  const renderActionButtons = () => {
    const buttonClass = (action: string) =>
      `w-full ${
        lastAction === action
          ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900"
          : "bg-gray-700 hover:bg-gray-600 text-white"
      }`

    const coloredButtonClass = (action: string, baseColor: string, textColor = "text-white") =>
      `w-full ${
        lastAction === action
          ? `${baseColor} ring-2 ring-white ring-offset-2 ring-offset-gray-900`
          : `bg-gray-700 hover:bg-gray-600 ${textColor}`
      }`

    switch (activeExercise) {
      case "knee_flexion":
        return (
          <div className="space-y-2">
            <Button onClick={() => onRecordAction("Rep Began")} className={buttonClass("Rep Began")}>
              Rep Began
            </Button>
            <Button
              onClick={() => onRecordAction("Max Knee Flexion")}
              className={coloredButtonClass("Max Knee Flexion", "bg-purple-600 hover:bg-purple-700")}
            >
              Max Knee Flexion
            </Button>
            <Button
              onClick={() => onRecordAction("Max Knee Extension")}
              className={coloredButtonClass("Max Knee Extension", "bg-yellow-600 hover:bg-yellow-700")}
            >
              Max Knee Extension
            </Button>
            <Button
              onClick={() => onRecordAction("Rep Ended")}
              className={coloredButtonClass("Rep Ended", "bg-red-600 hover:bg-red-700")}
            >
              Rep Ended
            </Button>
          </div>
        )

      case "lunge_stretch":
        return (
          <div className="space-y-2">
            <Button onClick={() => onRecordAction("Hold Began")} className={buttonClass("Hold Began")}>
              Hold Began
            </Button>
            <Button
              onClick={() => onRecordAction("Holding")}
              className={coloredButtonClass("Holding", "bg-purple-600 hover:bg-purple-700")}
            >
              Holding
            </Button>
            <Button
              onClick={() => onRecordAction("Hold Ended")}
              className={coloredButtonClass("Hold Ended", "bg-red-600 hover:bg-red-700")}
            >
              Hold Ended
            </Button>
          </div>
        )
      case "knee_to_wall":
        return (
          <div className="space-y-2">
            <Button onClick={() => onRecordAction("Rep Began")} className={buttonClass("Rep Began")}>
              Rep Began
            </Button>
            <Button
              onClick={() => onRecordAction("Max Knee Flexion")}
              className={coloredButtonClass("Max Knee Flexion", "bg-purple-600 hover:bg-purple-700")}
            >
              Max Knee Flexion
            </Button>
            <Button
              onClick={() => onRecordAction("Rep Ended")}
              className={coloredButtonClass("Rep Ended", "bg-red-600 hover:bg-red-700")}
            >
              Rep Ended
            </Button>
          </div>
        )

      case "squats":
        return (
          <div className="space-y-2">
            <Button
              onClick={() => onRecordAction("Full Squat")}
              className={coloredButtonClass("Full Squat", "bg-purple-600 hover:bg-purple-700")}
            >
              Full Squat
            </Button>
          </div>
        )

      case "lunges":
        return (
          <div className="space-y-2">
            <Button
              onClick={() => onRecordAction("Full Lunge")}
              className={coloredButtonClass("Full Lunge", "bg-purple-600 hover:bg-purple-700")}
            >
              Full Lunge
            </Button>
          </div>
        )

      case "plank_hold":
        return (
          <div className="space-y-2">
            <Button onClick={() => onRecordAction("Hold Started")} className={buttonClass("Hold Started")}>
              Hold Started
            </Button>
            <Button
              onClick={() => onRecordAction("Holding")}
              className={coloredButtonClass("Holding", "bg-purple-600 hover:bg-purple-700")}
            >
              Holding
            </Button>
            <Button
              onClick={() => onRecordAction("Hold Ended")}
              className={coloredButtonClass("Hold Ended", "bg-red-600 hover:bg-red-700")}
            >
              Hold Ended
            </Button>
          </div>
        )

      case "sprint":
        return (
          <div className="space-y-2">
            <Button onClick={() => onRecordAction("Sprint Started")} className={buttonClass("Sprint Started")}>
              Sprint Started
            </Button>
            <Button
              onClick={() => onRecordAction("Sprinting")}
              className={coloredButtonClass("Sprinting", "bg-purple-600 hover:bg-purple-700")}
            >
              Sprinting
            </Button>
            <Button
              onClick={() => onRecordAction("Sprint Ended")}
              className={coloredButtonClass("Sprint Ended", "bg-red-600 hover:bg-red-700")}
            >
              Sprint Ended
            </Button>
          </div>
        )

      case "shuttle_run":
        return (
          <div className="space-y-2">
            <Button onClick={() => onRecordAction("Run Started")} className={buttonClass("Run Started")}>
              Run Started
            </Button>
            <Button
              onClick={() => onRecordAction("Sprinting")}
              className={coloredButtonClass("Sprinting", "bg-purple-600 hover:bg-purple-700")}
            >
              Sprinting
            </Button>
            <Button
              onClick={() => onRecordAction("Direction Changed")}
              className={coloredButtonClass("Direction Changed", "bg-yellow-600 hover:bg-yellow-700")}
            >
              Direction Changed
            </Button>
            <Button
              onClick={() => onRecordAction("Sprint Ended")}
              className={coloredButtonClass("Sprint Ended", "bg-red-600 hover:bg-red-700")}
            >
              Sprint Ended
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="border-[#00D4EF] bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{getExerciseName(activeExercise)}</span>
          <span className="text-xl font-mono flex items-center gap-2">
            <Clock size={18} className="text-[#00D4EF]" />
            {formatTime(timer)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Action</Label>
            <div className="space-y-2">{renderActionButtons()}</div>
          </div>

          <div>
            {activeExercise !== "squats" &&
              activeExercise !== "lunges" &&
              activeExercise !== "plank_hold" &&
              activeExercise !== "sprint" &&
              activeExercise !== "shuttle_run" && (
                <>
                  <Label className="mb-2 block">Leg</Label>
                  <div className="space-y-2 mb-4"> {/* Added mb-4 for spacing when leg section is shown */}
                    <Button
                      onClick={() => onSetLeg("left")}
                      className={`w-full ${
                        currentLeg === "left" ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-600"
                      } ${
                        lastAction === "Selected left Leg" ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""
                      }`}
                    >
                      <ArrowLeft size={16} className="mr-1" />
                      Left Leg
                    </Button>
                    <Button
                      onClick={() => onSetLeg("right")}
                      className={`w-full ${
                        currentLeg === "right" ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-600"
                      } ${
                        lastAction === "Selected right Leg" ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""
                      }`}
                    >
                      <ArrowRight size={16} className="mr-1" />
                      Right Leg
                    </Button>
                  </div>
                </>
              )}

            {/* Timer Controls - mt-4 removed from here as spacing is handled by mb-4 on leg section or no extra space if leg section is hidden */}
            <div>
              <Label className="mb-2 block">Timer Controls</Label>
              <div className="flex gap-2">
                {timerInterval ? (
                  <Button
                    onClick={() => onTimerControl('pause')}
                    className={`flex-1 ${
                      lastAction === "Timer Paused"
                        ? "bg-yellow-600 hover:bg-yellow-700 text-black ring-2 ring-black ring-offset-2 ring-offset-gray-900"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    <Pause size={16} className="mr-1" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    onClick={() => onTimerControl('resume')}
                    className={`flex-1 ${
                      lastAction === "Timer Resumed"
                        ? "bg-green-600 hover:bg-green-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                    disabled={!exerciseStarted}
                  >
                    <Play size={16} className="mr-1" />
                    Resume
                  </Button>
                )}
                <Button
                  onClick={() => onTimerControl('reset')}
                  className={`flex-1 ${
                    lastAction === "Timer Reset"
                      ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  <RotateCcw size={16} className="mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onCompleteExercise} className="bg-[#00D4EF] hover:bg-[#00D4EF]/80 text-black mr-2">
            <CheckCircle size={16} className="mr-1" />
            Complete Exercise
          </Button>
          <Button
            onClick={onSkipExercise}
            variant="outline"
            className="bg-orange-600 hover:bg-orange-700 text-white border-orange-700"
          >
            Skip Exercise
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, CheckCircle, Download, Database } from "lucide-react"
import { downloadCSV } from "@/lib/exercise-utils"

interface ExerciseCategoryProps {
  exercises: Array<{ id: string; name: string; completed: boolean }>
  onStartExercise: (exerciseId: string) => void
  onRetryExercise: (exerciseId: string) => void
  onShowSensorData: (exerciseId: string) => void
  exerciseStarted: boolean
  customerData: any
}

export function ExerciseCategory({
  exercises,
  onStartExercise,
  onRetryExercise,
  onShowSensorData,
  exerciseStarted,
  customerData,
}: ExerciseCategoryProps) {
  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
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
                      onClick={() => downloadCSV(exercise.id, customerData)}
                      variant="outline"
                      size="sm"
                      className="border-green-500 text-green-500"
                    >
                      <Download size={16} className="mr-1" />
                      CSV
                    </Button>
                    <Button
                      onClick={() => onShowSensorData(exercise.id)}
                      variant="outline"
                      size="sm"
                      className="border-blue-500 text-blue-500"
                    >
                      <Database size={16} className="mr-1" />
                      Sensor Data
                    </Button>
                    <Button
                      onClick={() => onRetryExercise(exercise.id)}
                      variant="outline"
                      size="sm"
                      className="border-yellow-500 text-yellow-500"
                    >
                      Retry Exercise
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => onStartExercise(exercise.id)}
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
  )
}

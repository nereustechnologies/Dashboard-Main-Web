"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExerciseSidebarProps {
  exercises: string[]
  selectedExercise: string
  onSelectExercise: (exercise: string) => void
  isOpen: boolean
  onToggle: () => void
}

export function ExerciseSidebar({
  exercises,
  selectedExercise,
  onSelectExercise,
  isOpen,
  onToggle,
}: ExerciseSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:sticky top-16 z-40 w-64 border-r bg-background/95 backdrop-blur transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Exercises</h2>
          <button onClick={onToggle} className="p-1 rounded-md hover:bg-muted md:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="space-y-3 p-2 overflow-y-auto h-[calc(100%-4rem)]">
          {(() => {
            // Map exercises to categories (mirroring test exercises structure)
            const categoryMap: Record<string, string> = {
              knee_flexion: "mobility",
              lunge_stretch: "mobility",
              knee_to_wall: "mobility",
              squats: "strength",
              lunges: "strength",
              plank_hold: "endurance",
              sprint: "endurance",
              shuttle_run: "endurance",
            }

            const orderedCategories: Array<{ key: string; label: string }> = [
              { key: "mobility", label: "Mobility" },
              { key: "strength", label: "Strength" },
              { key: "endurance", label: "Endurance" },
            ]

            // Build category -> exercises list from incoming props
            const grouped: Record<string, string[]> = {}
            exercises.forEach((ex) => {
              const cat = categoryMap[ex] || "other"
              if (!grouped[cat]) grouped[cat] = []
              grouped[cat].push(ex)
            })

            return orderedCategories.map(({ key, label }) => {
              const exs = grouped[key] || []
              if (exs.length === 0) return null

              return (
                <div key={key} className="space-y-1">
                  <h3 className="px-3 text-xs font-semibold uppercase tracking-wide text-[#00D4EF]">
                    {label}
                  </h3>
                  {exs.map((exercise) => {
                    const formattedName = exercise
                      .split("_")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")

                    return (
                      <button
                        key={exercise}
                        onClick={() => {
                          onSelectExercise(exercise)
                          if (window.innerWidth < 768) onToggle()
                        }}
                        className={cn(
                          "w-full rounded-md px-3 py-2 text-sm transition-colors text-left",
                          selectedExercise === exercise
                            ? "bg-cyan-500/20 text-cyan-500"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {formattedName}
                      </button>
                    )
                  })}
                </div>
              )
            })
          })()}

          {/* Report shortcuts */}
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wide text-[#00D4EF]">Report</h3>
            {[
              { key: "training_purpose", label: "Training with Purpose" },
              { key: "movement_signature", label: "Movement Signature" },
               { key: "scoresToBeat", label: "Scores To Beat" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  onSelectExercise(key)
                  if (window.innerWidth < 768) onToggle()
                }}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-sm transition-colors text-left",
                  selectedExercise === key
                    ? "bg-cyan-500/20 text-cyan-500"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}

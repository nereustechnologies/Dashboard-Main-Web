"use client"

import { useState, useEffect } from "react"

export interface ExerciseState {
  mobility: Array<{ id: string; name: string; completed: boolean }>;
  strength: Array<{ id: string; name: string; completed: boolean }>;
  endurance: Array<{ id: string; name: string; completed: boolean }>;
}

export type ExerciseCategory = keyof ExerciseState;

const initialExercises = {
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
    { id: "sprint", name: "50m Sprint", completed: false },
    { id: "shuttle_run", name: "5-10-5 Shuttle Run", completed: false },
  ],
}

export function useExerciseState() {
  const [exerciseState, setExerciseState] = useState<ExerciseState>(initialExercises)
  const [mobilityCompleted, setMobilityCompleted] = useState(false)
  const [strengthCompleted, setStrengthCompleted] = useState(false)
  const [enduranceCompleted, setEnduranceCompleted] = useState(false)

  useEffect(() => {
    // Check if all exercises in a category are completed
    const allMobilityCompleted = exerciseState.mobility.every((ex) => ex.completed)
    const allStrengthCompleted = exerciseState.strength.every((ex) => ex.completed)
    const allEnduranceCompleted = exerciseState.endurance.every((ex) => ex.completed)

    setMobilityCompleted(allMobilityCompleted)
    setStrengthCompleted(allStrengthCompleted)
    setEnduranceCompleted(allEnduranceCompleted)
  }, [exerciseState])

  const completeExercise = (exerciseId: string) => {
    setExerciseState((prevState: ExerciseState) => {
      const updatedState = { ...prevState };
      for (const category of ['mobility', 'strength', 'endurance'] as ExerciseCategory[]) {
        const exerciseIndex = updatedState[category].findIndex((ex) => ex.id === exerciseId);
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
  }

  const retryExercise = (exerciseId: string) => {
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
  }

  return {
    exerciseState,
    setExerciseState,
    mobilityCompleted,
    strengthCompleted,
    enduranceCompleted,
    completeExercise,
    retryExercise,
  }
}

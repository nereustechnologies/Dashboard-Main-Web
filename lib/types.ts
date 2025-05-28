// User types
export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "tester"
}

// Customer types
export interface Customer {
  id: string
  name: string
  age: number
  gender: string
  height: number
  weight: number
  sleepLevels: number
  activityLevel: "active" | "moderately_active" | "not_active"
  calorieIntake: number
  mood: string
}

// Test types
export interface Test {
  id: string
  customerId: string
  testerId: string
  date: string
  categories: string[]
  exercises: Exercise[]
  status: "Completed" | "Partial" | "In Progress"
}

export interface Exercise {
  id: string
  name: string
  category: "mobility" | "strength" | "endurance"
  completed: boolean
  data: ExerciseData[]
}

export interface ExerciseData {
  timestamp: string
  action: string
  leg?: "left" | "right"
  sensorData?: SensorData
}

export interface SensorData {
  accX: number
  accY: number
  accZ: number
  gyrX: number
  gyrY: number
  gyrZ: number
  magX?: number
  magY?: number
  magZ?: number
}

// Sensor types
export interface Sensor {
  id: string
  name: string
  battery: number
  connected: boolean
}


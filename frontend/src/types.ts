export interface FitnessMetrics {
  date: string;
  steps: number;
  caloriesBurned: number;
  workoutDuration: number;
  waterIntake: number;
  weight: number;
  bodyFat: number;
  muscleMass: number;
}

export interface WorkoutData {
  id: string;
  date: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  notes: string;
}

export interface DailyData {
  date: string;
  steps: number;
  calories: number;
  duration: number;
}

export interface WorkoutDataPoint {
  duration: number;
  calories: number;
}

export interface ActivityDistribution {
  name: string;
  value: number;
  color: string;
}

export interface IntensityData {
  day: number;
  hour: number;
  intensity: number;
}
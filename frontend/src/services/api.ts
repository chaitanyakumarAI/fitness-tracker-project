import axios from 'axios';
import type { WorkoutData, FitnessMetrics } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fitnessApi = {
  // Workout data endpoints
  getWorkouts: async () => {
    const response = await api.get<WorkoutData[]>('/workouts');
    return response.data;
  },

  addWorkout: async (workout: Omit<WorkoutData, 'id'>) => {
    const response = await api.post<WorkoutData>('/workouts', workout);
    return response.data;
  },

  // Fitness metrics endpoints
  getMetrics: async (startDate: string, endDate: string) => {
    const response = await api.get<FitnessMetrics[]>('/metrics', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  addMetrics: async (metrics: Omit<FitnessMetrics, 'id'>) => {
    const response = await api.post<FitnessMetrics>('/metrics', metrics);
    return response.data;
  },
};
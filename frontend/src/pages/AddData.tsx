import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { Card } from '../components/ui/Card';
import { fitnessApi } from '../services/api';

const formSchema = z.object({
  date: z.string(),
  workoutType: z.string().min(1, 'Please select a workout type'),
  duration: z.number().min(0, 'Duration cannot be negative'),
  steps: z.number().min(0, 'Steps cannot be negative'),
  caloriesBurned: z.number().min(0, 'Calories cannot be negative'),
  waterIntake: z.number().min(0, 'Water intake cannot be negative'),
  weight: z.number().min(0, 'Weight cannot be negative'),
  bodyFat: z.number().min(0, 'Body fat cannot be negative').max(100, 'Body fat cannot exceed 100%'),
  muscleMass: z.number().min(0, 'Muscle mass cannot be negative'),
  notes: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface ValidationErrors {
  [key: string]: string;
}

const AddData: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    workoutType: '',
    duration: 0,
    steps: 0,
    caloriesBurned: 0,
    waterIntake: 0,
    weight: 0,
    bodyFat: 0,
    muscleMass: 0,
    notes: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    try {
      formSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await fitnessApi.addMetrics(formData);
        setShowSuccess(true);
        setShowError(false);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          workoutType: '',
          duration: 0,
          steps: 0,
          caloriesBurned: 0,
          waterIntake: 0,
          weight: 0,
          bodyFat: 0,
          muscleMass: 0,
          notes: '',
        });
      } catch (error) {
        console.error('Error submitting data:', error);
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numericFields = ['duration', 'steps', 'caloriesBurned', 'waterIntake', 'weight', 'bodyFat', 'muscleMass'];
    
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const InputField = ({ label, name, type, value, onChange, error, ...props }: any) => (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        }`}
        {...props}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Fitness Data</h1>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            Data saved successfully!
          </motion.div>
        )}

        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="h-5 w-5" />
            Error saving data. Please try again.
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Workout Type
              </label>
              <select
                name="workoutType"
                value={formData.workoutType}
                onChange={handleChange}
                className={`p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all ${
                  errors.workoutType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
              >
                <option value="">Select type</option>
                <option value="running">Running</option>
                <option value="cycling">Cycling</option>
                <option value="swimming">Swimming</option>
                <option value="weights">Weights</option>
              </select>
              {errors.workoutType && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500"
                >
                  {errors.workoutType}
                </motion.p>
              )}
            </div>

            <InputField
              label="Duration (minutes)"
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="0"
              required
              error={errors.duration}
            />

            <InputField
              label="Steps"
              type="number"
              name="steps"
              value={formData.steps}
              onChange={handleChange}
              min="0"
              required
              error={errors.steps}
            />

            <InputField
              label="Calories Burned"
              type="number"
              name="caloriesBurned"
              value={formData.caloriesBurned}
              onChange={handleChange}
              min="0"
              required
              error={errors.caloriesBurned}
            />

            <InputField
              label="Water Intake (L)"
              type="number"
              name="waterIntake"
              value={formData.waterIntake}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
              error={errors.waterIntake}
            />

            <InputField
              label="Weight (kg)"
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
              error={errors.weight}
            />

            <InputField
              label="Body Fat %"
              type="number"
              name="bodyFat"
              value={formData.bodyFat}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              required
              error={errors.bodyFat}
            />

            <InputField
              label="Muscle Mass (kg)"
              type="number"
              name="muscleMass"
              value={formData.muscleMass}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
              error={errors.muscleMass}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all"
              rows={4}
            />
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-lg transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
            whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
          >
            {isSubmitting ? 'Saving...' : 'Save Data'}
          </motion.button>
        </form>
      </Card>
    </div>
  );
};

export default AddData;
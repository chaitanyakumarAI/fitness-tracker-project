import React, { useState, useCallback } from 'react';
import { format, subDays, isWithinInterval, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Area, AreaChart
} from 'recharts';
import { Download, Calendar, Filter, Search } from 'lucide-react';
import type { WorkoutData } from '../types';
import { Card } from '../components/ui/Card';
import { WorkoutHeatmap } from '../components/visualizations/WorkoutHeatmap';
import { motion, AnimatePresence } from 'framer-motion';

// Generate mock data for the past 30 days
const mockWorkouts: WorkoutData[] = Array.from({ length: 30 }, (_, i) => ({
  id: `workout-${i}`,
  date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
  type: ['Running', 'Cycling', 'Swimming', 'Weights'][Math.floor(Math.random() * 4)],
  duration: Math.floor(Math.random() * 60) + 30,
  caloriesBurned: Math.floor(Math.random() * 400) + 200,
  notes: 'Great workout session!',
}));

// Generate heatmap data
const generateHeatmapData = (startDate: Date, endDate: Date) => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.flatMap(day => 
    Array.from({ length: 24 }, (_, hour) => ({
      date: format(day, 'yyyy-MM-dd'),
      hour,
      intensity: Math.floor(Math.random() * 100)
    }))
  );
};

const History: React.FC = () => {
  const [filter, setFilter] = useState('');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const heatmapData = React.useMemo(() => 
    generateHeatmapData(new Date(startDate), new Date(endDate)),
    [startDate, endDate]
  );

  const filteredWorkouts = React.useMemo(() => 
    mockWorkouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      const isInDateRange = isWithinInterval(workoutDate, {
        start: startOfDay(new Date(startDate)),
        end: endOfDay(new Date(endDate))
      });
      
      const matchesType = selectedWorkoutType === 'all' || workout.type === selectedWorkoutType;
      const matchesSearch = filter.toLowerCase() === '' || 
        workout.type.toLowerCase().includes(filter.toLowerCase()) ||
        workout.notes.toLowerCase().includes(filter.toLowerCase());
      
      return isInDateRange && matchesType && matchesSearch;
    }),
    [startDate, endDate, selectedWorkoutType, filter]
  );

  const workoutTypes = ['all', ...Array.from(new Set(mockWorkouts.map(w => w.type)))];

  const exportData = useCallback(() => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Date,Type,Duration (min),Calories Burned,Notes\n' +
      filteredWorkouts
        .map((row) => {
          return `${row.date},${row.type},${row.duration},${row.caloriesBurned},"${row.notes}"`;
        })
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'fitness_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredWorkouts]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workout History</h1>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="h-5 w-5" />
            Filters
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            Export CSV
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Workout Type
                  </label>
                  <select
                    value={selectedWorkoutType}
                    onChange={(e) => setSelectedWorkoutType(e.target.value)}
                    className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    {workoutTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search workouts..."
                      className="w-full p-2 pl-10 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Progress Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredWorkouts}>
                <defs>
                  <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818CF8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="duration"
                  stroke="#4F46E5"
                  fillOpacity={1}
                  fill="url(#colorDuration)"
                  name="Duration (min)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="caloriesBurned"
                  stroke="#818CF8"
                  fillOpacity={1}
                  fill="url(#colorCalories)"
                  name="Calories"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Workout Intensity</h2>
          <div className="h-80">
            <WorkoutHeatmap
              data={heatmapData}
              width={800}
              height={400}
            />
          </div>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Calories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredWorkouts.map((workout) => (
                <motion.tr
                  key={workout.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {workout.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {workout.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {workout.duration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {workout.caloriesBurned} kcal
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{workout.notes}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default History;
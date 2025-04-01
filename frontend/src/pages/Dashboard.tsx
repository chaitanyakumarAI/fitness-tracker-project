import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, Legend,
  Rectangle, Surface
} from 'recharts';
import { Activity, Droplets, Scale, Timer, Flame, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Card } from '../components/ui/Card';
import { CircularProgress } from '../components/ui/CircularProgress';
import { ProgressBar } from '../components/ui/ProgressBar';

// Mock data generation
const generateDailyData = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    date: format(subDays(new Date(), 6 - i), 'MMM dd'),
    steps: Math.floor(Math.random() * 5000) + 5000,
    calories: Math.floor(Math.random() * 500) + 500,
    duration: Math.floor(Math.random() * 60) + 30,
  }));
};

const generateWorkoutData = () => {
  return Array.from({ length: 20 }, () => ({
    duration: Math.floor(Math.random() * 90) + 30,
    calories: Math.floor(Math.random() * 800) + 200,
  }));
};

const activityDistribution = [
  { name: 'Running', value: 35, color: '#4F46E5' },
  { name: 'Cycling', value: 25, color: '#818CF8' },
  { name: 'Swimming', value: 20, color: '#A5B4FC' },
  { name: 'Weights', value: 20, color: '#C7D2FE' },
];

const intensityData = Array.from({ length: 7 }, (_, dayIndex) =>
  Array.from({ length: 24 }, (_, hourIndex) => ({
    day: dayIndex,
    hour: hourIndex,
    intensity: Math.floor(Math.random() * 100),
  }))
).flat();

const MetricCard = ({ icon: Icon, title, value, unit, trend }: any) => (
  <Card className="flex items-center gap-4">
    <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
      <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
    </div>
    <div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm">{title}</h3>
      <div className="flex items-center gap-2">
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {value}
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{unit}</span>
        </p>
        {trend && (
          <span className="text-sm text-green-500 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            {trend}%
          </span>
        )}
      </div>
    </div>
  </Card>
);

const Dashboard: React.FC = () => {
  const [dailyData] = useState(generateDailyData());
  const [workoutData] = useState(generateWorkoutData());

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

  const HeatmapCell = ({ x, y, width, height, value }: any) => {
    const intensity = Math.min(value / 100, 1);
    return (
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`rgba(79, 70, 229, ${intensity})`}
        className="transition-colors duration-300"
      />
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={Activity} title="Steps" value="8,439" unit="steps" trend="12" />
        <MetricCard icon={Flame} title="Calories Burned" value="487" unit="kcal" trend="8" />
        <MetricCard icon={Timer} title="Active Time" value="1.5" unit="hours" trend="15" />
        <MetricCard icon={Droplets} title="Water Intake" value="2.1" unit="L" trend="5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Daily Progress</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="steps"
                  stroke="#4F46E5"
                  name="Steps"
                  strokeWidth={2}
                  dot={{ fill: '#4F46E5' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="calories"
                  stroke="#818CF8"
                  name="Calories"
                  strokeWidth={2}
                  dot={{ fill: '#818CF8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Workout Duration</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="duration"
                  fill="#4F46E5"
                  name="Duration (min)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Workout Time vs. Calories
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="duration"
                  name="Duration"
                  unit=" min"
                />
                <YAxis
                  type="number"
                  dataKey="calories"
                  name="Calories"
                  unit=" kcal"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Scatter
                  name="Workouts"
                  data={workoutData}
                  fill="#4F46E5"
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Activity Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value}%)`}
                >
                  {activityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Weekly Workout Intensity</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <Surface>
              <g>
                {intensityData.map((cell, index) => (
                  <HeatmapCell
                    key={index}
                    x={(cell.hour * 100) / 24}
                    y={(cell.day * 100) / 7}
                    width={100 / 24}
                    height={100 / 7}
                    value={cell.intensity}
                  />
                ))}
              </g>
            </Surface>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>Less Active</span>
          <span>More Active</span>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { api } from '../config/api';

enum DayType {
  WORKING = 'working',
  SICK = 'sick',
  VACATION = 'vacation'
}

interface TimesheetDay {
  date: string;
  dayType: DayType;
  workingHours: number;
}

export default function TimesheetForm() {
  const [days, setDays] = useState<TimesheetDay[]>([{
    date: '',
    dayType: DayType.WORKING,
    workingHours: 8
  }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const transformedDays = days.map(day => ({
        date: day.date,
        dayType: day.dayType,
        workingHours: day.dayType === DayType.WORKING ? day.workingHours : 0
      }));

      const payload = {
        costId: uuidv4(),
        days: transformedDays
      };

      console.log('Sending payload:', payload);

      const response = await axios.post(api.timesheet.create, payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Response:', response.data);

      toast.success('Timesheet submitted successfully!');
      setDays([{ date: '', dayType: DayType.WORKING, workingHours: 8 }]); 
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.log('Error details:', error.response?.data);
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const addDay = () => {
    setDays([...days, { date: '', dayType: DayType.WORKING, workingHours: 8 }]);
  };

  const removeDay = (index: number) => {
    if (days.length > 1) {
      setDays(days.filter((_, i) => i !== index));
    }
  };

  const updateDay = (index: number, field: keyof TimesheetDay, value: any) => {
    const newDays = [...days];
    if (field === 'dayType') {
      // Automatically set workingHours to 0 for sick and vacation days
      newDays[index] = {
        ...newDays[index],
        [field]: value,
        workingHours: value === DayType.WORKING ? newDays[index].workingHours : 0
      };
    } else {
      newDays[index] = { ...newDays[index], [field]: value };
    }
    setDays(newDays);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          {days.map((day, index) => (
            <div key={index} className="flex items-center space-x-4">
              <input
                type="date"
                value={day.date}
                onChange={(e) => updateDay(index, 'date', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              
              <select
                value={day.dayType}
                onChange={(e) => updateDay(index, 'dayType', e.target.value as DayType)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value={DayType.WORKING}>Working</option>
                <option value={DayType.SICK}>Sick</option>
                <option value={DayType.VACATION}>Vacation</option>
              </select>
              
              <input
                type="number"
                value={day.workingHours}
                onChange={(e) => updateDay(index, 'workingHours', parseInt(e.target.value))}
                min="0"
                max="24"
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 w-20"
                disabled={day.dayType !== DayType.WORKING}
              />
              
              <button
                type="button"
                onClick={() => removeDay(index)}
                className="text-red-600 hover:text-red-800"
                disabled={days.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-between">
          <button
            type="button"
            onClick={addDay}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Day
          </button>
          
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit Timesheet
          </button>
        </div>
      </div>
    </form>
  );
} 
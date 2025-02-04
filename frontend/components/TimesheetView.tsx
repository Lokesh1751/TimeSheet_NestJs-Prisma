'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { api } from '../config/api';

interface TimesheetData {
  year: number;
  total_vacation_leaves: number;
  total_sick_leaves: number;
  total_working_hours: number;
  months: Record<string, MonthData>;
}

interface MonthData {
  total_vacation_leaves: number;
  total_sick_leaves: number;
  total_working_hours: number;
  days: DayData[];
}

interface DayData {
  id: string;
  date: string;
  day_type: string;
  workingHours: number;
}

interface UpdateModalProps {
  day: DayData;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: any) => Promise<void>;
}

export default function TimesheetView() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [costId, setCostId] = useState('');
  const [timesheetData, setTimesheetData] = useState<TimesheetData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const fetchTimesheet = async () => {
    try {
      const response = await axios.get(api.timesheet.getByYear(year), {
        params: { costId }
      });

      setTimesheetData(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.log('Error details:', error.response?.data);
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleUpdate = async (updates: any) => {
    try {
      const response = await axios.put(api.timesheet.bulkUpdate, [updates], {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      toast.success('Timesheet updated successfully!');
      fetchTimesheet(); // Refresh the data
      setIsUpdateModalOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.log('Error details:', error.response?.data);
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex space-x-4 mb-6">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="2000"
            max="2100"
          />
          
          <input
            type="text"
            value={costId}
            onChange={(e) => setCostId(e.target.value)}
            placeholder="Enter Cost ID"
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
          />
          
          <button
            onClick={fetchTimesheet}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Timesheet
          </button>
        </div>

        {timesheetData && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900">Vacation Days</h3>
                <p className="text-3xl font-bold text-blue-600">{timesheetData.total_vacation_leaves}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-900">Sick Days</h3>
                <p className="text-3xl font-bold text-green-600">{timesheetData.total_sick_leaves}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-900">Working Hours</h3>
                <p className="text-3xl font-bold text-purple-600">{timesheetData.total_working_hours}</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(timesheetData.months).map(([month, data]) => (
                <div key={month} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{month}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.days.map((day) => (
                          <tr 
                            key={day.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onDoubleClick={() => {
                              setSelectedDay(day);
                              setIsUpdateModalOpen(true);
                            }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(day.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {day.day_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {day.workingHours}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {selectedDay && (
        <UpdateModal
          day={selectedDay}
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedDay(null);
          }}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

function UpdateModal({ day, isOpen, onClose, onUpdate }: UpdateModalProps) {
  const [dayType, setDayType] = useState(day.day_type);
  const [workingHours, setWorkingHours] = useState(day.workingHours);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate({
      date: day.date,
      dayType,
      workingHours: dayType === 'working' ? workingHours : 0
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-medium mb-4">Update Timesheet Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="text"
              value={new Date(day.date).toLocaleDateString()}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={dayType}
              onChange={(e) => {
                setDayType(e.target.value);
                if (e.target.value !== 'working') {
                  setWorkingHours(0);
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="working">Working</option>
              <option value="sick">Sick</option>
              <option value="vacation">Vacation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Working Hours</label>
            <input
              type="number"
              value={workingHours}
              onChange={(e) => setWorkingHours(parseInt(e.target.value))}
              disabled={dayType !== 'working'}
              min="0"
              max="24"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
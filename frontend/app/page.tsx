'use client';

import { useState } from 'react';
import TimesheetForm from '../components/TimesheetForm';
import TimesheetView from '../components/TimesheetView';
import { Tab } from '@headlessui/react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Timesheet Management System
        </h1>
        
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-8">
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected 
                ? 'bg-white text-blue-700 shadow'
                : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
              } px-4 focus:outline-none`
            }>
              Add Timesheet
            </Tab>
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected 
                ? 'bg-white text-blue-700 shadow'
                : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
              } px-4 focus:outline-none`
            }>
              View Timesheets
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <TimesheetForm />
            </Tab.Panel>
            <Tab.Panel>
              <TimesheetView />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </main>
  );
}

"use client";
import React, { useState, useEffect } from 'react';
import Calendar from '../components/Calendar';
import AvailabilityForm from '../components/AvailabilityForm';

export default function Home() {
  const [events, setEvents] = useState<{ title: string; start: Date; end: Date }[]>([]);

  useEffect(() => {
    // Fetch events from API or set sample events
    setEvents([
      {
        title: 'Pathfinder Session',
        start: new Date('2025-03-15T18:00:00'),
        end: new Date('2025-03-15T21:00:00'),
      },
    ]);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Pathfinder Session Scheduler</h1>
      <Calendar events={events} />
      <hr className="my-8" />
      <AvailabilityForm />
    </div>
  );
}

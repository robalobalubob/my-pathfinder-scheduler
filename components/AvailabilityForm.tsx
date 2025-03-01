"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AvailabilityForm: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeOption, setTimeOption] = useState<'specific' | 'allDay'>('specific');
  const [timeRange, setTimeRange] = useState({ start: '', end: '' });
  const [repeatOption, setRepeatOption] = useState('none');
  const [repeatWeeks, setRepeatWeeks] = useState('');

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role === "new") {
      router.push("/");
    }
  }, [session, status, router]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (timeOption === 'specific') {
      const [startHour, startMin] = timeRange.start.split(':').map(Number);
      const [endHour, endMin] = timeRange.end.split(':').map(Number);
      const startTotal = startHour * 60 + startMin;
      const endTotal = endHour * 60 + endMin;
      if (startTotal >= endTotal) {
        alert("Start time must be before end time.");
        return;
      }
    }
  
    const finalTimeRange = timeOption === 'allDay' ? { start: '00:00', end: '23:59' } : timeRange;
    const payload = {
      name,
      selectedDays,
      timeOption,
      timeRange: finalTimeRange,
      repeatOption,
      repeatWeeks: repeatOption === 'weeks' ? repeatWeeks : null,
    };
  
    const response = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
  
    if (!response.ok) {
      alert("Submission failed: " + (data.message || "Unknown error."));
    } else {
      alert("Availability submitted successfully!");
      setName('');
      setSelectedDays([]);
      setTimeOption('specific');
      setTimeRange({ start: '', end: '' });
      setRepeatOption('none');
      setRepeatWeeks('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-background text-foreground rounded-lg shadow-md space-y-4">
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-foreground placeholder-gray-400"
      />
      <div>
        {daysOfWeek.map(day => (
          <button
            type="button"
            key={day}
            onClick={() => toggleDay(day)}
            className={`px-3 py-1 m-1 rounded transition-colors duration-200 ${
              selectedDays.includes(day)
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-foreground'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>
      <div>
        <label className="flex flex-col">
          <span className="mb-1">Availability:</span>
          <select
            value={timeOption}
            onChange={(e) => setTimeOption(e.target.value as 'specific' | 'allDay')}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-foreground"
          >
            <option value="specific">Specific Times</option>
            <option value="allDay">All Day</option>
          </select>
        </label>
      </div>
      {timeOption === 'specific' && (
        <div className="flex space-x-4">
          <label className="flex flex-col">
            <span className="mb-1">Start Time:</span>
            <input
              type="time"
              value={timeRange.start}
              onChange={(e) => setTimeRange({ ...timeRange, start: e.target.value })}
              required
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-foreground"
            />
          </label>
          <label className="flex flex-col">
            <span className="mb-1">End Time:</span>
            <input
              type="time"
              value={timeRange.end}
              onChange={(e) => setTimeRange({ ...timeRange, end: e.target.value })}
              required
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-foreground"
            />
          </label>
        </div>
      )}
      <div>
        <label className="flex flex-col">
          <span className="mb-1">Repeat:</span>
          <select
            value={repeatOption}
            onChange={(e) => setRepeatOption(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-foreground"
          >
            <option value="none">No Repeat</option>
            <option value="weeks">For a set number of weeks</option>
            <option value="forever">Repeat indefinitely</option>
          </select>
        </label>
      </div>
      {repeatOption === 'weeks' && (
        <div>
          <label className="flex flex-col">
            <span className="mb-1">Number of Weeks:</span>
            <input
              type="number"
              min="1"
              value={repeatWeeks}
              onChange={(e) => setRepeatWeeks(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-foreground"
            />
          </label>
        </div>
      )}
      <button
        type="submit"
        className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Submit Availability
      </button>
    </form>
  );
};

export default AvailabilityForm;
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Availability {
  id: number;
  name: string;
  selected_days: string[];
  time_option: string;
  start_time: string;
  end_time: string;
  repeat_option: string;
  repeat_weeks: number | null;
  created_at: string;
}

export default function EditAvailabilityPage() {
  const { id } = useParams(); // dynamic parameter from URL
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Form state variables
  const [name, setName] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeOption, setTimeOption] = useState<"specific" | "allDay">("specific");
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });
  const [repeatOption, setRepeatOption] = useState("none");
  const [repeatWeeks, setRepeatWeeks] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user) {
      router.push("/");
      return;
    }
    // Fetch availability data for the current user and this id
    async function fetchAvailability() {
      const res = await fetch("/api/availabilities?user=true", { cache: "no-store" });
      const data = await res.json();
      const avail: Availability | undefined = data.availabilities.find(
        (item: Availability) => item.id.toString() === id
      );
      if (!avail) {
        alert("Availability not found or you are not authorized to edit it.");
        router.push("/availability");
        return;
      }
      setName(avail.name);
      setSelectedDays(avail.selected_days);
      setTimeOption(avail.time_option as "specific" | "allDay");
      setTimeRange({ start: avail.start_time, end: avail.end_time });
      setRepeatOption(avail.repeat_option);
      setRepeatWeeks(avail.repeat_weeks ? avail.repeat_weeks.toString() : "");
      setLoading(false);
    }
    fetchAvailability();
  }, [id, session, status, router]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeOption === "specific") {
      const [startHour, startMin] = timeRange.start.split(":").map(Number);
      const [endHour, endMin] = timeRange.end.split(":").map(Number);
      const startTotal = startHour * 60 + startMin;
      const endTotal = endHour * 60 + endMin;
      if (startTotal >= endTotal) {
        alert("Start time must be before end time.");
        return;
      }
    }
    const finalTimeRange =
      timeOption === "allDay" ? { start: "00:00", end: "23:59" } : timeRange;
    const payload = {
      name,
      selectedDays,
      timeOption,
      timeRange: finalTimeRange,
      repeatOption,
      repeatWeeks: repeatOption === "weeks" ? repeatWeeks : null,
    };

    const res = await fetch(`/api/availabilities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) {
      alert("Update failed: " + (result.message || "Unknown error."));
    } else {
      alert("Availability updated successfully!");
      router.push("/availability?user=true");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Availability</h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto p-6 bg-background text-foreground rounded-lg shadow-md space-y-4"
      >
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-foreground placeholder-gray-400"
        />
        <div>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
            <button
              type="button"
              key={day}
              onClick={() => toggleDay(day)}
              className={`px-3 py-1 m-1 rounded transition-colors duration-200 ${
                selectedDays.includes(day)
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-foreground"
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
              onChange={(e) => setTimeOption(e.target.value as "specific" | "allDay")}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-foreground"
            >
              <option value="specific">Specific Times</option>
              <option value="allDay">All Day</option>
            </select>
          </label>
        </div>
        {timeOption === "specific" && (
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
        {repeatOption === "weeks" && (
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
          Save Changes
        </button>
      </form>
    </div>
  );
}
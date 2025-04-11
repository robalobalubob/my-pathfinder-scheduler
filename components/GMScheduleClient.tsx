"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";

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

export default function GMScheduleClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDate, setSessionDate] = useState("");

  const [filterName, setFilterName] = useState("");
  const [filterDays, setFilterDays] = useState<string[]>([]);
  const [filterStartTime, setFilterStartTime] = useState("");
  const [filterEndTime, setFilterEndTime] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (
      !session ||
      !session.user ||
      (session.user.role !== "gm" && session.user.role !== "admin")
    ) {
      router.push("/");
      return;
    }

    fetch("/api/availabilities")
      .then((res) => res.json())
      .then((data) => {
        if (data.availabilities) {
          setAvailabilities(data.availabilities);
        }
      })
      .catch((err) => {
        // Replacing console.error with proper error handling
        toast.error("Failed to load availabilities");
      });
  }, [session, status, router]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionTitle || !sessionDate) {
      alert("Please provide both a title and a session date/time.");
      return;
    }

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: sessionTitle, session_date: sessionDate }),
    });
    const result = await res.json();

    if (!res.ok) {
      alert("Failed to schedule session: " + (result.message || "Unknown error."));
    } else {
      alert("Session scheduled successfully!");
      setSessionTitle("");
      setSessionDate("");
    }
  };

  const filteredAvailabilities = useMemo(() => {
    return availabilities.filter((avail) => {
      if (filterName && !avail.name.toLowerCase().includes(filterName.toLowerCase())) {
        return false;
      }
      if (filterDays.length > 0 && !filterDays.some((day) => avail.selected_days.includes(day))) {
        return false;
      }

      if (avail.time_option !== "allDay" && filterStartTime && filterEndTime) {
        if (avail.start_time < filterStartTime || avail.end_time > filterEndTime) {
          return false;
        }
      }
      return true;
    });
  }, [availabilities, filterName, filterDays, filterStartTime, filterEndTime]);

  const toggleFilterDay = (day: string) => {
    setFilterDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">GM Scheduling Page</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Schedule a Session</h2>
        <form
          onSubmit={handleScheduleSubmit}
          className="max-w-lg mx-auto p-6 bg-background text-foreground rounded-lg shadow-md space-y-4"
        >
          <input
            type="text"
            placeholder="Session Title"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-transparent text-foreground placeholder-gray-400"
          />
          <input
            type="datetime-local"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-transparent text-foreground"
          />
          <button
            type="submit"
            className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Schedule Session
          </button>
        </form>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Player Availabilities</h2>
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        {showFilters && (
          <div className="mb-4 p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">Filters</h3>
            <div className="mb-2">
              <label className="block mb-1">Name:</label>
              <input
                type="text"
                placeholder="Filter by name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-foreground placeholder-gray-400"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Days:</label>
              <div className="flex gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleFilterDay(day)}
                    className={`px-3 py-1 m-1 rounded transition-colors duration-200 ${
                      filterDays.includes(day)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-foreground'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <label className="block mb-1">Time Range:</label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={filterStartTime}
                  onChange={(e) => setFilterStartTime(e.target.value)}
                  className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-foreground"
                  placeholder="From"
                />
                <input
                  type="time"
                  value={filterEndTime}
                  onChange={(e) => setFilterEndTime(e.target.value)}
                  className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-foreground"
                  placeholder="To"
                />
              </div>
            </div>
          </div>
        )}

        {filteredAvailabilities.length === 0 ? (
          <p>No availabilities match the filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Days</th>
                  <th className="border p-2 text-left">Time</th>
                  <th className="border p-2 text-left">Repeat</th>
                </tr>
              </thead>
              <tbody>
                {filteredAvailabilities.map((avail) => (
                  <tr key={avail.id} className="border-b">
                    <td className="border p-2">{avail.name}</td>
                    <td className="border p-2">{avail.selected_days.join(", ")}</td>
                    <td className="border p-2">
                      {avail.time_option === "allDay"
                        ? "All Day"
                        : `${avail.start_time} to ${avail.end_time}`}
                    </td>
                    <td className="border p-2">
                      {avail.repeat_option}
                      {avail.repeat_option === "weeks" && avail.repeat_weeks
                        ? ` (${avail.repeat_weeks} weeks)`
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
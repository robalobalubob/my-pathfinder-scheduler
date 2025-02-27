"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user || (session.user.role !== "gm" && session.user.role !== "admin")) {
      router.push("/");
      return;
    }
    // Fetch availabilities from an API endpoint
    fetch("/api/availabilities")
      .then((res) => res.json())
      .then((data) => {
        if (data.availabilities) {
          setAvailabilities(data.availabilities);
        }
      })
      .catch((err) => console.error(err));
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
    console.log("Scheduled session:", result);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">GM Scheduling Page</h1>

      {/* Display all availabilities */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Player Availabilities</h2>
        {availabilities.length === 0 ? (
          <p>No availabilities submitted yet.</p>
        ) : (
          <ul className="space-y-2">
            {availabilities.map((avail) => (
              <li key={avail.id} className="border p-2 rounded">
                <p>
                  <strong>Name:</strong> {avail.name}
                </p>
                <p>
                  <strong>Days:</strong> {avail.selected_days.join(", ")}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {avail.time_option === "allDay"
                    ? "All Day"
                    : `${avail.start_time} to ${avail.end_time}`}
                </p>
                <p>
                  <strong>Repeat:</strong> {avail.repeat_option}
                  {avail.repeat_option === "weeks" && avail.repeat_weeks
                    ? ` (${avail.repeat_weeks} weeks)`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Form to schedule a new session */}
      <section>
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
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import Calendar from "./Calendar";

interface Session {
  title: string;
  session_date: string;
}

export default function HomeClient() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/sessions", { cache: "no-store" });
        const data = await res.json();
        if (data.error) {
          setError(data.message || "Error fetching sessions");
        } else {
          const events = data.sessions.map((session: Session) => ({
            title: session.title,
            start: new Date(session.session_date),
            end: new Date(new Date(session.session_date).getTime() + 3 * 60 * 60 * 1000),
          }));
          setEvents(events);
        }
      } catch (err) {
        setError("Failed to fetch sessions");
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  if (loading) return <p>Loading sessions...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Pathfinder Session Scheduler</h1>
      <Calendar events={events} />
    </div>
  );
}
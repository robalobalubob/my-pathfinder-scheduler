"use client";
import { useEffect, useState } from "react";
import Calendar from "./Calendar";
import { Skeleton } from "./ui/Skeleton";
import toast from "react-hot-toast";

interface Session {
  id: number;
  title: string;
  session_date: string;
}

export default function HomeClient() {
  const [events, setEvents] = useState([]);
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoading(true);
        const [sessionsRes, nextSessionRes] = await Promise.all([
          fetch("/api/sessions", { cache: "no-store" }),
          fetch("/api/next-session", { cache: "no-store" })
        ]);
        
        if (!sessionsRes.ok) {
          throw new Error("Failed to fetch sessions");
        }
        
        const sessionsData = await sessionsRes.json();
        
        if (sessionsData.error) {
          throw new Error(sessionsData.message || "Error fetching sessions");
        }
        
        // Transform sessions into calendar events
        const calendarEvents = sessionsData.sessions.map((session: Session) => ({
          title: session.title,
          start: new Date(session.session_date),
          end: new Date(new Date(session.session_date).getTime() + 3 * 60 * 60 * 1000),
        }));
        
        setEvents(calendarEvents);
        
        // Handle next session data if available
        if (nextSessionRes.ok) {
          const nextSessionData = await nextSessionRes.json();
          if (nextSessionData.nextSession && nextSessionData.nextSession.length > 0) {
            setNextSession(nextSessionData.nextSession[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch sessions");
        toast.error("Failed to load session data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchSessions();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Pathfinder Session Scheduler</h1>
      
      {/* Next session information */}
      {nextSession && (
        <div className="mb-8 p-4 border border-primary rounded-lg bg-primary/10">
          <h2 className="text-xl font-semibold mb-2">Next Session</h2>
          <p className="text-lg">
            <span className="font-medium">{nextSession.title}</span> - {new Date(nextSession.session_date).toLocaleString()}
          </p>
        </div>
      )}
      
      {/* Calendar or loading/error states */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton height="h-8" width="w-1/4" />
          <Skeleton height="h-[500px]" width="w-full" />
        </div>
      ) : error ? (
        <div className="p-8 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
          <p className="text-red-700 dark:text-red-300 text-lg">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reload
          </button>
        </div>
      ) : (
        <Calendar events={events} />
      )}
    </div>
  );
}
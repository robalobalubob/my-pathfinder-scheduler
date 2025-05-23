"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { useFetch } from "./hooks/useFetch";
import Calendar from "./Calendar";
import SessionList from "./SessionList";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/layout/Card";
import { Button } from "./ui/form/Button";
import { Alert } from "./ui/feedback/Alert";
import { Spinner } from "./ui/feedback/Spinner";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Define session interface
interface Session {
  id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  duration?: number;
  max_players?: number;
  gm_id: string;
  created_at: string;
  [key: string]: unknown;
}

interface SessionsResponse {
  sessions: Session[];
  nextSession?: Session;
}

// Simple component for public calendar view
function PublicCalendarView() {
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch public sessions on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Get sessions for the next month
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const response = await fetch(
          `/api/sessions?upcoming=true&start_date=${today.toISOString()}&end_date=${nextMonth.toISOString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch sessions");
        }

        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (err) {
        setError("Error loading upcoming sessions");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[500px] flex justify-center items-center">
        <Spinner size="lg" label="Loading upcoming sessions..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className="my-4">
        {error}
      </Alert>
    );
  }

  // Simple display for upcoming sessions
  return (
    <div className="space-y-4">
      {sessions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-lg">No upcoming sessions scheduled.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-4 border rounded-md bg-white dark:bg-gray-800"
            >
              <h3 className="font-semibold text-lg">{session.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {new Date(session.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {session.location && (
                <p className="text-sm mt-1">
                  <span className="font-medium">Location:</span> {session.location}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomeClient() {
  const router = useRouter();
  const { isAuthenticated, isGM, isAdmin, user } = useAuth();
  const [activeView, setActiveView] = useState<"calendar" | "list">("calendar");

  // Get upcoming sessions with proper typing
  const { data, error, isLoading } = useFetch<SessionsResponse>(
    "/api/next-session"
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {!isAuthenticated ? (
        <>
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold mb-4">Welcome to Pathfinder Scheduler</h1>
            <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
              View upcoming sessions below or sign in to manage your availability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" onClick={() => router.push("/api/auth/signin")}>
                Sign In
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/register")}
              >
                Register
              </Button>
            </div>
          </div>

          {/* Public calendar view */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Pathfinder Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <PublicCalendarView />
              <div className="mt-6 text-center">
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Sign in to view more details and manage your availability for sessions.
                </p>
                <Button onClick={() => router.push("/api/auth/signin")}>
                  Sign In to Join Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Next session card for authenticated users */}
          {isLoading ? (
            <Card>
              <CardContent className="flex justify-center items-center py-8">
                <Spinner size="lg" />
              </CardContent>
            </Card>
          ) : (
            <>
              {data?.nextSession && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Next Session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 border-l-4 border-primary rounded-r-lg bg-primary/5">
                      <h3 className="text-lg font-semibold">{data.nextSession.title}</h3>
                      <p className="text-sm mb-2">
                        {new Date(data.nextSession.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {data.nextSession.location && (
                        <p className="text-sm mb-2">
                          <span className="font-medium">Location:</span> {data.nextSession.location}
                        </p>
                      )}
                      {data.nextSession.description && (
                        <p className="text-sm mt-2">{data.nextSession.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* View toggle and main content */}
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
              <CardTitle>Scheduled Sessions</CardTitle>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <Button
                  variant="outline"
                  className={activeView === "calendar" ? "bg-gray-100 dark:bg-gray-800" : ""}
                  onClick={() => setActiveView("calendar")}
                >
                  Calendar View
                </Button>
                <Button
                  variant="outline"
                  className={activeView === "list" ? "bg-gray-100 dark:bg-gray-800" : ""}
                  onClick={() => setActiveView("list")}
                >
                  List View
                </Button>
                {(isGM || isAdmin) && (
                  <Button onClick={() => router.push("/gm/schedule")}>
                    Schedule Session
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="error" className="mb-6">
                  Failed to load sessions. Please try again.
                </Alert>
              )}

              {activeView === "calendar" ? (
                <div className="mb-8">
                  <Calendar userId={user?.id} isGM={isGM} isAdmin={isAdmin} />
                </div>
              ) : (
                <SessionList />
              )}
            </CardContent>
          </Card>

          {/* User actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">My Availability</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Set your available gaming times so GMs can schedule sessions.
                </p>
                <Link href="/availability">
                  <Button variant="outline" className="w-full">
                    Manage Availability
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {isGM && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Game Master Tools</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Access your GM dashboard to manage sessions and campaigns.
                  </p>
                  <Link href="/gm">
                    <Button variant="outline" className="w-full">
                      Go to GM Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {isAdmin && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Admin Panel</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Manage users, sessions, and site settings.
                  </p>
                  <Link href="/admin">
                    <Button variant="outline" className="w-full">
                      Go to Admin Panel
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
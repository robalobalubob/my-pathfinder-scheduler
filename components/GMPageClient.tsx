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

export default function GMPageClient() {
  const router = useRouter();
  const { requireAuth, isGM, isAdmin, user } = useAuth();
  const [activeView, setActiveView] = useState<"calendar" | "list">("calendar");
  const [isLoading, setIsLoading] = useState(true);
  
  // Get GM's sessions
  const { data, error } = useFetch<{ sessions: any[] }>(
    isGM && user?.id ? `/api/sessions?gmId=${user.id}` : null
  );
  
  useEffect(() => {
    // Require GM or admin authentication
    const hasAccess = requireAuth(['gm', 'admin']);
    if (!hasAccess) return;
    
    // Set loading state based on data/error
    if (data || error || (!isGM && !isAdmin)) {
      setIsLoading(false);
    }
  }, [requireAuth, data, error, isGM, isAdmin]);

  // Redirect to schedule page
  const handleNewSession = () => {
    router.push("/gm/schedule");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" label="Loading GM dashboard..." />
      </div>
    );
  }

  if (!isGM && !isAdmin) {
    return (
      <Alert variant="error">
        You do not have permission to access the GM dashboard.
      </Alert>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle>Game Master Dashboard</CardTitle>
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
            <Button onClick={handleNewSession}>
              Schedule New Session
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-6">
              Failed to load your sessions. Please try again.
            </Alert>
          )}
          
          {activeView === "calendar" ? (
            <div className="mb-8">
              <Calendar userId={user?.id} isGM={isGM} isAdmin={isAdmin} />
            </div>
          ) : (
            <SessionList />
          )}
          
          {data?.sessions && data.sessions.length === 0 && (
            <div className="text-center py-8 mt-8 border border-dashed rounded-md">
              <p className="text-gray-500 dark:text-gray-400">
                You haven't scheduled any sessions yet.
              </p>
              <Button className="mt-4" onClick={handleNewSession}>
                Schedule Your First Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
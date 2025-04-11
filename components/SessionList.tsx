"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useAuth } from "./hooks/useAuth";
import { useFetch, deleteData } from "./hooks/useFetch";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/layout/Card";
import { Button } from "./ui/form/Button";
import { Alert } from "./ui/feedback/Alert";
import { Spinner } from "./ui/feedback/Spinner";

interface Session {
  id: string;
  title: string;
  date: string;  // Keeping as 'date' to match API response
  session_date?: string; // Adding as optional for backward compatibility
  duration?: number;
  description?: string;
  location?: string;
  gm_id: string;
  user_id?: string; // Adding for ID compatibility
  gm_name?: string;
  created_at: string;
  created_by?: string; // Adding this field from API
}

interface SessionsResponse {
  sessions: Session[];
}

export default function SessionList() {
  const router = useRouter();
  const { isGM, isAdmin, user } = useAuth();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  
  // Fetch sessions using our custom hook
  const { 
    data, 
    error, 
    isLoading, 
    mutate 
  } = useFetch<SessionsResponse>(
    "/api/sessions"
  );

  const handleEdit = (sessionId: string, gmId: string) => {
    // Check if the current user is the GM or an admin
    if (isAdmin || (isGM && user?.id === gmId)) {
      router.push(`/gm/edit/${sessionId}`);
    } else {
      setFeedbackMessage({
        type: "error",
        text: "You don't have permission to edit this session"
      });
    }
  };

  const handleDelete = async (sessionId: string, gmId: string) => {
    // Only allow GMs who own the session or admins to delete
    if (!isAdmin && (!isGM || user?.id !== gmId)) {
      setFeedbackMessage({
        type: "error",
        text: "You don't have permission to delete this session"
      });
      return;
    }
    
    if (actionInProgress) return;
    
    try {
      setActionInProgress(sessionId);
      setFeedbackMessage(null);
      
      await deleteData(`/api/sessions/${sessionId}`);
      
      setFeedbackMessage({
        type: "success",
        text: "Session deleted successfully"
      });
      
      // Refresh the session list
      mutate();
    } catch (error: { message?: string }) {
      setFeedbackMessage({
        type: "error",
        text: `Error deleting session: ${error.message || "Unknown error"}`
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  const sessions = data?.sessions || [];

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Sessions</CardTitle>
      </CardHeader>
      
      <CardContent>
        {feedbackMessage && (
          <Alert 
            variant={feedbackMessage.type}
            className="mb-6"
            onClose={() => setFeedbackMessage(null)}
          >
            {feedbackMessage.text}
          </Alert>
        )}
        
        {error ? (
          <Alert variant="error">Failed to load sessions. Please try again.</Alert>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-lg text-gray-500 dark:text-gray-400">No sessions scheduled yet</p>
            {(isGM || isAdmin) && (
              <Button
                className="mt-4"
                onClick={() => router.push("/gm/schedule")}
              >
                Schedule a Session
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <div className="p-4 border-l-4 border-primary">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{session.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(session.date)}
                      </p>
                      {session.gm_name && (
                        <p className="text-sm mt-1">
                          <span className="font-medium">GM:</span> {session.gm_name}
                        </p>
                      )}
                      {session.location && (
                        <p className="text-sm mt-1">
                          <span className="font-medium">Location:</span> {session.location}
                        </p>
                      )}
                      {session.description && (
                        <p className="mt-2 text-sm">{session.description}</p>
                      )}
                    </div>
                    
                    {/* Only show controls to GMs who own the session or admins */}
                    {(isAdmin || (isGM && user?.id === session.gm_id)) && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(session.id, session.gm_id)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          isLoading={actionInProgress === session.id}
                          disabled={actionInProgress !== null}
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
                              handleDelete(session.id, session.gm_id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import { useFetch, postData } from "./hooks/useFetch";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/layout/Card";
import { FormField } from "./ui/form/FormField";
import { Input } from "./ui/form/Input";
import { Button } from "./ui/form/Button";
import { DateTimePicker } from "./ui/form/DateTimePicker";
import { Alert } from "./ui/feedback/Alert";
import { Spinner } from "./ui/feedback/Spinner";

// Define player availability interface
interface PlayerAvailability {
  id: string;
  user_id: string;
  user_name?: string;
  selected_days?: string[];
  start_time: string;
  end_time: string;
  notes?: string;
  created_at: string;
  [key: string]: unknown;
}

interface ApiError {
  message: string;
  [key: string]: unknown;
}

interface AvailabilityData {
  playerAvailability: PlayerAvailability[];
}

export default function GMScheduleClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { requireAuth, isGM, isAdmin, user } = useAuth();
  
  // Initialize with date from query params if available
  const initialDate = searchParams.get('date') || 
    new Date().toISOString().slice(0, 16);
  
  const [formData, setFormData] = useState({
    title: "",
    date: initialDate, 
    duration: "180", // Default to 3 hours (180 minutes)
    description: "",
    location: "",
    max_players: "6", // Default max players
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch player availability data
  const { data: availabilityData, error: availabilityError } = useFetch<AvailabilityData>(
    isGM || isAdmin ? `/api/availabilities/all` : null
  );
  
  useEffect(() => {
    // Require GM or admin authentication
    const hasAccess = requireAuth(['gm', 'admin']);
    if (!hasAccess) return;

    if (availabilityData || availabilityError) {
      setIsLoading(false);
      
      // Display error toast if availability fetch fails
      if (availabilityError) {
        toast.error("Failed to load player availability data. You can still create a session.");
        console.error("Availability fetch error:", availabilityError);
      }
    }
  }, [requireAuth, isGM, isAdmin, availabilityData, availabilityError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate form data
      if (!formData.title || !formData.date) {
        throw new Error("Title and date are required");
      }
      
      // Parse numeric fields
      const sessionData = {
        ...formData,
        duration: parseInt(formData.duration),
        max_players: parseInt(formData.max_players),
        gm_id: user?.id
      };
      
      // Submit session data
      await postData("/api/sessions", sessionData);
      
      toast.success("Session scheduled successfully!");
      router.push("/gm");
    } catch (error: ApiError) {
      setError(error.message || "Failed to schedule session");
      toast.error(error.message || "Failed to schedule session");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!isGM && !isAdmin) {
    return (
      <Alert variant="error">
        You do not have permission to schedule sessions.
      </Alert>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Schedule a New Session</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert 
              variant="error" 
              className="mb-6"
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          
          {availabilityError && (
            <Alert 
              variant="warning" 
              className="mb-6"
            >
              Unable to load player availability data. You can still schedule a session.
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField 
              label="Session Title" 
              htmlFor="title"
              required
            >
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a title for your session"
                required
              />
            </FormField>
            
            <FormField 
              label="Date & Time" 
              htmlFor="date"
              required
            >
              <DateTimePicker
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </FormField>
            
            <FormField 
              label="Duration (minutes)" 
              htmlFor="duration"
              description="Default is 3 hours (180 minutes)"
            >
              <Input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="30"
                max="720"
              />
            </FormField>
            
            <FormField 
              label="Maximum Players" 
              htmlFor="max_players"
            >
              <Input
                type="number"
                id="max_players"
                name="max_players"
                value={formData.max_players}
                onChange={handleChange}
                min="1"
                max="20"
              />
            </FormField>
            
            <FormField 
              label="Location" 
              htmlFor="location"
              description="Physical location or virtual meeting link"
            >
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Where will this session be held?"
              />
            </FormField>
            
            <FormField 
              label="Description" 
              htmlFor="description"
              description="Provide details about the session"
            >
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what players can expect in this session"
                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </FormField>
            
            {availabilityData && availabilityData.playerAvailability && availabilityData.playerAvailability.length > 0 ? (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2">Players Available Around This Time:</h3>
                <div className="text-sm">
                  {availabilityData.playerAvailability
                    .filter(availability => {
                      // Display players available on the selected day and time
                      const sessionDate = new Date(formData.date);
                      const availableDay = availability.selected_days && Array.isArray(availability.selected_days) ? 
                        availability.selected_days.includes(
                          ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][sessionDate.getDay()]
                        ) : false;
                      
                      return availableDay;
                    })
                    .map(availability => (
                      <div key={availability.id} className="mb-1">
                        <span className="font-medium">{availability.user_name || 'Player'}</span>
                        <span className="ml-2">
                          {availability.start_time} - {availability.end_time}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              !availabilityError && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No player availability data found for this time.</p>
                </div>
              )
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push("/gm")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                isLoading={isSubmitting}
                loadingText="Scheduling..."
              >
                Schedule Session
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
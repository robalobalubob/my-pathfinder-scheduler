"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import { useFetch, updateData } from "./hooks/useFetch";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/layout/Card";
import { FormField } from "./ui/form/FormField";
import { Select, SelectOption } from "./ui/form/Select";
import { Button } from "./ui/form/Button";
import { Alert } from "./ui/feedback/Alert";
import { Spinner } from "./ui/feedback/Spinner";

interface AvailabilityEditProps {
  availabilityId: string;
}

interface Availability {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  notes: string;
  user_id: string;
}

interface AvailabilityResponse {
  availability: Availability;
}

export default function AvailabilityEdit({ availabilityId }: AvailabilityEditProps) {
  const router = useRouter();
  const { requireAuth, user } = useAuth();
  const [formData, setFormData] = useState({
    day_of_week: "",
    start_time: "",
    end_time: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch availability data using our custom hook
  const { 
    data, 
    error: fetchError, 
    isLoading 
  } = useFetch<AvailabilityResponse>(
    `/api/availabilities/${availabilityId}`
  );
  
  // Ensure the user is authorized to edit this availability
  useEffect(() => {
    // Require authentication
    const hasAccess = requireAuth();
    if (!hasAccess) return;
    
    // Check if the availability belongs to the user
    if (data?.availability) {
      if (data.availability.user_id !== user?.id) {
        toast.error("You don't have permission to edit this availability");
        router.push("/availability");
      }
    }
  }, [data, requireAuth, router, user]);
  
  // Populate form with availability data when available
  useEffect(() => {
    if (data?.availability) {
      setFormData({
        day_of_week: data.availability.day_of_week,
        start_time: data.availability.start_time,
        end_time: data.availability.end_time,
        notes: data.availability.notes || "",
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateTimeFormat = (time: string): boolean => {
    // Time should be in the format "HH:MM"
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  };

  const validateTimeRange = (start: string, end: string): boolean => {
    // Check if end time is after start time
    const startTime = start.split(":").map(Number);
    const endTime = end.split(":").map(Number);

    if (startTime[0] > endTime[0]) {
      return false;
    }
    if (startTime[0] === endTime[0] && startTime[1] >= endTime[1]) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.day_of_week || !formData.start_time || !formData.end_time) {
        throw new Error("Day, start time, and end time are required");
      }
      
      // Validate time format
      if (!validateTimeFormat(formData.start_time) || !validateTimeFormat(formData.end_time)) {
        throw new Error("Times must be in 24-hour format (HH:MM)");
      }
      
      // Validate time range
      if (!validateTimeRange(formData.start_time, formData.end_time)) {
        throw new Error("End time must be after start time");
      }
      
      await updateData(`/api/availabilities/${availabilityId}`, formData);
      
      toast.success("Availability updated successfully");
      router.push("/availability");
    } catch (err: any) {
      setError(err.message || "Failed to update availability");
      toast.error(err.message || "Failed to update availability");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const dayOptions: SelectOption[] = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  if (isLoading) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Spinner size="lg" label="Loading availability..." />
        </CardContent>
      </Card>
    );
  }

  if (fetchError) {
    return (
      <Alert variant="error" className="max-w-md mx-auto">
        Failed to load availability. Please try again later.
      </Alert>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Edit Availability</CardTitle>
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Day of Week"
            htmlFor="day_of_week"
            required
          >
            <Select
              id="day_of_week"
              name="day_of_week"
              value={formData.day_of_week}
              onChange={handleChange}
              options={dayOptions}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Start Time (24hr format)"
              htmlFor="start_time"
              required
              description="e.g. 18:00 for 6 PM"
            >
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </FormField>

            <FormField
              label="End Time (24hr format)"
              htmlFor="end_time"
              required
              description="e.g. 22:00 for 10 PM"
            >
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </FormField>
          </div>

          <FormField
            label="Notes (Optional)"
            htmlFor="notes"
            description="Any additional information about your availability"
          >
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Any notes about this time slot"
            />
          </FormField>
          
          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push("/availability")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Update Availability
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
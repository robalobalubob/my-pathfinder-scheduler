"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { deleteData } from "./hooks/useFetch";
import { Button } from "./ui/form/Button";
import { Alert } from "./ui/feedback/Alert";

interface Availability {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  notes?: string;
  user_id: string;
  created_at: string;
}

interface AvailabilityListProps {
  availabilities: Availability[];
  onDelete?: () => void;
}

export default function AvailabilityList({ availabilities, onDelete }: AvailabilityListProps) {
  const router = useRouter();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Format day of week with capitalization 
  const formatDayOfWeek = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  };

  // Format time from 24h to 12h format
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    let period = "AM";
    
    let displayHours = hours;
    if (hours >= 12) {
      period = "PM";
      if (hours > 12) {
        displayHours = hours - 12;
      }
    }
    if (displayHours === 0) {
      displayHours = 12;
    }
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleEdit = (availabilityId: string) => {
    router.push(`/availability/edit/${availabilityId}`);
  };

  const handleDelete = async (availabilityId: string) => {
    if (!confirm("Are you sure you want to delete this availability?")) return;
    
    try {
      setActionInProgress(availabilityId);
      setError(null);

      await deleteData(`/api/availabilities/${availabilityId}`);
      
      toast.success("Availability deleted successfully");
      if (onDelete) {
        onDelete();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete availability";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionInProgress(null);
    }
  };

  // Sort availabilities by day of week
  const sortedAvailabilities = [...availabilities].sort((a, b) => {
    const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    return dayOrder.indexOf(a.day_of_week.toLowerCase()) - dayOrder.indexOf(b.day_of_week.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {error && (
        <Alert 
          variant="error" 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {sortedAvailabilities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No availability set yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedAvailabilities.map((availability) => (
            <div 
              key={availability.id}
              className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{formatDayOfWeek(availability.day_of_week)}</h3>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300">
                  {formatTime(availability.start_time)} - {formatTime(availability.end_time)}
                </div>
              </div>
              
              {availability.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {availability.notes}
                </p>
              )}
              
              <div className="flex space-x-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(availability.id)}
                  disabled={actionInProgress !== null}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(availability.id)}
                  isLoading={actionInProgress === availability.id}
                  disabled={actionInProgress !== null}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
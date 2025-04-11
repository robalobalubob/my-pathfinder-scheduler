"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { postData } from "./hooks/useFetch";
import { FormField } from "./ui/form/FormField";
import { Select, SelectOption } from "./ui/form/Select";
import { Button } from "./ui/form/Button";
import { Alert } from "./ui/feedback/Alert";

interface AvailabilityFormProps {
  userId?: string;
  onSubmitSuccess?: () => void;
}

export default function AvailabilityForm({ userId, onSubmitSuccess }: AvailabilityFormProps) {
  const [formData, setFormData] = useState({
    day_of_week: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      setIsSubmitting(true);

      // Post availability data
      await postData('/api/availabilities', {
        ...formData,
        user_id: userId,
      });

      toast.success("Availability saved successfully");
      
      // Reset form
      setFormData({
        day_of_week: "",
        start_time: "",
        end_time: "",
        notes: "",
      });

      // Call success callback
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err: { message?: string }) {
      setError(err.message || "Failed to save availability");
      toast.error(err.message || "Failed to save availability");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dayOptions: SelectOption[] = [
    { value: "", label: "Select a day", disabled: true },
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  return (
    <div>
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
            placeholder="Select a day"
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

        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="w-full"
        >
          Save Availability
        </Button>
      </form>
    </div>
  );
}
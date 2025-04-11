"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { useFetch } from "./hooks/useFetch";
import AvailabilityForm from "./AvailabilityForm";
import AvailabilityList from "./AvailabilityList";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/layout/Card";
import { Button } from "./ui/form/Button";
import { Alert } from "./ui/feedback/Alert";
import { Spinner } from "./ui/feedback/Spinner";

export default function AvailabilityPageClient() {
  const { requireAuth, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user's availability
  const { data, error, mutate } = useFetch<{ availabilities: any[] }>(
    user?.id ? `/api/availabilities?userId=${user.id}` : null
  );
  
  useEffect(() => {
    // Require authentication
    requireAuth();
    
    // Set loading state based on data/error
    if (data || error) {
      setIsLoading(false);
    }
  }, [requireAuth, data, error]);

  const handleFormSubmit = async () => {
    // After form submission, refresh the data and hide form
    await mutate();
    setShowForm(false);
  };
  
  const handleDelete = async () => {
    // Refresh the data after deletion
    await mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" label="Loading your availability..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>My Availability</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-6">
              Failed to load your availability. Please try again.
            </Alert>
          )}
          
          {!showForm ? (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button onClick={() => setShowForm(true)}>
                  Add New Availability
                </Button>
              </div>
              
              {data?.availabilities && data.availabilities.length > 0 ? (
                <AvailabilityList 
                  availabilities={data.availabilities}
                  onDelete={handleDelete}
                />
              ) : (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <p className="text-gray-500 dark:text-gray-400">
                    You haven't set up any availability yet.
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Add your availability so GMs can schedule sessions when you can attend.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Back to List
                </Button>
              </div>
              
              <AvailabilityForm 
                userId={user?.id}
                onSubmitSuccess={handleFormSubmit}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
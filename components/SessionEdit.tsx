"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import { useFetch, updateData, deleteData } from "./hooks/useFetch";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/layout/Card";
import { FormField } from "./ui/form/FormField";
import { Input } from "./ui/form/Input";
import { Button } from "./ui/form/Button";
import { DateTimePicker } from "./ui/form/DateTimePicker";
import { Spinner } from "./ui/feedback/Spinner";
import { Alert } from "./ui/feedback/Alert";

interface Session {
  id: string;
  title: string;
  date: string;
  duration?: number;
  description?: string;
  location?: string;
  gm_id: string;
  created_at: string;
}

interface SessionResponse {
  session: Session;
}

interface SessionEditProps {
  sessionId: string;
}

export default function SessionEdit({ sessionId }: SessionEditProps) {
  const router = useRouter();
  const { isGM, isAdmin, user, requireAuth } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    duration: 180, // Default duration 3 hours in minutes
    description: "",
    location: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Fetch session data using our custom hook
  const { 
    data, 
    error: fetchError, 
    isLoading 
  } = useFetch<SessionResponse>(
    isGM || isAdmin ? `/api/sessions/${sessionId}` : null
  );
  
  // Ensure the user is authorized to edit this session
  useEffect(() => {
    const hasAccess = requireAuth(['gm', 'admin']);
    if (!hasAccess) return;

    // Redirect if user doesn't have permission
    if (data?.session && !isAdmin) {
      const isOwner = data.session.gm_id === user?.id;
      if (!isOwner) {
        toast.error("You don't have permission to edit this session");
        router.push("/");
      }
    }
  }, [data, isAdmin, requireAuth, router, user]);
  
  // Populate form with session data when available
  useEffect(() => {
    if (data?.session) {
      // Convert date string to datetime-local format
      const dateObj = new Date(data.session.date);
      const formattedDate = dateObj.toISOString().slice(0, 16);
      
      setFormData({
        title: data.session.title,
        date: formattedDate,
        duration: data.session.duration || 180,
        description: data.session.description || "",
        location: data.session.location || ""
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      if (!formData.title || !formData.date) {
        throw new Error("Title and date are required");
      }
      
      await updateData(`/api/sessions/${sessionId}`, formData);
      
      toast.success("Session updated successfully");
      router.push("/");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update session";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      await deleteData(`/api/sessions/${sessionId}`);
      
      toast.success("Session deleted successfully");
      router.push("/");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete session";
      setError(errorMsg);
      toast.error(errorMsg);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Spinner size="lg" label="Loading session..." />
        </CardContent>
      </Card>
    );
  }

  if (fetchError) {
    return (
      <Alert variant="error" className="max-w-xl mx-auto">
        Failed to load session. Please try again later.
      </Alert>
    );
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Session</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert 
            variant="error" 
            className="mb-4"
            onClose={() => setError(null)}
          >
            {error}
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
              placeholder="Session Title"
              required
            />
          </FormField>
          
          <FormField 
            label="Session Date & Time" 
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
              value={formData.duration.toString()}
              onChange={handleChange}
              min="30"
              max="720"
            />
          </FormField>
          
          <FormField 
            label="Description" 
            htmlFor="description"
          >
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Session details..."
            />
          </FormField>
          
          <FormField 
            label="Location" 
            htmlFor="location"
          >
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Physical location or virtual meeting link"
            />
          </FormField>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between pt-4">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => setShowConfirmDelete(true)}
              disabled={isSubmitting || isDeleting}
            >
              Delete Session
            </Button>
            
            <Button 
              type="submit" 
              isLoading={isSubmitting}
              disabled={isSubmitting || isDeleting}
            >
              Save Changes
            </Button>
          </div>
        </form>
        
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Confirm Delete</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Are you sure you want to delete this session? This action cannot be undone.</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  isLoading={isDeleting}
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
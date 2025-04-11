"use client";

import { useState, useEffect } from 'react';
import { Calendar as ReactBigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useFetch } from './hooks/useFetch';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/useAuth';
import { Card } from './ui/layout/Card';
import { Spinner } from './ui/feedback/Spinner';
import { Alert } from './ui/feedback/Alert';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar-overrides.css';

// Define the event type for our calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: SessionResource;
}

// Define the session resource type
interface SessionResource {
  id: string;
  title: string;
  date: string;
  duration?: number;
  [key: string]: unknown;
}

// Set up the localizer for the calendar
const locales = { 'en-US': enUS };
const BigCalendar = ReactBigCalendar;
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Loading placeholder
function CalendarSkeleton() {
  return (
    <Card className="p-4 h-[600px] border border-gray-200 dark:border-gray-700">
      <div className="h-full w-full flex items-center justify-center">
        <Spinner size="xl" label="Loading calendar..." />
      </div>
    </Card>
  );
}

interface CalendarProps {
  userId?: string;
  isGM?: boolean;
  isAdmin?: boolean;
}

export function Calendar({ userId, isGM, isAdmin }: CalendarProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the current date range for optimal data fetching
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 2, 0); // End of next month
    return { start, end };
  });
  
  // Create a query parameter for date range filtering
  const dateRangeParam = isAuthenticated ? 
    `?start_date=${dateRange.start.toISOString()}&end_date=${dateRange.end.toISOString()}` : 
    '';
  
  // Add user-specific filtering if applicable
  const userParam = userId && !isGM && !isAdmin ? `&user_id=${userId}` : '';
  
  // Fetch sessions using our custom hook with optimized parameters
  const { data, error: fetchError } = useFetch<{ sessions: SessionResource[] }>(
    isAuthenticated ? `/api/sessions${dateRangeParam}${userParam}` : null
  );
  
  // Handle view change to fetch data for new date ranges
  const handleRangeChange = (range: Date[] | { start: Date; end: Date }) => {
    // If range is an array, it's a list of dates (day/week view)
    // If it's an object, it's a date range (month view)
    let start, end;
    
    if (Array.isArray(range)) {
      start = range[0];
      end = range[range.length - 1];
    } else {
      start = range.start;
      end = range.end;
    }
    
    // Add buffer days to ensure we fetch slightly more than visible
    start = new Date(start);
    start.setDate(start.getDate() - 7);
    
    end = new Date(end);
    end.setDate(end.getDate() + 7);
    
    // Update date range state which will trigger a re-fetch
    setDateRange({ start, end });
  };

  useEffect(() => {
    if (fetchError) {
      setError('Failed to load sessions');
      setIsLoading(false);
      return;
    }

    if (data?.sessions) {
      // Convert sessions to calendar events
      const calendarEvents = data.sessions.map((session: SessionResource) => {
        // Use session.date instead of session.session_date for consistency
        const start = new Date(session.date);
        // Use session duration if available, default to 3 hours otherwise
        const end = session.duration 
          ? new Date(new Date(session.date).getTime() + session.duration * 60000)
          : addMinutes(new Date(session.date), 180);
          
        return {
          id: session.id,
          title: session.title,
          start,
          end,
          allDay: false,
          resource: session
        };
      });
      
      setEvents(calendarEvents);
      setIsLoading(false);
    }
  }, [data, fetchError]);
  
  const handleSelectEvent = (event: CalendarEvent) => {
    // Redirect to session detail/edit page depending on user role
    if (isGM || isAdmin) {
      router.push(`/gm/edit/${event.id}`);
    } else {
      // For regular users just view the event
      // You could implement a view-only session page
      router.push(`/sessions/${event.id}`);
    }
  };

  if (isLoading) return <CalendarSkeleton />;
  
  if (error) {
    return (
      <Alert variant="error" className="my-4">
        {error}
      </Alert>
    );
  }

  return (
    <div className="h-[600px] border rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%', padding: '1rem' }}
        onSelectEvent={handleSelectEvent}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        popup
        selectable={isGM || isAdmin}
        onNavigate={(date, view) => {
          // When user changes the viewed month/week/day, update the date range
          const start = new Date(date);
          const end = new Date(date);
          
          if (view === 'month') {
            start.setDate(1);
            end.setMonth(end.getMonth() + 1, 0);
          } else if (view === 'week') {
            const day = start.getDay();
            start.setDate(start.getDate() - day);
            end.setDate(start.getDate() + 6);
          }
          
          handleRangeChange({ start, end });
        }}
        onView={(view) => {
          // When view type changes (month/week/day), adjust the date range
          const currentDate = events.length > 0 ? events[0].start : new Date();
          const start = new Date(currentDate);
          const end = new Date(currentDate);
          
          if (view === 'month') {
            start.setDate(1);
            end.setMonth(end.getMonth() + 1, 0);
          } else if (view === 'week') {
            const day = start.getDay();
            start.setDate(start.getDate() - day);
            end.setDate(start.getDate() + 6);
          } else if (view === 'day') {
            // Just use the single day
          } else if (view === 'agenda') {
            // For agenda view, get a broader range
            start.setDate(start.getDate() - 30);
            end.setDate(end.getDate() + 60);
          }
          
          handleRangeChange({ start, end });
        }}
        onSelectSlot={(slotInfo) => {
          if (isGM || isAdmin) {
            // Navigate to the create session form with the selected date prefilled
            const startDate = format(slotInfo.start, "yyyy-MM-dd'T'HH:mm");
            router.push(`/gm/schedule?date=${startDate}`);
          }
        }}
      />
    </div>
  );
}

export default Calendar;
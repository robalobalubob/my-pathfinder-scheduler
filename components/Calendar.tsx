"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar-overrides.css";
import { useTheme } from "./ui/ThemeProvider";

const BigCalendar = dynamic(
  async () => {
    const mod = await import("react-big-calendar");
    return mod.Calendar;
  },
  { ssr: false, loading: () => <p>Loading calendar...</p> }
);

import { momentLocalizer, View } from "react-big-calendar";
const localizer = momentLocalizer(moment);

interface Event {
  title: string;
  start: Date;
  end: Date;
  description?: string;
}

interface CalendarProps {
  events: Event[];
}

const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("month");
  const { theme } = useTheme();
  
  // Custom event styling with theme awareness
  const eventPropGetter = (
    event: object,
    start: Date,
    end: Date,
    isSelected: boolean
  ) => {
    return {
      style: {
        backgroundColor: 'var(--primary)',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0',
        display: 'block',
        fontWeight: 'bold'
      }
    };
  };
  
  // Format the event title
  const formats = {
    eventTimeRangeFormat: () => '', // Hide the time range in month view
  };
  
  return (
    <div className="p-6 bg-background text-foreground rounded-lg shadow-md">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor={(event) => (event as Event).start}
        endAccessor={(event) => (event as Event).end}
        style={{ height: "500px" }}
        className="text-foreground"
        views={["month", "week", "day", "agenda"]}
        view={currentView}
        date={currentDate}
        onNavigate={(newDate) => setCurrentDate(newDate)}
        onView={(newView) => setCurrentView(newView)}
        eventPropGetter={eventPropGetter}
        formats={formats}
        popup
        tooltipAccessor={(event: any) => {
          const typedEvent = event as Event;
          return `${typedEvent.title}\n${moment(typedEvent.start).format('LT')} - ${moment(typedEvent.end).format('LT')}`;
        }}
        aria-label="Calendar showing Pathfinder sessions"
      />
    </div>
  );
};

export default Calendar;
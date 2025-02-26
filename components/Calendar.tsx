"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar-overrides.css";

// Dynamically import BigCalendar with SSR disabled.
const BigCalendar = dynamic(
  async () => {
    const mod = await import("react-big-calendar");
    return mod.Calendar;
  },
  { ssr: false, loading: () => <p>Loading...</p> }
);

import { momentLocalizer, View } from "react-big-calendar";
const localizer = momentLocalizer(moment);

interface Event {
  title: string;
  start: Date;
  end: Date;
}

interface CalendarProps {
  events: Event[];
}

const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("month");
  return (
    <div className="p-6 bg-background text-foreground rounded-lg shadow-md">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor={(event: any) => event.start}
        endAccessor={(event: any) => event.end}
        style={{ height: "500px" }}
        className="text-foreground"
        views={["month", "week", "day", "agenda"]}
        view={currentView}
        date={currentDate}
        onNavigate={(newDate) => setCurrentDate(newDate)}
        onView={(newView) => setCurrentView(newView)}
      />
    </div>
  );
};

export default Calendar;
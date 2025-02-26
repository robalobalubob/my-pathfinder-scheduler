"use client";
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
  { ssr: false }
);

const { momentLocalizer } = require("react-big-calendar");
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
  return (
    <div className="p-6 bg-background text-foreground rounded-lg shadow-md">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor={(event: any) => (event as Event).start}
        endAccessor={(event: any) => (event as Event).end}
        style={{ height: "500px" }}
        className="text-foreground"
      />
    </div>
  );
};

export default Calendar;

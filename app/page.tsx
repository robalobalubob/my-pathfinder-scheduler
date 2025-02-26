import Calendar from "../components/Calendar";

export const metadata = {
  title: 'Pathfinder Session Scheduler',
};

export default function Home() {
  // You can fetch scheduled sessions here to pass as events.
  const events = [
    {
      title: "Pathfinder Session",
      start: new Date("2025-02-28T18:00:00"),
      end: new Date("2025-02-28T21:00:00")
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Pathfinder Session Scheduler</h1>
      <Calendar events={events} />
    </div>
  );
}
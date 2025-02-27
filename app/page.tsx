import Calendar from "../components/Calendar";

export const metadata = {
  title: "Pathfinder Session Scheduler",
};

export default async function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL("/api/sessions", siteUrl).toString();

  const res = await fetch(url, {
    cache: "no-store",
  });
  const { sessions, error } = await res.json();

  if (error) {
    console.error("Error fetching sessions:", error);
  }

  const events =
    sessions?.map((session: any) => ({
      title: session.title,
      start: new Date(session.session_date),
      end: new Date(new Date(session.session_date).getTime() + 3 * 60 * 60 * 1000),
    })) || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Pathfinder Session Scheduler</h1>
      <Calendar events={events} />
    </div>
  );
}

import Calendar from "../components/Calendar";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const metadata = {
  title: 'Pathfinder Session Scheduler',
};

export default async function Home() {
  // Create a Supabase client on the server using cookies for context
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // Fetch sessions from the database
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .order('session_date', { ascending: true });

  if (error) {
    console.error("Error fetching sessions:", error);
  }

  // Map each session to an event
  const events = sessions?.map((session: any) => ({
    title: session.title,
    start: new Date(session.session_date),
    end: new Date(new Date(session.session_date).getTime() + 3 * 60 * 60 * 1000)
  })) || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Pathfinder Session Scheduler</h1>
      <Calendar events={events} />
    </div>
  );
}
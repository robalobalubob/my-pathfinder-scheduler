"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface SessionItem {
  id: number;
  title: string;
  session_date: string;
  created_at: string;
}

export default function SessionEdit() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [title, setTitle] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user || (session.user.role !== "gm" && session.user.role !== "admin")) {
      router.push("/");
      return;
    }
    async function fetchSessions() {
      try{
        const res = await fetch("/api/sessions", { cache: "no-store" });
        const data = await res.json();
        const sessionItem = data.sessions.find((item: SessionItem) => item.id.toString() === id);
        if (!sessionItem) {
          alert("Session not found or you are not authorized to edit it.");
          router.push("/gm/schedule");
          return;
        }
        setTitle(sessionItem.title);
        const dt = new Date(sessionItem.session_date);
        const localDatetime = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setSessionDate(localDatetime);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching session:", error);
        alert("Error fetching session details.");
        router.push("/gm/schedule");
      }
    }
    fetchSessions();
  }, [id, session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !sessionDate) {
      alert("Please fill out all fields.");
      return;
    }
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, session_date: new Date(sessionDate).toISOString() }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert("Failed to update session: " + (result.message || "Unknown error"));
      } else {
        alert("Session updated successfully!");
        router.push("/gm/schedule");
      }
    } catch (error) {
      console.error("Error updating session:", error);
      alert("Failed to update session.");
    }
  };

  if (loading) return <p>Loading session details...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Session</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-background text-foreground rounded-lg shadow-md space-y-4">
        <div>
          <label className="block mb-1">Session Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-foreground placeholder-gray-400"
          />
        </div>
        <div>
          <label className="block mb-1">Session Date &amp; Time:</label>
          <input
            type="datetime-local"
            value={sessionDate}
            onChange={(e) => {setSessionDate(e.target.value);}}
            required
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-foreground"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
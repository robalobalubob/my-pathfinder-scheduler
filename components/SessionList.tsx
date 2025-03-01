"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SessionItem {
  id: number;
  title: string;
  session_date: string;
  created_at: string;
}

export default function SessionList() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      const res = await fetch("/api/sessions", { cache: "no-store" });
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
      setLoading(false);
    }
    fetchSessions();
  }, []);

  const deleteSession = async (id: number) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (result.error) {
      alert("Error deleting session: " + result.message);
    } else {
      alert("Session deleted successfully");
      setSessions((prev) => prev.filter((session) => session.id !== id));
    }
  };

  const editSession = (id: number) => {
    router.push(`/gm/edit/${id}`);
  };

  if (loading) return <p>Loading sessions...</p>;

  return (
    <div>
      {sessions.length === 0 ? (
        <p>No sessions scheduled yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="border p-2 text-left">Title</th>
                <th className="border p-2 text-left">Session Date</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-b">
                  <td className="border p-2">{session.title}</td>
                  <td className="border p-2">
                    {new Date(session.session_date).toLocaleString()}
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => editSession(session.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
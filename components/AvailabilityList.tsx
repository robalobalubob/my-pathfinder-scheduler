"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Availability {
  id: number;
  name: string;
  selected_days: string[];
  time_option: string;
  start_time: string;
  end_time: string;
  repeat_option: string;
  repeat_weeks: number | null;
  created_at: string;
}

export default function AvailabilityList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user) {
      router.push("/");
      return;
    }
    async function fetchAvailabilities() {
      const res = await fetch("/api/availabilities?user=true", { cache: "no-store" });
      const data = await res.json();
      setAvailabilities(data.availabilities || []);
      setLoading(false);
    }
    fetchAvailabilities();
  }, [session, status, router]);

  const deleteAvailability = async (id: number) => {
    if (!confirm("Are you sure you want to delete this availability?")) return;
    const res = await fetch(`/api/availabilities/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (result.error) {
      alert("Error deleting availability: " + result.message);
    } else {
      alert("Availability deleted successfully");
      setAvailabilities(prev => prev.filter(avail => avail.id !== id));
    }
  };

  const editAvailability = (id: number) => {
    router.push(`/availability/edit/${id}`);
  };

  if (loading) return <p>Loading availabilities...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Availabilities</h2>
      {availabilities.length === 0 ? (
        <p>You haven&apos;t submitted any availabilities yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Days</th>
                <th className="border p-2 text-left">Time</th>
                <th className="border p-2 text-left">Repeat</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {availabilities.map((avail) => (
                <tr key={avail.id} className="border-b">
                  <td className="border p-2">{avail.name}</td>
                  <td className="border p-2">{avail.selected_days.join(", ")}</td>
                  <td className="border p-2">
                    {avail.time_option === "allDay"
                      ? "All Day"
                      : `${avail.start_time} to ${avail.end_time}`}
                  </td>
                  <td className="border p-2">
                    {avail.repeat_option}
                    {avail.repeat_option === "weeks" && avail.repeat_weeks
                      ? ` (${avail.repeat_weeks} weeks)`
                      : ""}
                  </td>
                  <td className="border p-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => editAvailability(avail.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAvailability(avail.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
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
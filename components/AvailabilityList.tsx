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
        <p>You haven't submitted any availabilities yet.</p>
      ) : (
        <ul className="space-y-4">
          {availabilities.map(avail => (
            <li key={avail.id} className="border p-4 rounded">
              <p><strong>Name:</strong> {avail.name}</p>
              <p><strong>Days:</strong> {avail.selected_days.join(", ")}</p>
              <p>
                <strong>Time:</strong>{" "}
                {avail.time_option === "allDay"
                  ? "All Day"
                  : `${avail.start_time} to ${avail.end_time}`}
              </p>
              <p>
                <strong>Repeat:</strong> {avail.repeat_option}{" "}
                {avail.repeat_option === "weeks" && avail.repeat_weeks ? `(${avail.repeat_weeks} weeks)` : ""}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => editAvailability(avail.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteAvailability(avail.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
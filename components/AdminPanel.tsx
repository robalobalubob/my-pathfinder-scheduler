"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  role: string;
}

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/");
      return;
    }
    async function fetchUsers() {
      const res = await fetch("/api/users?excludeRole=admin", { cache: "no-store" });
      const data = await res.json();
      setUsers(data.users || []);
      setLoading(false);
    }
    fetchUsers();
  }, [session, status, router]);

  const updateUserRole = async (id: string, newRole: string) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newRole }),
    });
    const result = await res.json();
    if (result.error) {
      alert("Error updating role");
    } else {
      alert("Role updated successfully");
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, role: newRole } : user))
      );
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const res = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (result.error) {
      alert("Error deleting user");
    } else {
      alert("User deleted successfully");
      setUsers((prev) => prev.filter((user) => user.id !== id));
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Admin Panel: Manage User Roles</h2>
      {users.length === 0 ? (
        <p>No new accounts to manage.</p>
      ) : (
        <ul className="space-y-4">
          {users.map((user) => (
            <li key={user.id} className="border p-4 rounded">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Current Role:</strong> {user.role}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateUserRole(user.id, "player")}
                  className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={user.role === "player"}
                >
                  Make Player
                </button>
                <button
                  onClick={() => updateUserRole(user.id, "gm")}
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={user.role === "gm"}
                >
                  Make GM
                </button>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
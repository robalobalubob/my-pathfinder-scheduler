"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      toast.error("You don't have permission to view this page");
      router.push("/");
      return;
    }
    
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await fetch("/api/users?excludeRole=admin", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, [session, status, router]);

  const updateUserRole = async (id: string, newRole: string) => {
    if (actionInProgress) return;
    
    try {
      setActionInProgress(id);
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newRole }),
      });
      
      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.message || "Failed to update role");
      }
      
      toast.success(`Role updated to ${newRole} successfully`);
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, role: newRole } : user))
      );
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(`Error updating role: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const deleteUser = async (id: string, email: string) => {
    if (actionInProgress) return;
    
    if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setActionInProgress(id);
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      
      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.message || "Failed to delete user");
      }
      
      toast.success("User deleted successfully");
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(`Error deleting user: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) return <p className="text-center py-8">Loading users...</p>;

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold mb-4">Admin Panel: Manage User Roles</h2>
      
      {users.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-lg">No users to manage</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {users.map((user) => (
            <div 
              key={user.id} 
              className="border p-4 rounded-lg shadow-sm bg-background hover:shadow-md transition-shadow"
            >
              <p className="mb-1">
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p className="mb-3">
                <span className="font-semibold">Current Role:</span>{" "}
                <span className={`px-2 py-0.5 rounded text-sm ${
                  user.role === "player" 
                    ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" 
                    : user.role === "gm" 
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}>
                  {user.role}
                </span>
              </p>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => updateUserRole(user.id, "player")}
                  className="px-3 py-1.5 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={user.role === "player" || actionInProgress === user.id}
                >
                  Make Player
                </button>
                <button
                  onClick={() => updateUserRole(user.id, "gm")}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={user.role === "gm" || actionInProgress === user.id}
                >
                  Make GM
                </button>
                <button
                  onClick={() => deleteUser(user.id, user.email)}
                  className="px-3 py-1.5 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionInProgress === user.id}
                >
                  Delete User
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
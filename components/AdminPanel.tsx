"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import { useFetch, updateData, deleteData } from "./hooks/useFetch";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/layout/Card";
import { Button } from "./ui/form/Button";
import { Input } from "./ui/form/Input";
import { Select, SelectOption } from "./ui/form/Select";
import { Alert } from "./ui/feedback/Alert";
import { Spinner } from "./ui/feedback/Spinner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface UsersResponse {
  users: User[];
}

export default function AdminPanel() {
  const router = useRouter();
  const { requireAuth, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "sessions">("users");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Get users data
  const { 
    data, 
    error, 
    isLoading: isFetching, 
    mutate 
  } = useFetch<UsersResponse>(
    isAdmin ? '/api/users' : null
  );
  
  useEffect(() => {
    // Require admin authentication
    const hasAccess = requireAuth(['admin']);
    if (!hasAccess) return;
    
    // Set loading state based on data/error
    if (data || error || !isAdmin) {
      setIsLoading(false);
    }
  }, [requireAuth, data, error, isAdmin]);

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (actionInProgress) return;
    
    try {
      setActionInProgress(userId);
      
      await updateData(`/api/users/${userId}`, { role: newRole });
      
      toast.success("User role updated successfully");
      mutate(); // Refresh data
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Failed to update user role";
      toast.error(errorMsg);
    } finally {
      setActionInProgress(null);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (actionInProgress || !window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    
    try {
      setActionInProgress(userId);
      
      await deleteData(`/api/users/${userId}`);
      
      toast.success("User deleted successfully");
      mutate(); // Refresh data
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Failed to delete user";
      toast.error(errorMsg);
    } finally {
      setActionInProgress(null);
    }
  };

  // Filter users based on search query
  const filteredUsers = data?.users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });
  
  const roleOptions: SelectOption[] = [
    { value: "new", label: "New User" },
    { value: "player", label: "Player" },
    { value: "gm", label: "Game Master" },
    { value: "admin", label: "Admin" },
  ];

  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" label="Loading admin panel..." />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Alert variant="error">
        You do not have permission to access the admin panel.
      </Alert>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle>Admin Panel</CardTitle>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className={activeTab === "users" ? "bg-gray-100 dark:bg-gray-800" : ""}
              onClick={() => setActiveTab("users")}
            >
              Manage Users
            </Button>
            <Button 
              variant="outline"
              className={activeTab === "sessions" ? "bg-gray-100 dark:bg-gray-800" : ""}
              onClick={() => setActiveTab("sessions")}
            >
              Manage Sessions
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-6">
              Failed to load data. Please try again.
            </Alert>
          )}

          {activeTab === "users" && (
            <div>
              <div className="mb-6">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                    </svg>
                  }
                />
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredUsers?.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingUser?.id === user.id ? (
                            <Select
                              options={roleOptions}
                              value={editingUser.role}
                              onChange={(e) => {
                                setEditingUser({
                                  ...editingUser,
                                  role: e.target.value
                                });
                              }}
                            />
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {editingUser?.id === user.id ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                                disabled={actionInProgress === user.id}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                isLoading={actionInProgress === user.id}
                                disabled={actionInProgress !== null}
                                onClick={() => handleUpdateUserRole(user.id, editingUser.role)}
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingUser({ ...user })}
                                disabled={actionInProgress !== null}
                              >
                                Edit Role
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                isLoading={actionInProgress === user.id}
                                disabled={actionInProgress !== null}
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    
                    {filteredUsers && filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          No users found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Session Management</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                As an admin, you can view and manage all sessions from the calendar.
              </p>
              <Button onClick={() => router.push("/")}>
                Go to Calendar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
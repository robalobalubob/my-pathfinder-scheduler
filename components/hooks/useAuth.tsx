"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type UserRole = "new" | "player" | "gm" | "admin";

// Define User interface
interface User {
  id: string;
  name?: string;
  email?: string;
  role?: UserRole;
  image?: string;
  [key: string]: unknown;
}

// Define login credentials interface
interface LoginCredentials {
  email: string;
  password: string;
  callbackUrl?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  roles: UserRole[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGM: boolean;
  isPlayer: boolean;
  requireAuth: (requiredRoles?: UserRole[]) => boolean;
  logout: () => Promise<void>;
  login: (credentials?: LoginCredentials) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  roles: [],
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isGM: false,
  isPlayer: false,
  requireAuth: () => false,
  logout: async () => {},
  login: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [roles, setRoles] = useState<UserRole[]>([]);
  
  useEffect(() => {
    if (session?.user) {
      const userRole = session.user.role as UserRole;
      // Set roles array based on role hierarchy
      const userRoles: UserRole[] = ["new"]; // All users at least have "new" role
      
      if (userRole === "player" || userRole === "gm" || userRole === "admin") {
        userRoles.push("player");
      }
      
      if (userRole === "gm" || userRole === "admin") {
        userRoles.push("gm");
      }
      
      if (userRole === "admin") {
        userRoles.push("admin");
      }
      
      setRoles(userRoles);
    } else {
      setRoles([]);
    }
  }, [session]);
  
  const requireAuth = (requiredRoles: UserRole[] = ["player"]) => {
    if (status === "loading") return false;
    
    if (!session) {
      signIn();
      return false;
    }
    
    const userHasRequiredRole = requiredRoles.some(role => roles.includes(role));
    
    if (!userHasRequiredRole) {
      router.push("/");
      return false;
    }
    
    return true;
  };
  
  const logout = async () => {
    await signOut({ callbackUrl: "/" });
  };
  
  const login = async (credentials?: LoginCredentials) => {
    await signIn(undefined, credentials ? { ...credentials } : undefined);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user: session?.user as User || null,
        roles,
        isLoading: status === "loading",
        isAuthenticated: !!session,
        isAdmin: roles.includes("admin"),
        isGM: roles.includes("gm"),
        isPlayer: roles.includes("player"),
        requireAuth,
        logout,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
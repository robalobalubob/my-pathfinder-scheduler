"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./ui/ThemeProvider";
import { ToastProvider } from "./ui/ToastProvider";
import ErrorBoundary from "./ui/ErrorBoundary";

interface ClientProviderProps {
  children: ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  return (
    <ErrorBoundary fallback={<div className="p-4 text-red-600">Something went wrong. Please refresh the page.</div>}>
      <SessionProvider>
        <ThemeProvider defaultTheme="system" storageKey="pathfinder-theme">
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "./ThemeProvider";

interface ToastProviderProps {
  children?: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { theme } = useTheme();
  
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Default options for specific types of toasts
          success: {
            duration: 3000,
            style: {
              background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: theme === 'dark' ? '#FFFFFF' : '#000000',
              border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: theme === 'dark' ? '#FFFFFF' : '#000000',
              border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB',
            },
          },
          loading: {
            duration: Infinity,
            style: {
              background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: theme === 'dark' ? '#FFFFFF' : '#000000',
              border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB',
            },
          },
          // Default toast styling
          style: {
            background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
            color: theme === 'dark' ? '#FFFFFF' : '#000000',
            border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB',
          },
        }}
      />
      {children}
    </>
  );
}
"use client";
import { Toaster } from 'react-hot-toast';
import { useTheme } from './ThemeProvider';

export function ToastProvider() {
  const { theme } = useTheme();
  
  // Determine if currently in dark mode
  const isDarkMode = 
    theme === 'dark' || 
    (theme === 'system' && 
      typeof window !== 'undefined' && 
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 3000,
        className: 'toast',
        style: {
          background: isDarkMode ? 'var(--secondary)' : 'var(--background)',
          color: isDarkMode ? 'var(--foreground)' : 'var(--foreground)',
          border: '1px solid',
          borderColor: isDarkMode ? '#333' : '#ddd',
          fontSize: '0.875rem',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: 'white',
          },
        },
      }}
    />
  );
}
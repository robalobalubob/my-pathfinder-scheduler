"use client";
import { ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
      <h2 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-2">Something went wrong</h2>
      <p className="text-red-600 dark:text-red-400 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset any app state that might have caused the error
        try {
          // Clear any pending network requests
          const controller = new AbortController();
          controller.abort();
          
          // Reset form-related states in sessionStorage if they exist
          sessionStorage.removeItem('form-data');
          sessionStorage.removeItem('filter-state');
          
          // Clear any application-specific cache
          if (typeof window !== 'undefined') {
            // Reset any localStorage items that might be causing issues
            localStorage.removeItem('user-preferences');
            localStorage.removeItem('cached-availability');
            
            // Clear any query params that might be affecting the UI
            const url = new URL(window.location.href);
            if (url.search) {
              window.history.replaceState({}, '', url.pathname);
            }
          }
          
        } catch (err) {
          console.error("Error while resetting app state:", err);
        }
        
        // As a fallback, reload the page
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
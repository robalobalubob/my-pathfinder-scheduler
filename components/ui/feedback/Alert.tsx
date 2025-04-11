"use client";

import { ReactNode } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  className?: string;
  onClose?: () => void;
}

export function Alert({ 
  children, 
  variant = "info", 
  className = "", 
  onClose 
}: AlertProps) {
  // Define styling for each variant
  const variantStyles = {
    info: "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300 border-blue-300 dark:border-blue-800",
    success: "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300 border-green-300 dark:border-green-800",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800",
    error: "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300 border-red-300 dark:border-red-800",
  };

  // Define icons for each variant
  const VariantIcon = () => {
    switch (variant) {
      case "info":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
        );
      case "success":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>
        );
      case "warning":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
        );
      case "error":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center p-4 mb-4 rounded-lg border ${variantStyles[variant]} ${className}`} role="alert">
      <div className="flex-shrink-0 mr-2">
        <VariantIcon />
      </div>
      <div className="text-sm font-medium flex-grow">
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex items-center justify-center h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Close"
          onClick={onClose}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </button>
      )}
    </div>
  );
}
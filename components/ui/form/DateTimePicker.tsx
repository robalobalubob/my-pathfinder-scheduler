"use client";

import React, { forwardRef } from "react";

interface DateTimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
}

export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
  ({ className = "", isError, ...props }, ref) => {
    const baseStyles = `
      flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:cursor-not-allowed disabled:opacity-50
    `;
    
    const inputStyles = `
      ${baseStyles}
      ${isError 
        ? "border-red-500 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20" 
        : "border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary/20"
      }
      ${className}
    `;
    
    return (
      <input
        ref={ref}
        type="datetime-local"
        className={inputStyles}
        {...props}
      />
    );
  }
);

DateTimePicker.displayName = "DateTimePicker";
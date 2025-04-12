"use client";

import { ReactNode } from "react";

interface FormFieldProps {
  children: ReactNode;
  label?: string;
  htmlFor?: string;
  error?: string;
  className?: string;
  required?: boolean;
  description?: string;
}

export function FormField({
  children,
  label,
  htmlFor,
  error,
  className = "",
  required,
  description,
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label 
          htmlFor={htmlFor} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
      
      <div className="mt-1">{children}</div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
"use client";

import React, { forwardRef } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'options'> {
  options: SelectOption[];
  placeholder?: string;
  isError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", options, placeholder, isError, ...props }, ref) => {
    const baseStyles = `
      flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm
      appearance-none bg-select-arrow bg-no-repeat bg-right
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:cursor-not-allowed disabled:opacity-50
    `;
    
    const selectStyles = `
      ${baseStyles}
      ${isError 
        ? "border-red-500 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20" 
        : "border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary/20"
      }
      ${className}
    `;
    
    return (
      <div className="relative">
        <select
          ref={ref}
          className={selectStyles}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom arrow icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
          <svg 
            className="h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
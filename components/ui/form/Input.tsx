"use client";

import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", leftIcon, rightIcon, isError, ...props }, ref) => {
    const baseStyles = `
      flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm
      file:border-0 file:bg-transparent file:text-sm file:font-medium
      placeholder:text-gray-400 dark:placeholder-text-gray-500
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:cursor-not-allowed disabled:opacity-50
    `;
    
    const inputStyles = `
      ${baseStyles}
      ${isError 
        ? "border-red-500 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20" 
        : "border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary/20"
      }
      ${leftIcon ? "pl-9" : ""}
      ${rightIcon ? "pr-9" : ""}
      ${className}
    `;
    
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={inputStyles}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
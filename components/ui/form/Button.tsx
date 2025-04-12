"use client";

import React from "react";
import { Spinner } from "../feedback/Spinner";

type ButtonVariant = "default" | "secondary" | "outline" | "destructive" | "link";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  className = "",
  variant = "default",
  size = "md",
  fullWidth = false,
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  // Define variant styles
  const variantStyles = {
    default: "bg-primary text-white hover:bg-primary/90 focus:ring-primary/20",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary/20",
    outline: "border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-200 dark:focus:ring-gray-700",
    destructive: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/20",
    link: "bg-transparent text-primary hover:underline focus:ring-primary/20 p-0 height-auto",
  };

  // Define size styles
  const sizeStyles = {
    sm: "text-xs px-2 py-1 h-8",
    md: "text-sm px-4 py-2 h-10",
    lg: "text-base px-6 py-3 h-12",
  };

  // Combine all classes
  const buttonClasses = `
    inline-flex items-center justify-center 
    font-medium rounded-md
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Spinner 
          size="sm" 
          className={`${loadingText || children ? "mr-2" : ""}`} 
        />
      )}
      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {isLoading && loadingText ? loadingText : children}
      {!isLoading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
}
"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Enhanced structured error logging
    console.error({
      message: "React component error caught by ErrorBoundary",
      componentStack: errorInfo.componentStack,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Here you could also send this error to an external logging service
    // if you have one configured
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}

// Export both named and default export for compatibility
export const ErrorBoundary = ErrorBoundaryClass;
export default ErrorBoundaryClass;
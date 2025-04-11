"use client";

import useSWR, { KeyedMutator } from 'swr';

// Define error interface
interface ApiError extends Error {
  status?: number;
  info?: unknown;
}

// Simple fetch utility with error handling
const fetcher = async (url: string) => {
  const res = await fetch(url);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.message || 'An error occurred while fetching the data.') as ApiError;
    error.status = res.status;
    error.info = errorData;
    throw error;
  }
  
  return res.json();
};

interface UseFetchResult<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: KeyedMutator<T>;
}

export function useFetch<T>(url: string | null): UseFetchResult<T> {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    url ? fetcher : null
  );
  
  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Utility functions for data operations
export async function postData<T, R = unknown>(url: string, data: T): Promise<R> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.message || 'Failed to post data.') as ApiError;
    error.status = res.status;
    error.info = errorData;
    throw error;
  }
  
  return res.json();
}

export async function updateData<T, R = unknown>(url: string, data: T): Promise<R> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.message || 'Failed to update data.') as ApiError;
    error.status = res.status;
    error.info = errorData;
    throw error;
  }
  
  return res.json();
}

export async function deleteData<R = unknown>(url: string): Promise<R> {
  const res = await fetch(url, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.message || 'Failed to delete data.') as ApiError;
    error.status = res.status;
    error.info = errorData;
    throw error;
  }
  
  return res.json();
}
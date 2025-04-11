"use client";

import { useState, useCallback } from "react";
import { z } from "zod";

interface UseFormProps<T> {
  initialValues: T;
  schema: z.ZodType<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  schema,
  onSubmit,
}: UseFormProps<T>) {
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
  });

  // Validate the entire form
  const validateForm = useCallback(() => {
    try {
      schema.parse(formState.values);
      setFormState((prev) => ({
        ...prev,
        errors: {},
        isValid: true,
      }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof T;
          if (path) {
            fieldErrors[path] = err.message;
          }
        });
        setFormState((prev) => ({
          ...prev,
          errors: fieldErrors,
          isValid: false,
        }));
      }
      return false;
    }
  }, [formState.values, schema]);

  // Validate a single field
  const validateField = useCallback(
    (name: keyof T, value: any) => {
      try {
        // Fix: Use a schema to validate a specific field
        // instead of using schema.shape which doesn't exist
        const fieldSchema = z.object({ [name as string]: schema } as any);
        fieldSchema.parse({ [name]: value });
        
        setFormState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [name]: undefined,
          },
        }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          setFormState((prev) => ({
            ...prev,
            errors: {
              ...prev.errors,
              [name]: error.errors[0]?.message || "Invalid value",
            },
          }));
        }
      }
    },
    [schema]
  );

  // Handle field change
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value, type } = e.target;
      const fieldValue = type === "checkbox" 
        ? (e.target as HTMLInputElement).checked 
        : value;

      setFormState((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          [name]: fieldValue,
        },
        touched: {
          ...prev.touched,
          [name]: true,
        },
      }));

      validateField(name as keyof T, fieldValue);
    },
    [validateField]
  );

  // Set field value programmatically
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setFormState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [name]: value,
      },
    }));
    validateField(name, value);
  }, [validateField]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      setFormState((prev) => ({
        ...prev,
        touched: Object.keys(prev.values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        ) as Partial<Record<keyof T, boolean>>,
      }));

      const isValid = validateForm();
      
      if (!isValid) return;

      setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
      }));

      try {
        await onSubmit(formState.values);
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setFormState((prev) => ({
          ...prev,
          isSubmitting: false,
        }));
      }
    },
    [formState.values, onSubmit, validateForm]
  );

  // Reset the form to initial state
  const resetForm = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: false,
    });
  }, [initialValues]);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
  };
}
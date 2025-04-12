"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/layout/Card";
import { FormField } from "./ui/form/FormField";
import { Input } from "./ui/form/Input";
import { Button } from "./ui/form/Button";
import { Alert } from "./ui/feedback/Alert";

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user changes its value
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      
      toast.success("Registration successful! Please sign in.");
      router.push("/api/auth/signin");
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Registration failed. Please try again.";
      setGeneralError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
      </CardHeader>
      <CardContent>
        {generalError && (
          <Alert 
            variant="error" 
            className="mb-4"
            onClose={() => setGeneralError(null)}
          >
            {generalError}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Name"
            htmlFor="name"
            error={errors.name}
            required
          >
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              isError={!!errors.name}
              autoComplete="name"
              disabled={isSubmitting}
            />
          </FormField>
          
          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email}
            required
          >
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              isError={!!errors.email}
              autoComplete="email"
              disabled={isSubmitting}
            />
          </FormField>
          
          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password}
            required
          >
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              isError={!!errors.password}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </FormField>
          
          <FormField
            label="Confirm Password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword}
            required
          >
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleChange}
              isError={!!errors.confirmPassword}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </FormField>
          
          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Register
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        Already have an account?{" "}
        <Link href="/api/auth/signin" className="ml-1 text-primary hover:underline">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
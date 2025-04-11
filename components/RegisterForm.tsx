"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

interface RegisterFormProps {
  title: string;
}

export default function RegisterForm({ title }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    // Reset previous error
    setErrorMsg("");
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address");
      return false;
    }
    
    // Password validation
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long");
      return false;
    }
    
    // Confirm password
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }
      
      toast.success("Registration successful! Please sign in.");
      router.push("/api/auth/signin");
      
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMsg(error instanceof Error ? error.message : "Registration failed");
      toast.error("Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">{title}</h1>
      
      {errorMsg && (
        <div className="alert alert-error mb-4">
          <p>{errorMsg}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="form-input"
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
        
        <div className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link href="/api/auth/signin" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
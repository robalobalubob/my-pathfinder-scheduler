"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./hooks/useAuth";
import { ThemeToggle } from "./ui/ThemeToggle";

export default function Header() {
  const { user, isAuthenticated, logout, isAdmin, isGM } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Navigation links based on role
  const navLinks = [
    { href: "/", label: "Home", show: true },
    { href: "/availability", label: "My Availability", show: isAuthenticated },
    { href: "/gm/schedule", label: "Schedule Session", show: isGM || isAdmin },
    { href: "/admin", label: "Admin Panel", show: isAdmin },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Pathfinder Scheduler</h1>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks
              .filter((link) => link.show)
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-foreground/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {/* User menu for desktop */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm font-medium">
                {user?.name || user?.email || "User"}
              </span>
              <button
                onClick={() => logout()}
                className="text-sm font-medium text-foreground/70 hover:text-primary"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/api/auth/signin"
              className="hidden md:inline-flex text-sm font-medium hover:text-primary"
            >
              Sign in
            </Link>
          )}
          
          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              // X icon
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t px-2 pb-4 pt-2">
          <div className="space-y-1">
            {navLinks
              .filter((link) => link.show)
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.href)
                      ? "bg-gray-100 dark:bg-gray-800 text-primary"
                      : "text-foreground/70 hover:bg-gray-50 dark:hover:bg-gray-900"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  Signed in as: {user?.name || user?.email || "User"}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-foreground/70 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/api/auth/signin"
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground/70 hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
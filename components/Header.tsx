"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ui/ThemeToggle";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="p-4 bg-blue-900 dark:bg-gray-900 text-white">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        {/* Logo and brand */}
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold mr-4">
            Pathfinder Scheduler
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded hover:bg-blue-800 dark:hover:bg-gray-800 focus:outline-none"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>

        {/* Navigation and auth buttons */}
        <nav className={`${menuOpen ? 'block' : 'hidden'} md:flex w-full md:w-auto mt-4 md:mt-0 items-center`}>
          <div className="flex flex-col md:flex-row md:mr-8 space-y-2 md:space-y-0 md:space-x-4">
            <Link 
              href="/" 
              className="px-2 py-1 hover:bg-blue-800 dark:hover:bg-gray-800 rounded transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            
            {session && (
              <>
                {session.user.role !== "new" && (
                  <Link 
                    href="/availability" 
                    className="px-2 py-1 hover:bg-blue-800 dark:hover:bg-gray-800 rounded transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Availability
                  </Link>
                )}
                
                {(session.user.role === "gm" || session.user.role === "admin") && (
                  <Link 
                    href="/gm/schedule" 
                    className="px-2 py-1 hover:bg-blue-800 dark:hover:bg-gray-800 rounded transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    GM Schedule
                  </Link>
                )}
                
                {session.user.role === "admin" && (
                  <Link 
                    href="/admin" 
                    className="px-2 py-1 hover:bg-blue-800 dark:hover:bg-gray-800 rounded transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center mt-4 md:mt-0 space-y-2 md:space-y-0 md:space-x-3">
            {/* Theme toggle in header */}
            <div className="md:mr-2 mt-2 md:mt-0">
              <ThemeToggle />
            </div>
            
            {session ? (
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
                <span className="px-2 py-1 text-sm text-gray-300">
                  {session.user.email || "User"}
                </span>
                <button
                  onClick={() => signOut()}
                  className="btn btn-secondary"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => signIn()}
                  className="btn btn-primary"
                >
                  Sign In
                </button>
                <Link
                  href="/register"
                  className="btn btn-primary text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
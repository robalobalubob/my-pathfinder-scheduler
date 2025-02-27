"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="p-4 bg-blue-900 dark:bg-gray-900 text-white flex justify-between items-center">
      <div>
        <Link href="/" className="mr-4">Home</Link>
        {session && (
          <>
            {session.user.role !== "new" && (
              <Link href="/availability" className="mr-4">Availability</Link>
            )}
            {(session.user.role === "gm" || session.user.role === "admin") && (
              <Link href="/gm/schedule" className="mr-4">GM Schedule</Link>
            )}
            {session.user.role === "admin" && (
              <Link href="/admin" className="mr-4">Administration</Link>
            )}
          </>
        )}
      </div>
      <div>
        {session ? (
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-gray-700 dark:bg-gray-800 rounded"
          >
            Sign Out
          </button>
        ) : (
          <>
            <button
              onClick={() => signIn()}
              className="px-4 py-2 bg-red-600 dark:bg-red-900 rounded mr-4"
            >
              Sign In
            </button>
            <Link
              href="/register"
              className="px-4 py-2 bg-red-600 dark:bg-red-900 rounded"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
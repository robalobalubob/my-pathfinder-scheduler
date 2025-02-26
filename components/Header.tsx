"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="p-4 bg-primary text-white flex justify-between items-center">
      <div>
        <Link href="/" className="mr-4">Home</Link>
        {session && (
          <>
            <Link href="/availability" className="mr-4">Availability</Link>
            {session?.user?.role === "gm" && (
                <Link href="/gm/schedule" className="mr-4">GM Schedule</Link>
            )}
          </>
        )}
      </div>
      <div>
        {session ? (
          <button onClick={() => signOut()} className="px-4 py-2 bg-secondary rounded">
            Sign Out
          </button>
        ) : (
          <button onClick={() => signIn()} className="px-4 py-2 bg-secondary rounded">
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}

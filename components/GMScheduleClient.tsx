"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GMScheduleClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user || session.user.role !== "gm") {
      router.push("/");
    }
  }, [session, status, router]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">GM Scheduling Page</h1>
      {/* Display all availabilities and scheduling form here */}
      <p>All players' availability goes here.</p>
    </div>
  );
}
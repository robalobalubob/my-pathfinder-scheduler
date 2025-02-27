import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  // Parse query parameters to filter by role
  const url = new URL(req.url);
  const role = url.searchParams.get("role");

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase.from("users").select("*").order("created_at", { ascending: false });
  if (role) {
    query = query.eq("role", role);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ message: "Error fetching users", error }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}
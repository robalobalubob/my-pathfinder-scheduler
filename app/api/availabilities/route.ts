import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '../../../utils/supabase/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userFilter = url.searchParams.get("user") === "true";
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  let query = supabase.from("availabilities").select("*").order("created_at", { ascending: false });
  
  if (userFilter) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    query = query.eq("user_id", session.user.id);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching availabilities:", error);
    return NextResponse.json({ message: "Error fetching availabilities", error }, { status: 500 });
  }
  return NextResponse.json({ availabilities: data });
}
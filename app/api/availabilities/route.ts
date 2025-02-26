import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "../../../utils/supabase/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("availabilities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching availabilities:", error);
    return NextResponse.json({ message: "Error fetching availabilities", error }, { status: 500 });
  }

  return NextResponse.json({ availabilities: data });
}
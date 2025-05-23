import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "../../../../utils/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { title, session_date } = body;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("sessions")
    .update({ title, session_date })
    .eq("id", id);

  if (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ message: "Error updating session", error }, { status: 500 });
  }

  return NextResponse.json({ message: "Session updated", data });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json({ message: "Error deleting session", error }, { status: 500 });
  }

  return NextResponse.json({ message: "Session deleted", data });
}
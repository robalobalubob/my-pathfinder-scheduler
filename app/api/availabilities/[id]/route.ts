import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/authOptions';

type AvailabilityPayload = {
  name?: string;
  selected_days?: string[];
  time_option?: string;
  start_time?: string;
  end_time?: string;
  repeat_option?: string;
  repeat_weeks?: number | null;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as { id: string }).id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const { name, selectedDays, timeOption, timeRange, repeatOption, repeatWeeks } = body;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: existingAvail, error: fetchError } = await supabase
    .from("availabilities")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError || !existingAvail) {
    return NextResponse.json({ message: "Availability not found", error: fetchError }, { status: 404 });
  }
  if ((session.user as { id: string; role: string }).role !== "admin" &&
      (session.user as { id: string; role: string }).role !== "gm" &&
      existingAvail.user_id !== (session.user as { id: string }).id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const payload: AvailabilityPayload = {};
  if (name !== undefined) payload.name = name;
  if (selectedDays !== undefined) payload.selected_days = selectedDays;
  if (timeOption !== undefined) payload.time_option = timeOption;
  if (timeRange !== undefined) {
    payload.start_time = timeRange.start;
    payload.end_time = timeRange.end;
  }
  if (repeatOption !== undefined) payload.repeat_option = repeatOption;
  if (repeatOption === 'weeks' && repeatWeeks !== undefined) {
    payload.repeat_weeks = parseInt(repeatWeeks);
  } else {
    payload.repeat_weeks = null;
  }
  
  const { data, error } = await supabase
    .from("availabilities")
    .update(payload)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json({ message: "Error updating availability", error }, { status: 500 });
  }
  return NextResponse.json({ message: "Availability updated successfully", data });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as { id: string }).id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: existingAvail, error: fetchError } = await supabase
    .from("availabilities")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError || !existingAvail) {
    return NextResponse.json({ message: "Availability not found", error: fetchError }, { status: 404 });
  }
  if ((session.user as { id: string; role: string }).role !== "admin" &&
      (session.user as { id: string; role: string }).role !== "gm" &&
      existingAvail.user_id !== (session.user as { id: string }).id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const { data, error } = await supabase
    .from("availabilities")
    .delete()
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error deleting availability:", error);
    return NextResponse.json({ message: "Error deleting availability", error }, { status: 500 });
  }
  return NextResponse.json({ message: "Availability deleted successfully", data });
}
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '../../../utils/supabase/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/authOptions';

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

export async function POST(req: Request) {
  const body = await req.json();
  const { name, selectedDays, timeOption, timeRange, repeatOption, repeatWeeks } = body;

  if (!name || !selectedDays || !timeRange || !timeOption) {
    return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('availabilities')
    .insert([
      {
        user_id: userId,
        name,
        selected_days: selectedDays,
        time_option: timeOption,
        start_time: timeRange.start,
        end_time: timeRange.end,
        repeat_option: repeatOption,
        repeat_weeks: repeatOption === 'weeks' ? parseInt(repeatWeeks) : null,
      },
    ]);

  if (error) {
    console.error('Supabase insert error:', error);
    return NextResponse.json({ message: 'Error inserting data', error }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Scheduling data received and stored',
    data,
  });
}
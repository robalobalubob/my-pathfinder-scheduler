import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '../../../utils/supabase/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { name, selectedDays, timeOption, timeRange, repeatOption, repeatWeeks } = body;

  if (!name || !selectedDays || !timeRange || !timeOption) {
    return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('availabilities')
    .insert([
      {
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
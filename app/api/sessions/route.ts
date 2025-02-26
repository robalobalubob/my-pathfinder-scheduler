import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '../../../utils/supabase/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { title, session_date } = body;

  if (!title || !session_date) {
    return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('sessions')
    .insert([{ title, session_date }]);

  if (error) {
    console.error('Supabase insert error:', error);
    return NextResponse.json({ message: 'Error inserting session', error }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Session scheduled successfully',
    data,
  });
}
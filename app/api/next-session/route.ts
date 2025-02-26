import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '../../../utils/supabase/server';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('session_date', { ascending: true })
    .limit(1);

  if (error) {
    console.error('Error fetching next session:', error);
    return NextResponse.json({ message: 'Error fetching next session', error }, { status: 500 });
  }

  return NextResponse.json({ nextSession: data });
}
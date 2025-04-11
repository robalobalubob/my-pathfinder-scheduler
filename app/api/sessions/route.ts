import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '../../../utils/supabase/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/authOptions';

export async function POST(req: Request) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user.role !== "gm" && session.user.role !== "admin")) {
      return NextResponse.json(
        { message: "Unauthorized: Only GMs and admins can create sessions" }, 
        { status: 401 }
      );
    }
    
    // Parse and validate input
    const body = await req.json();
    const { title, session_date } = body;
    
    if (!title || !title.trim()) {
      return NextResponse.json({ message: 'Session title is required' }, { status: 400 });
    }
    
    if (!session_date) {
      return NextResponse.json({ message: 'Session date is required' }, { status: 400 });
    }
    
    // Validate date format
    const dateObj = new Date(session_date);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ message: 'Invalid date format' }, { status: 400 });
    }
    
    // Database interaction
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await supabase
      .from('sessions')
      .insert([{ 
        title: title.trim(), 
        session_date,
        user_id: session.user.id,
        created_by: session.user.email || "Unknown user"
      }]);
    
    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { message: 'Error creating session', error: error.message }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Session scheduled successfully',
      data,
    });
  } catch (error) {
    console.error('Unexpected error in sessions POST:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message }, 
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const upcoming = url.searchParams.get("upcoming") === "true";
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit") || "10") : undefined;
    
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    let query = supabase
      .from('sessions')
      .select('*')
      .order('session_date', { ascending: true });
    
    if (upcoming) {
      const now = new Date().toISOString();
      query = query.gte('session_date', now);
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { message: 'Error fetching sessions', error: error.message }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ sessions: data });
  } catch (error) {
    console.error('Unexpected error in sessions GET:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message }, 
      { status: 500 }
    );
  }
}

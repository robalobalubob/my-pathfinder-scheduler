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
    // Accept both session_date and date for backward compatibility
    const dateValue = body.date || body.session_date;
    const { title } = body;
    
    if (!title || !title.trim()) {
      return NextResponse.json({ message: 'Session title is required' }, { status: 400 });
    }
    
    if (!dateValue) {
      return NextResponse.json({ message: 'Session date is required' }, { status: 400 });
    }
    
    // Validate date format
    const dateObj = new Date(dateValue);
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
        // Store as 'date' in the database, but also keep session_date for backward compatibility
        date: dateValue,
        session_date: dateValue,
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
    
    // Get filter parameters
    const upcoming = url.searchParams.get("upcoming") === "true";
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit") || "10") : undefined;
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const userId = url.searchParams.get("user_id");
    
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // Start building the query
    let query = supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: true });
    
    // Apply filters conditionally
    if (upcoming) {
      const now = new Date().toISOString();
      query = query.gte('date', now);
    }
    
    // Date range filtering for calendar optimization
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // User-specific filtering
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // Apply limit if provided
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
    
    // Ensure response data has consistent field names
    const sessions = data?.map(session => {
      // If the session has session_date but no date, create date from session_date
      if (session.session_date && !session.date) {
        session.date = session.session_date;
      }
      // If the session has date but no session_date, create session_date from date
      else if (session.date && !session.session_date) {
        session.session_date = session.date;
      }
      return session;
    }) || [];
    
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Unexpected error in sessions GET:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message }, 
      { status: 500 }
    );
  }
}

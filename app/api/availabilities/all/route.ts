import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/authOptions';

export async function GET() {
  // Authentication check - only GMs and admins can access this endpoint
  const session = await getServerSession(authOptions);
  if (!session || !session.user || 
     (session.user.role !== 'gm' && session.user.role !== 'admin')) {
    return NextResponse.json({ message: "Unauthorized: Only GMs and admins can access this data" }, { status: 401 });
  }
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  // Join with users table to get user information along with availability
  const { data, error } = await supabase
    .from("availabilities")
    .select(`
      *,
      users:user_id (
        id,
        name,
        email
      )
    `)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching all availabilities:", error);
    return NextResponse.json({ message: "Error fetching player availability data", error }, { status: 500 });
  }
  
  // Transform data to include user details directly in availability objects
  const enhancedData = data.map(item => ({
    ...item,
    user_name: item.users?.name || 'Unknown Player',
    user_email: item.users?.email || '',
    users: undefined // Remove nested users object
  }));

  // Use the expected data structure format
  return NextResponse.json({ 
    playerAvailability: enhancedData 
  });
}
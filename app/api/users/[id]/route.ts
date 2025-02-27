import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // adjust path as needed

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { newRole } = body;

  if (!newRole || !["new", "player", "gm"].includes(newRole)) {
    return NextResponse.json(
      { message: "Invalid role; cannot assign 'admin' or unsupported role." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { id } = await params;

  const { data, error } = await supabase
    .from("users")
    .update({ role: newRole })
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { message: "Error updating role", error },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Role updated successfully", data });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { id } = await params;

  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user", error },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ message: "User deleted successfully", data });
}

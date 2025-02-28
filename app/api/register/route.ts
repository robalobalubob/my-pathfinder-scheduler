import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .limit(1)
    .single();

  if (existingUser) {
    return NextResponse.json(
      { message: "User already exists." },
      { status: 400 }
    );
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const { data, error } = await supabase.from("users").insert([
    {
      email,
      password_hash: hashedPassword,
      role: "new",
    },
  ]);

  if (error) {
    return NextResponse.json(
      { message: "Error creating user.", error },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "User created successfully.", data });
}
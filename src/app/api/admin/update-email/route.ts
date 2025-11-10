import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { supabase } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { id?: number; role?: string } | undefined;

    if (!sessionUser) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionUser.id;
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ status: false, message: "Invalid email" }, { status: 400 });
    }

    // Update user's email in Supabase
    const {  error } = await supabase
      .from("users")
      .update({ email })
      .eq("id", userId);

    if (error) { 
      return NextResponse.json({ status: false, message: "Failed to update email" }, { status: 500 });
    }
 

    return NextResponse.json({ status: true, message: "Email updated successfully" });
  } catch (error) {
    console.error("Email update error:", error);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

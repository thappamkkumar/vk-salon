import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { supabase } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { id?: number; role?: string } | undefined;

    if (!sessionUser) {
      return NextResponse.json({ status: false, message: "Unauthorized." }, { status: 401 });
    }

    const userId = sessionUser.id;
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ status: false, message: "Invalid input." }, { status: 400 });
    }

    // Get user's current password hash from Supabase
    const { data, error } = await supabase
      .from("users")
      .select("password_hash")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ status: false, message: "User not found." }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, data.password_hash);
    if (!isMatch) {
      return NextResponse.json({ status: false, message: "Current password is incorrect." }, { status: 401 });
    }

    const newHashed = await bcrypt.hash(newPassword, 12);

    // Update password in Supabase
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: newHashed })
      .eq("id", userId);

    if (updateError) { 
      return NextResponse.json({ status: false, message: "Failed to update password." }, { status: 500 });
    }

    return NextResponse.json({ status: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ status: false, message: "Server error." }, { status: 500 });
  }
}

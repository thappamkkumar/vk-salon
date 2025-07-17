import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ status: false, message: "Invalid input." }, { status: 400 });
    }

    // Fetch existing hashed password for admin (id = 1)
    const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [1]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ status: false, message: "User not found." }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ status: false, message: "Current password is incorrect." }, { status: 401 });
    }

    const newHashed = await bcrypt.hash(newPassword, 12);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHashed, 1]);

    return NextResponse.json({ status: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

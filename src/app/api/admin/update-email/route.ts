import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function POST(req: NextRequest) {
  try {
    const { id, email } = await req.json();

    if (!id || !email.includes("@")) {
      return NextResponse.json({ status: false, message: "Invalid email" }, { status: 400 });
    }

    const result = await pool.query("UPDATE users SET email = $1 WHERE id = $2", [email, id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ status: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ status: true, message: "Email updated" });
  } catch (error) {
    console.error("Email update error:", error);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

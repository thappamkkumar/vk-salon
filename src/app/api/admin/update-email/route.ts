import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ status: false, message: "Invalid email" }, { status: 400 });
    }

    const result = await pool.query(
      "UPDATE users SET email = $1 WHERE id = $2",
      [email, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ status: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ status: true, message: "Email updated successfully" });
  } catch (error) {
    console.error("Email update error:", error);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

// app/api/adminProfile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function GET(req: NextRequest) {
  try {
    //   Get id from query string: /api/adminProfile?id=1
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing user ID', status: false }, { status: 400 });
    }

    const result = await pool.query(
      'SELECT email, role FROM users WHERE id = $1',
      [id]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ message: 'User not found', status: false }, { status: 404 });
    }

    return NextResponse.json({ status: true, rows: [user] });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json({ message: 'Internal Server Error', status: false }, { status: 500 });
  }
}

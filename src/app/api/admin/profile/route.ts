// app/api/adminProfile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  try {
    // Get id from query string: /api/adminProfile?id=1
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing user ID', status: false }, { status: 400 });
    }

    // Fetch user from Supabase
    const { data, error } = await supabase
      .from('users')
      .select('email, role')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ message: 'User not found', status: false }, { status: 404 });
    }

    return NextResponse.json({ status: true, rows: [data] });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json({ message: 'Internal Server Error', status: false }, { status: 500 });
  }
}

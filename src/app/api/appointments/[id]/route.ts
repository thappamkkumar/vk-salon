import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg'; 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

//export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const appointmentId = Number(params.id);
	

  if (isNaN(appointmentId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    

    // Delete row from DB
    await pool.query('DELETE FROM appointments WHERE id = $1', [appointmentId]);

    return NextResponse.json({ success: true, message: 'Appointment deleted successfully' }, { status: 200 });

  } catch (err) {
    console.error('Error deleting style:', err);
    return NextResponse.json({ error: `Failed to delete service: ${err}` }, { status: 500 });
  }
}

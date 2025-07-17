import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

//export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const barberId = Number(params.id);
	

  if (isNaN(barberId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    // Get image filename
    const selectResult = await pool.query('SELECT * FROM barbers WHERE id = $1', [barberId]);

    if (selectResult.rowCount === 0) 
		{
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    }

    const barber = selectResult.rows[0];
    const imageFile = barber.image;

    // Delete file from disk
    const imagePath = path.join(process.cwd(), 'public/vendor/barbers', imageFile);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete row from DB
    await pool.query('DELETE FROM barbers WHERE id = $1', [barberId]);

    return NextResponse.json({ success: true, message: 'Barber deleted successfully' }, { status: 200 });

  } catch (err) {
    console.error('Error deleting style:', err);
    return NextResponse.json({ error: `Failed to delete barber: ${err}` }, { status: 500 });
  }
}

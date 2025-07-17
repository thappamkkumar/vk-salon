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
  const serviceId = Number(params.id);
	

  if (isNaN(serviceId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    // Get image filename
    const selectResult = await pool.query('SELECT * FROM services WHERE id = $1', [serviceId]);

    if (selectResult.rowCount === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const service= selectResult.rows[0];
    const imageFile = service.image;

    // Delete file from disk
    const imagePath = path.join(process.cwd(), 'public/vendor/services', imageFile);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete row from DB
    await pool.query('DELETE FROM services WHERE id = $1', [serviceId]);

    return NextResponse.json({ success: true, message: 'Service deleted successfully' }, { status: 200 });

  } catch (err) {
    console.error('Error deleting style:', err);
    return NextResponse.json({ error: `Failed to delete service: ${err}` }, { status: 500 });
  }
}

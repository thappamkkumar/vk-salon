

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

// --- DELETE Barber (remove from Supabase DB + private bucket) ---
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const barberId = Number(id);

  if (isNaN(barberId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    // 1?? Get barber record
    const { data: barber, error: selectError } = await supabase
      .from("barbers")
      .select("*")
      .eq("id", barberId)
      .single();

    if (selectError) {
      console.error("Select error:", selectError);
      return NextResponse.json(
        { error: "Database error", details: selectError.message },
        { status: 500 }
      );
    }

    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    const imageFile = barber.image;

    // 2?? Delete file from Supabase Storage
    if (imageFile) {
      const { error: storageError } = await supabase.storage
        .from("barbers")
        .remove([imageFile]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
        // we still continue to delete DB record
      }
    }

    // 3?? Delete DB record
    const { error: deleteError } = await supabase
      .from("barbers")
      .delete()
      .eq("id", barberId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete barber", details: deleteError.message },
        { status: 500 }
      );
    }

    // ? Success
    return NextResponse.json(
      { success: true, message: "Barber deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting barber:", err);
    return NextResponse.json(
      { error: `Failed to delete barber: ${err}` },
      { status: 500 }
    );
  }
}



/*

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

//export const dynamic = 'force-dynamic';

export async function DELETE( 
	req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;   
  const barberId = Number(id);


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
*/
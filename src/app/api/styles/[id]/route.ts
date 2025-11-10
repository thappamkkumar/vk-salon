
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const styleId = Number(id);

    if (isNaN(styleId)) {
      return NextResponse.json({ error: "Invalid style ID" }, { status: 400 });
    }

    // 1?? Fetch the style record from Supabase
    const { data: styleData, error: fetchError } = await supabase
      .from("styles")
      .select("image")
      .eq("id", styleId)
      .single();

    if (fetchError || !styleData) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json({ error: "Style not found" }, { status: 404 });
    }

    const fileName = styleData.image;

    // 2?? Delete file from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from("styles") // ? your Supabase bucket name
      .remove([fileName]);

    if (deleteError) {
      console.error("Storage delete error:", deleteError);
      // continue anyway to remove DB row
    }

    // 3?? Delete the row from DB
    const { error: dbError } = await supabase
      .from("styles")
      .delete()
      .eq("id", styleId);

    if (dbError) {
      console.error("DB delete error:", dbError);
      return NextResponse.json({ error: "Failed to delete style" }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: "Style and file deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
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
  const styleId = Number(id);

  if (isNaN(styleId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    // Get image filename
    const selectResult = await pool.query('SELECT * FROM styles WHERE id = $1', [styleId]);

    if (selectResult.rowCount === 0) {
      return NextResponse.json({ error: 'Style not found' }, { status: 404 });
    }

    const style = selectResult.rows[0];
    const imageFile = style.image;

    // Delete file from disk
    const imagePath = path.join(process.cwd(), 'public/vendor/styles', imageFile);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete row from DB
    await pool.query('DELETE FROM styles WHERE id = $1', [styleId]);

    return NextResponse.json({ success: true, message: 'Style deleted successfully' }, { status: 200 });

  } catch (err) {
    console.error('Error deleting style:', err);
    return NextResponse.json({ error: `Failed to delete style: ${err}` }, { status: 500 });
  }
}
*/

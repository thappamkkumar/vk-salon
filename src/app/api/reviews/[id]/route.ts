import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reviewId = Number(id);

  if (isNaN(reviewId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    // 1?? Fetch the review to get the image name
    const { data: review, error: selectError } = await supabase
      .from("reviews")
      .select("id, image")
      .eq("id", reviewId)
      .single();

    if (selectError) {
      console.error("Error fetching review:", selectError);
      return NextResponse.json(
        { error: "Failed to fetch review" },
        { status: 500 }
      );
    }

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const imageFile = review.image;

    // 2?? Delete image from Supabase Storage
    if (imageFile) {
      const { error: deleteFileError } = await supabase.storage
        .from("reviews")
        .remove([imageFile]);

      if (deleteFileError) {
        console.error("Error deleting image:", deleteFileError);
        // (Optional) You can continue even if file delete fails
      }
    }

    // 3?? Delete record from DB
    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (deleteError) {
      console.error("Error deleting DB record:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete review record" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Review deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting review:", err);
    return NextResponse.json(
      { error: `Failed to delete review: ${err}` },
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
  const reviewId = Number(id);
	

  if (isNaN(reviewId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    // Get image filename
    const selectResult = await pool.query('SELECT * FROM reviews WHERE id = $1', [reviewId]);

    if (selectResult.rowCount === 0) {
      return NextResponse.json({ error: 'Reviews not found' }, { status: 404 });
    }	

    const review= selectResult.rows[0];
    const imageFile = review.image;

    // Delete file from disk
    const imagePath = path.join(process.cwd(), 'public/vendor/reviews', imageFile);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete row from DB
    await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);

    return NextResponse.json({ success: true, message: 'Review deleted successfully' }, { status: 200 });

  } catch (err) {
    console.error('Error deleting style:', err);
    return NextResponse.json({ error: `Failed to delete review: ${err}` }, { status: 500 });
  }
}
*/
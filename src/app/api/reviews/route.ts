// /app/api/reviews/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

// Helper to map MIME to file extension
function getExtension(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/jpg": "jpg",
  };
  return map[mime] || "bin";
}

// -------------------- POST --------------------
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    const name = formData.get("name")?.toString().trim();
    const address = formData.get("address")?.toString().trim();
    const rating = formData.get("rating")?.toString().trim();
    const message = formData.get("message")?.toString().trim();

    if (!name || !address || !rating || !message || !(file instanceof File)) {
      return NextResponse.json(
        { message: "Missing fields or invalid file", status: false },
        { status: 400 }
      );
    }

    const ratingValue = parseInt(rating, 10);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5", status: false },
        { status: 400 }
      );
    }

    const ext = getExtension(file.type);
    if (!["jpg", "jpeg", "png"].includes(ext)) {
      return NextResponse.json(
        { message: "Unsupported file type", status: false },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const fileName = `review_${timestamp}.${ext}`;

    // Upload to private Supabase bucket "reviews"
    const { error: uploadError } = await supabase.storage
      .from("reviews")
      .upload(fileName, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { message: "Failed to upload image", status: false },
        { status: 500 }
      );
    }

    // Insert into Supabase table
    const { error: insertError } = await supabase.from("reviews").insert([
      {
        name,
        image: fileName,
        address,
        rating: ratingValue,
        message,
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { message: "Failed to save review", status: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Review added successfully",
      status: true,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { message: "Server error: " + error, status: false },
      { status: 500 }
    );
  }
}

// -------------------- GET --------------------
 export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const direction = searchParams.get("direction") || "next";
  const limit = 20;

  const query = supabase
    .from("reviews")
    .select("*")
    .order("id", { ascending: false });

  if (cursor) {
    if (direction === "next") query.lt("id", parseInt(cursor));
    else query.gt("id", parseInt(cursor));
  }

  query.limit(limit);

  try {
    const { data: reviews, error } = await query;
    if (error) throw error;

    // ? Generate signed URLs for private images
    const mappedReviews = await Promise.all(
      (reviews || []).map(async (review) => {
        const { data: signed, error: signedError } = await supabase.storage
          .from("reviews")
          .createSignedUrl(review.image, 60 * 60); // valid 1 hour

        const fileUrl = !signedError && signed?.signedUrl ? signed.signedUrl : "";

        const formattedDate = new Date(review.created_at).toLocaleDateString(
          "en-GB",
          { day: "2-digit", month: "long", year: "numeric" }
        );

        return {
          id: review.id,
          name: review.name,
          address: review.address,
          rating: review.rating,
          message: review.message,
          image: fileUrl, // same property as before
          created_at: formattedDate,
        };
      })
    );

    // ? Cursor-based pagination
    const nextCursor = reviews?.length ? reviews[reviews.length - 1].id : null;
    const prevCursor = reviews?.length ? reviews[0].id : null;

    // ? Check for next/prev availability
    let hasNext = false;
    let hasPrev = false;

    if (nextCursor) {
      const { count } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .lt("id", nextCursor);
      hasNext = (count ?? 0) > 0;
    }

    if (prevCursor) {
      const { count } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .gt("id", prevCursor);
      hasPrev = (count ?? 0) > 0;
    }

    return NextResponse.json({
      reviews: mappedReviews,
      nextCursor,
      prevCursor,
      hasNext,
      hasPrev,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
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

function getExtension(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/jpg': 'jpg',
  };
  return map[mime] || 'bin';
}

export async function POST(req: NextRequest) {
  try {
		const formData = await req.formData();

    const file = formData.get('file');
    const name = formData.get('name')?.toString().trim();
    const address = formData.get('address')?.toString().trim();
    const rating = formData.get('rating')?.toString().trim();
    const message = formData.get('message')?.toString().trim();


    if (!name || !address || !rating || !message ||  !(file instanceof File)) {
      return NextResponse.json({ message: 'Missing fields or invalid file', status: false }, { status: 400 });
    }
		
		 // Validate rating is a number between 1 and 5
    const ratingValue = parseInt(rating, 10);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json(
        { message: 'Rating must be a number between 1 and 5', status: false },
        { status: 400 }
      );
    }
		
    const ext = getExtension(file.type);
    if (!['jpg', 'jpeg', 'png'].includes(ext)) {
      return NextResponse.json({ message: 'Unsupported file type', status: false }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const baseFileName = `review_file_${timestamp}`;
    const fileName = `${baseFileName}.${ext}`;

    const reviewsDir = path.join(process.cwd(), 'public/vendor/reviews');
    const savePath = path.join(reviewsDir, fileName);

    // Ensure the directory exists
    if (!fs.existsSync(reviewsDir)) {
      fs.mkdirSync(reviewsDir, { recursive: true });
    }

    // Save file
    fs.writeFileSync(savePath, buffer);

    // Insert into DB
    const insertQuery = `INSERT INTO reviews (name, image, address, rating, message  ) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
		
		await pool.query(insertQuery, [name, fileName, address, rating, message]);

    
    return NextResponse.json({
      message: 'Review created addedd successfully',
      status: true, 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' + error, status: false }, { status: 500 });
  }
}



export async function GET(req: NextRequest): Promise<NextResponse>
{
   
		const { searchParams } = new URL(req.url);
		const cursor = searchParams.get('cursor'); // ID to paginate
		const direction = searchParams.get('direction') || 'next'; // 'next' or 'prev'
		const limit = 20;
		
		const query = `
			SELECT * FROM reviews
			WHERE $1::int IS NULL OR 
				${direction === 'next' ? 'id < $1' : 'id > $1'}
			ORDER BY id ${direction === 'next' ? 'DESC' : 'ASC'}
			LIMIT $2
		`;
		
		const values = [cursor ? parseInt(cursor) : null, limit];
		
		try 
		{
			const result = await pool.query(query, values);
			const reviewData = result.rows;

			// For prev, reverse the order to maintain consistency
			if (direction === 'prev') reviewData.reverse();
			
			const mappedReviewData = reviewData.map((review) => {
				const formattedDate = new Date(review.created_at).toLocaleDateString('en-GB', {
					day: '2-digit',
					month: 'long', // "May"
					year: 'numeric',
				});

				return {
					id: review.id,
					name: review.name, 
					address: review.address, 
					rating: review.rating, 
					message: review.message,  
					image: `/vendor/reviews/${review.image}`,
					created_at: formattedDate,
				};
			});
			
			
			const nextCursor = reviewData.length ? reviewData[reviewData.length - 1].id : null;
			const prevCursor = reviewData.length ? reviewData[0].id : null;

			// Check for hasNext and hasPrev
			const hasNextQuery = `
				SELECT 1 FROM reviews
				WHERE id < $1
				LIMIT 1
			`;

			const hasPrevQuery = `
				SELECT 1 FROM reviews
				WHERE id > $1
				LIMIT 1
			`;

			let hasNext = false;
			let hasPrev = false;
			
			if (nextCursor !== null) {
				const nextRes = await pool.query(hasNextQuery, [nextCursor]);
				hasNext = ( nextRes.rowCount ?? 0 ) > 0;
			}

			if (prevCursor !== null) {
				const prevRes = await pool.query(hasPrevQuery, [prevCursor]);
				hasPrev = ( prevRes.rowCount ?? 0 ) > 0;
			}

			return NextResponse.json({
				reviews: mappedReviewData,
				nextCursor,
				prevCursor,
				hasNext,
				hasPrev,
			});
			
	} catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

*/
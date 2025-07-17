// /app/api/reviews/route.ts
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
		const result = await pool.query(insertQuery, [name, fileName, address, rating, message]);

    
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
		
		let query = `
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
			
			const mappedReviewData = reviewData.map((review: any) => {
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
				hasNext = nextRes.rowCount > 0;
			}

			if (prevCursor !== null) {
				const prevRes = await pool.query(hasPrevQuery, [prevCursor]);
				hasPrev = prevRes.rowCount > 0;
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


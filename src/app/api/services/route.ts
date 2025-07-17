// /app/api/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
  

//import {Service} from '@/types/services'; 	

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

//export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const title = formData.get('title')?.toString().trim();
    const price = formData.get('price')?.toString().trim();

    if (!title || !price || !(file instanceof File)) {
      return NextResponse.json({ message: 'Missing fields or invalid file', status: false }, { status: 400 });
    }

    const ext = getExtension(file.type);
    if (!['jpg', 'jpeg', 'png'].includes(ext)) {
      return NextResponse.json({ message: 'Unsupported file type', status: false }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const baseFileName = `service_file_${timestamp}`;
    const fileName = `${baseFileName}.${ext}`;

    const servicesDir = path.join(process.cwd(), 'public/vendor/services');
    const savePath = path.join(servicesDir, fileName);

    // Ensure the directory exists
    if (!fs.existsSync(servicesDir)) {
      fs.mkdirSync(servicesDir, { recursive: true });
    }

    // Save file
    fs.writeFileSync(savePath, buffer);

    // Insert into DB
    const insertQuery = `INSERT INTO services (title, price, image) VALUES ($1, $2, $3) RETURNING *;`;
    const result = await pool.query(insertQuery, [title, price, fileName]);

    return NextResponse.json({
      message: 'Service created successfully',
      status: true,
      
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error', status: false }, { status: 500 });
  }
}




export async function GET(req: NextRequest): Promise<NextResponse>
{
   
		const { searchParams } = new URL(req.url);
		const cursor = searchParams.get('cursor'); // ID to paginate
		const direction = searchParams.get('direction') || 'next'; // 'next' or 'prev'
		const limit = 20;
		
		let query = `
			SELECT * FROM services
			WHERE $1::int IS NULL OR 
				${direction === 'next' ? 'id < $1' : 'id > $1'}
			ORDER BY id ${direction === 'next' ? 'DESC' : 'ASC'}
			LIMIT $2
		`;
		
		const values = [cursor ? parseInt(cursor) : null, limit];
		
		try 
		{
			const result = await pool.query(query, values);
			const serviceData = result.rows;

			// For prev, reverse the order to maintain consistency
			if (direction === 'prev') serviceData.reverse();
			
			const mappedServiceData = serviceData.map((service: any) => {
				const formattedDate = new Date(service.created_at).toLocaleDateString('en-GB', {
					day: '2-digit',
					month: 'long', // "May"
					year: 'numeric',
				});

				return {
					id: service.id,
					title: service.title,
					price: service.price,
					image: `/vendor/services/${service.image}`,
					created_at: formattedDate,
				};
			});
			
			
			const nextCursor = serviceData.length ? serviceData[serviceData.length - 1].id : null;
			const prevCursor = serviceData.length ? serviceData[0].id : null;

			// Check for hasNext and hasPrev
			const hasNextQuery = `
				SELECT 1 FROM services
				WHERE id < $1
				LIMIT 1
			`;

			const hasPrevQuery = `
				SELECT 1 FROM services
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
				services: mappedServiceData,
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


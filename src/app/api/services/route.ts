// /app/api/services/route.ts


import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer"; // make sure this exports a Supabase client

function getExtension(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/jpg": "jpg",
  };
  return map[mime] || "bin";
}

// ---------------------------------------------
//  POST ? Create Service + Upload Image to Supabase
// ---------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const title = formData.get("title")?.toString().trim();
    const price = formData.get("price")?.toString().trim();

    if (!title || !price || !(file instanceof File)) {
      return NextResponse.json(
        { message: "Missing fields or invalid file", status: false },
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

    // Generate unique file name
    const timestamp = Date.now();
    const fileName = `service_${timestamp}.${ext}`;
 

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("services") // your Supabase bucket name
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

    // Insert DB record
    const { error: insertError } = await supabase
      .from("services")
      .insert([{ title, price, image: fileName }]);

    if (insertError) {
      console.error("DB insert error:", insertError);
      return NextResponse.json(
        { message: "Failed to save service", status: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Service created successfully",
      status: true,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { message: "Server error", status: false },
      { status: 500 }
    );
  }
}

// ---------------------------------------------
//  GET ? Paginated List of Services
// ---------------------------------------------

 
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor"); // ID to paginate
  const direction = searchParams.get("direction") || "next"; // 'next' or 'prev'
  const limit = 20;

  try {
    // Base query
    let query = supabase
      .from("services")
      .select("*")
      .order("id", { ascending: direction === "prev" ? true : false })
      .limit(limit);

    // Apply pagination cursor
    if (cursor) {
      if (direction === "next") {
        query = query.lt("id", Number(cursor));
      } else {
        query = query.gt("id", Number(cursor));
      }
    }

    const { data: serviceData, error } = await query;

    if (error) {
      console.error("Fetch error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!serviceData || serviceData.length === 0) {
      return NextResponse.json({
        services: [],
        nextCursor: null,
        prevCursor: null,
        hasNext: false,
        hasPrev: false,
      });
    }

    // For prev, reverse the order to maintain consistency
    if (direction === "prev") serviceData.reverse();

    // Map + signed URLs for private bucket
    const mappedServiceData = await Promise.all(
      serviceData.map(async (service) => {
        // Generate signed URL (since bucket is not public)
        const { data: signed } = await supabase.storage
          .from("services")
          .createSignedUrl(service.image, 60 * 60); // 1-hour validity

        const formattedDate = new Date(service.created_at).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        );

        return {
          id: service.id,
          title: service.title,
          price: service.price,
          description: service.description, // if you have one
          image: signed?.signedUrl || null,
          created_at: formattedDate,
        };
      })
    );

    // Pagination cursors
    const nextCursor = serviceData.length
      ? serviceData[serviceData.length - 1].id
      : null;
    const prevCursor = serviceData.length ? serviceData[0].id : null;

    // Check hasNext & hasPrev
    const { count: nextCount } = await supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .lt("id", nextCursor ?? 0);

    const { count: prevCount } = await supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .gt("id", prevCursor ?? 0);

    const hasNext = (nextCount ?? 0) > 0;
    const hasPrev = (prevCount ?? 0) > 0;

    return NextResponse.json({
      services: mappedServiceData,
      nextCursor,
      prevCursor,
      hasNext,
      hasPrev,
    });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}





/*
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
    
		await pool.query(insertQuery, [title, price, fileName]);

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
		
		const query = `
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
			
			const mappedServiceData = serviceData.map((service) => {
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
				hasNext = ( nextRes.rowCount ?? 0 ) > 0;
			}

			if (prevCursor !== null) {
				const prevRes = await pool.query(hasPrevQuery, [prevCursor]);
				hasPrev = ( prevRes.rowCount ?? 0 ) > 0;
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

*/







import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

// --- Utility: extract extension from MIME ---
function getExtension(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/jpg": "jpg",
  };
  return map[mime] || "bin";
}

// --- POST: Create Barber (Upload to Supabase Storage + insert row) ---
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const name = formData.get("name")?.toString().trim();
    const contact = formData.get("contact")?.toString().trim();
    const experience = formData.get("experience")?.toString().trim();

    if (!name || !contact || !experience || !(file instanceof File)) {
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

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const fileName = `barber_file_${timestamp}.${ext}`;

    // Upload to Supabase private bucket
    const { error: uploadError } = await supabase.storage
      .from("barbers")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload failed:", uploadError);
      return NextResponse.json(
        { message: "Failed to upload image", status: false },
        { status: 500 }
      );
    }

    // Insert barber record
    const { error: insertError } = await supabase
      .from("barbers")
      .insert([
        {
          name,
          contact,
          experience,
          image: fileName, // store filename only
        },
      ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { message: "Failed to save barber", status: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Barber created successfully",
      status: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error: " + error, status: false },
      { status: 500 }
    );
  }
}

// --- GET: Paginated Barber List (Private Bucket signed URLs) ---
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const direction = searchParams.get("direction") || "next";
  const limit = 20;

  try {
    // Query with pagination
    let query = supabase
      .from("barbers")
      .select("*")
      .order("id", { ascending: direction === "prev" })
      .limit(limit);

    if (cursor) {
      if (direction === "next") query = query.lt("id", Number(cursor));
      else query = query.gt("id", Number(cursor));
    }

    const { data: barberData, error } = await query;

    if (error) {
      console.error("Fetch error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!barberData || barberData.length === 0) {
      return NextResponse.json({
        barbers: [],
        nextCursor: null,
        prevCursor: null,
        hasNext: false,
        hasPrev: false,
      });
    }

    // Reverse if direction=prev (keep consistent order)
    if (direction === "prev") barberData.reverse();

    // Generate signed URLs for private bucket
    const mappedBarberData = await Promise.all(
      barberData.map(async (barber) => {
        const { data: signed } = await supabase.storage
          .from("barbers")
          .createSignedUrl(barber.image, 60 * 60); // 1-hour validity

        const formattedDate = new Date(barber.created_at).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        );

        return {
          id: barber.id,
          name: barber.name,
          contact: barber.contact,
          experience: barber.experience,
          image: signed?.signedUrl || null,
          created_at: formattedDate,
        };
      })
    );

    // Pagination cursors
    const nextCursor =
      barberData.length > 0 ? barberData[barberData.length - 1].id : null;
    const prevCursor = barberData.length > 0 ? barberData[0].id : null;

    // Check hasNext and hasPrev
    const { count: nextCount } = await supabase
      .from("barbers")
      .select("id", { count: "exact", head: true })
      .lt("id", nextCursor ?? 0);

    const { count: prevCount } = await supabase
      .from("barbers")
      .select("id", { count: "exact", head: true })
      .gt("id", prevCursor ?? 0);

    const hasNext = (nextCount ?? 0) > 0;
    const hasPrev = (prevCount ?? 0) > 0;

    return NextResponse.json({
      barbers: mappedBarberData,
      nextCursor,
      prevCursor,
      hasNext,
      hasPrev,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}





/*
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
 
//import {Barber} from '@/types/barbers';
 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});


//export const dynamic = 'force-dynamic';

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
    const contact = formData.get('contact')?.toString().trim();
    const experience = formData.get('experience')?.toString().trim();

    if (!name || !contact || !experience  || !(file instanceof File)) {
      return NextResponse.json({ message: 'Missing fields or invalid file', status: false }, { status: 400 });
    }

    const ext = getExtension(file.type);
    if (!['jpg', 'jpeg', 'png'].includes(ext)) {
      return NextResponse.json({ message: 'Unsupported file type', status: false }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const baseFileName = `barber_file_${timestamp}`;
    const fileName = `${baseFileName}.${ext}`;

    const barbersDir = path.join(process.cwd(), 'public/vendor/barbers');
    const savePath = path.join(barbersDir, fileName);

    // Ensure the directory exists
    if (!fs.existsSync(barbersDir)) {
      fs.mkdirSync(barbersDir, { recursive: true });
    }

    // Save file
    fs.writeFileSync(savePath, buffer);

    // Insert into DB
    const insertQuery = `INSERT INTO barbers (name, contact, experience, image) VALUES ($1, $2, $3, $4) RETURNING *;`;
		
		await pool.query(insertQuery, [name, contact, experience, fileName]);

    
    return NextResponse.json({
      message: 'Barber created successfully',
      status: true, 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' + error, status: false }, { status: 500 });
  }
}



export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor'); // ID to paginate
  const direction = searchParams.get('direction') || 'next'; // 'next' or 'prev'
  const limit = 20;

  const query = `
    SELECT * FROM barbers
    WHERE $1::int IS NULL OR 
      ${direction === 'next' ? 'id < $1' : 'id > $1'}
    ORDER BY id ${direction === 'next' ? 'DESC' : 'ASC'}
    LIMIT $2
  `;

  const values = [cursor ? parseInt(cursor) : null, limit];

  try {
    const result = await pool.query(query, values);
    const barberData = result.rows;

    // For prev, reverse the order to maintain consistency
    if (direction === 'prev') barberData.reverse();
		
		const mappedBarberData = barberData.map((barber) => {
			const formattedDate = new Date(barber.created_at).toLocaleDateString('en-GB', {
				day: '2-digit',
				month: 'long', // "May"
				year: 'numeric',
			});

			return {
				id: barber.id,
				name: barber.name,
				contact: barber.contact,
				experience: barber.experience, 
				image: `/vendor/barbers/${barber.image}`,
				created_at: formattedDate,
			};
		});


    const nextCursor = barberData.length ? barberData[barberData.length - 1].id : null;
    const prevCursor = barberData.length ? barberData[0].id : null;

    // Check for hasNext and hasPrev
    const hasNextQuery = `
      SELECT 1 FROM barbers
      WHERE id < $1
      LIMIT 1
    `;

    const hasPrevQuery = `
      SELECT 1 FROM barbers
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
      barbers: mappedBarberData,
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
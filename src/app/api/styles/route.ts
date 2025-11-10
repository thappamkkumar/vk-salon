

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

// Utility to extract file extension from MIME type
function getExtension(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/jpg": "jpg",
  };

  return map[mime] || "bin";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "No file uploaded", status: false },
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

    // Create a unique file name
    const timestamp = Date.now();
    const fileName = `style_file_${timestamp}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // ? Upload to Supabase Storage (private bucket: styles)
    const { error: uploadError } = await supabase.storage
      .from("styles")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // ? Save file reference in DB
    const { error: dbError } = await supabase
      .from("styles")
      .insert([{ image: fileName }]);

    if (dbError) throw dbError;

    return NextResponse.json({
      message: "Style created successfully",
      status: true,
    });
  } catch (error) {
    console.error("Error uploading style:", error);
    return NextResponse.json(
      { message: "Upload failed", status: false },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const direction = searchParams.get("direction") || "next";
  const limit = 20;

  const query = supabase
    .from("styles")
    .select("*")
    .order("id", { ascending: false });

  if (cursor) {
    if (direction === "next") query.lt("id", parseInt(cursor));
    else query.gt("id", parseInt(cursor));
  }

  query.limit(limit);

  try {
    const { data: styles, error } = await query;
    if (error) throw error;

    // ? Generate signed URLs for private files
    const mappedStyles = await Promise.all(
      (styles || []).map(async (style) => {
        const { data: signed, error: signedError } = await supabase.storage
          .from("styles")
          .createSignedUrl(style.image, 60 * 60); // valid for 1 hour

        const fileUrl = !signedError && signed?.signedUrl ? signed.signedUrl : "";

        const formattedDate = new Date(style.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

        return {
          id: style.id,
          image: fileUrl,
          created_at: formattedDate,
        };
      })
    );

    const nextCursor = styles?.length ? styles[styles.length - 1].id : null;
    const prevCursor = styles?.length ? styles[0].id : null;

    // ? Check if there are next/prev pages
    let hasNext = false;
    let hasPrev = false;

    if (nextCursor) {
      const { count } = await supabase
        .from("styles")
        .select("*", { count: "exact", head: true })
        .lt("id", nextCursor);

      hasNext = (count ?? 0) > 0;
    }

    if (prevCursor) {
      const { count } = await supabase
        .from("styles")
        .select("*", { count: "exact", head: true })
        .gt("id", prevCursor);

      hasPrev = (count ?? 0) > 0;
    }

    return NextResponse.json({
      styles: mappedStyles,
      nextCursor,
      prevCursor,
      hasNext,
      hasPrev,
    });
  } catch (error) {
    console.error("Error fetching styles:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}












/*
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
 
//import {Styles} from '@/types/styles';


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});


//export const dynamic = 'force-dynamic';


// Utility to extract file extension from MIME type
function getExtension(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/jpg': 'jpg',
  };
  return map[mime] || 'bin';
}

export async function POST(req: NextRequest) 
{
  try 
	{
		const formData = await req.formData();
    const file = formData.get('file');
		
		if (!(file instanceof File)) 
		{
      return NextResponse.json({ message: 'No file uploaded', status: false }, { status: 400 });
    }
		
		const ext = getExtension(file.type);
    if (!['jpg', 'jpeg', 'png'].includes(ext)) 
		{
      return NextResponse.json({ message: 'Unsupported file type', status: false }, { status: 400 });
    }
		
		const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const baseFileName = `style_file_${timestamp}`;
    const fileName = `${baseFileName}.${ext}`;
		
		const stylesDir = path.join(process.cwd(), 'public/vendor/styles');
    const savePath = path.join(stylesDir, fileName);
		
		
		// Ensure directory exists
    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir, { recursive: true });
    }

    // Write file to disk
    fs.writeFileSync(savePath, buffer);
		
		
		// Insert into DB
    const insertQuery = `INSERT INTO styles (image) VALUES ($1) RETURNING *;`;
    
		await pool.query(insertQuery, [fileName]);
    //const newStyle = result.rows[0];
		
		return NextResponse.json({ message: 'Style created successfully' , status: true});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error,  status: false }, { status: 500 });
  }
}
	




export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor'); // ID to paginate
  const direction = searchParams.get('direction') || 'next'; // 'next' or 'prev'
  const limit = 20;

  const query = `
    SELECT * FROM styles
    WHERE $1::int IS NULL OR 
      ${direction === 'next' ? 'id < $1' : 'id > $1'}
    ORDER BY id ${direction === 'next' ? 'DESC' : 'ASC'}
    LIMIT $2
  `;

  const values = [cursor ? parseInt(cursor) : null, limit];

  try {
    const result = await pool.query(query, values);
    const styleData = result.rows;

    // For prev, reverse the order to maintain consistency
    if (direction === 'prev') styleData.reverse();
		
		const mappedStyleData = styleData.map((style) => {
			const formattedDate = new Date(style.created_at).toLocaleDateString('en-GB', {
				day: '2-digit',
				month: 'long', // "May"
				year: 'numeric',
			});

			return {
				id: style.id,
				image: `/vendor/styles/${style.image}`,
				created_at: formattedDate,
			};
		});


     const nextCursor = styleData.length ? styleData[styleData.length - 1].id : null;
    const prevCursor = styleData.length ? styleData[0].id : null;

    // Check for hasNext and hasPrev
    const hasNextQuery = `
      SELECT 1 FROM styles
      WHERE id < $1
      LIMIT 1
    `;

    const hasPrevQuery = `
      SELECT 1 FROM styles
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
      styles: mappedStyleData,
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

 
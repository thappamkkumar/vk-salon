// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseServer';
import { Attachment } from '@/types/post';
import { v4 as uuidv4 } from 'uuid';

function getExtension(mime: string) {
  return mime.split('/')[1];
}

// ----------------- POST (Upload) -----------------
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    if (!formData || formData.entries().next().done) {
      return NextResponse.json({ message: 'No files provided', status: false }, { status: 400 });
    }

    const rowNo = Date.now();
    let index = 0;
    let lastWasVideo = false;
    let lastVideoBaseName = '';

    const savedFiles: Attachment[] = [];

    for (const value of formData.values()) {
      if (!(value instanceof File)) continue;

      const ext = getExtension(value.type);
      const baseFileName = `post_file_${rowNo}_${index}_${uuidv4()}`;
      const buffer = Buffer.from(await value.arrayBuffer());

      if (value.type.startsWith('video/')) {
        // Upload video file
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(`${baseFileName}.${ext}`, buffer, {
            contentType: value.type,
          });
        if (uploadError) throw uploadError;

        savedFiles.push({ type: 'video', fileName: `${baseFileName}.${ext}` });
        lastWasVideo = true;
        lastVideoBaseName = baseFileName;
      } else if (lastWasVideo) {
        // Upload thumbnail for previous video
        const { error: thumbError } = await supabase.storage
          .from('post_video_thumbnail')
          .upload(`${lastVideoBaseName}.jpg`, buffer, {
            contentType: value.type,
          });
        if (thumbError) throw thumbError;

        lastWasVideo = false;
      } else {
        // Upload image
        const { error: imgError } = await supabase.storage
          .from('posts')
          .upload(`${baseFileName}.${ext}`, buffer, {
            contentType: value.type,
          });
        if (imgError) throw imgError;

        savedFiles.push({ type: 'image', fileName: `${baseFileName}.${ext}` });
      }

      index++;
    }

    // Save metadata to DB
    const { error: dbError } = await supabase.from('posts').insert([{ attachment: savedFiles }]);
    if (dbError) throw dbError;

    return NextResponse.json({ message: 'Post created successfully', status: true });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: String(error), status: false }, { status: 500 });
  }
}

// ----------------- GET (Fetch) -----------------
export async function GET(req: NextRequest) {
   const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const direction = searchParams.get('direction') || 'next';
  const limit = 20;


  try {
		 
		 let query = supabase.from('posts').select('*').order('id', { ascending: false });

    if (cursor) {
      if (direction === 'next') query = query.lt('id', parseInt(cursor));
      else query = query.gt('id', parseInt(cursor));
    }

    query = query.limit(limit);

    const { data: posts, error } = await query;
    if (error) throw error;

	 
    if (error) throw error;
     
    const mappedPosts = await Promise.all(
      posts.map(async (post) => {
        const mappedAttachments = post.attachment
          ? await Promise.all(
              post.attachment.map(async (att: Attachment) => {
                let fileUrl = '';
                let thumbnail = '';

                const { data: signed } = await supabase.storage
                  .from('posts')
                  .createSignedUrl(att.fileName, 60 * 60);
                if (signed?.signedUrl) fileUrl = signed.signedUrl;

                if (att.type === 'video') {
                  const thumbName = att.fileName.replace(/\.[^/.]+$/, '.jpg');
                  const { data: thumbSigned } = await supabase.storage
                    .from('post_video_thumbnail')
                    .createSignedUrl(thumbName, 60 * 60);
                  if (thumbSigned?.signedUrl) thumbnail = thumbSigned.signedUrl;
                }

                return {
                  ...att,
                  fileName: fileUrl || att.fileName, // signed URL replaces local
                  ...(att.type === 'video' ? { thumbnail } : {}),
                };
              })
            )
          : [];

        const formattedDate = new Date(post.created_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });

        return {
          id: post.id,
          attachment: mappedAttachments,
          created_at: formattedDate,
        };
      })
    );
		
		const nextCursor = posts?.length ? posts[posts.length - 1].id : null;
    const prevCursor = posts?.length ? posts[0].id : null;

    // Check if next/prev pages exist
    let hasNext = false;
    let hasPrev = false;

    if (nextCursor) {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .lt('id', nextCursor);
      hasNext = (count ?? 0) > 0;
    }

    if (prevCursor) {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gt('id', prevCursor);
      hasPrev = (count ?? 0) > 0;
    }
		
		return NextResponse.json({
      posts: mappedPosts,
      nextCursor,
      prevCursor,
      hasNext,
      hasPrev,
      status: true,
    });
		
		 
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Database error', status: false }, { status: 500 });
  }
}




/*

 
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

import {  Attachment } from '@/types/post';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});


//export const dynamic = 'force-dynamic';

function getExtension(mime: string) {
  return mime.split('/')[1];
}


export async function POST(req: NextRequest) {
  try {
    
		// post form data
		const formData = await req.formData();
		
		//get directory or folder
		const postsDir = path.join(process.cwd(), 'public/vendor/posts');
		const thumbnailsDir = path.join(process.cwd(), 'public/vendor/post_video_thumbnail');

    // ? Create folder if not exists
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }
		if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }
		
		
		const rowNo = Date.now();  

    let index = 0;
    let lastWasVideo = false;
    let lastVideoBaseName = '';

    const savedFiles = [];
		
		// for (const [_, value] of formData.entries()) {
		
		for (const value of formData.values()) {

      if (!(value instanceof File)) continue;

      const ext = getExtension(value.type);
      const baseFileName = `post_file_${rowNo}_${index}`;
      const buffer = Buffer.from(await value.arrayBuffer());

      if (value.type.startsWith('video/')) 
			{
        // ?? Save video in posts folder
        const savePath = path.join(postsDir, `${baseFileName}.${ext}`);
        fs.writeFileSync(savePath, buffer);
        savedFiles.push({ type: 'video', fileName: `${baseFileName}.${ext}` });

        lastWasVideo = true;
        lastVideoBaseName = baseFileName;
      } 
			else if (lastWasVideo) 
			{
        // ??? Save image as thumbnail for previous video
        const savePath = path.join(thumbnailsDir, `${lastVideoBaseName}.${ext}`);
        fs.writeFileSync(savePath, buffer);
       // savedFiles.push({ type: 'thumbnail', fileName: `${lastVideoBaseName}.${ext}` });

        lastWasVideo = false;
      } else {
        // ?? Save image normally
        const savePath = path.join(postsDir, `${baseFileName}.${ext}`);
        fs.writeFileSync(savePath, buffer);
        savedFiles.push({ type: 'image', fileName: `${baseFileName}.${ext}` });
      }

      index++;
    }
		 
		// Insert into DB
    const insertQuery = `
      INSERT INTO posts (attachment)
      VALUES ($1)
      RETURNING *;
    `;
    
		await pool.query(insertQuery, [JSON.stringify(savedFiles)]);
    //const newPost = result.rows[0];
		
    return NextResponse.json({ message: 'Post created successfully' , status: true});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error,  status: false }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const direction = searchParams.get('direction') || 'next';
  const limit = 20;

  const comparisonOperator = direction === 'next' ? '>' : '<';
  const orderDirection = direction === 'next' ? 'ASC' : 'DESC';

  const query = `
    SELECT * FROM posts
    WHERE $1::int IS NULL OR id ${comparisonOperator} $1
    ORDER BY id ${orderDirection}
    LIMIT $2
  `;

  const values = [cursor ? parseInt(cursor) : null, limit];

  try {
    const result = await pool.query(query, values);
    const posts = result.rows;

    // Reverse if direction is 'prev' to maintain ascending order in UI
    if (direction === 'prev') posts.reverse();

    const mappedPosts = posts.map((post) => {
      const basePath = '/vendor/posts/';
      const thumbPath = '/vendor/post_video_thumbnail/';
      const mappedAttachments = post.attachment.map((att: Attachment) => {
        const updated  = {
          ...att,
          fileName: `${basePath}${att.fileName}`,
        };
        if (att.type === 'video') {
          const nameWithoutExt = att.fileName.split('.').slice(0, -1).join('.');
          updated.thumbnail = `${thumbPath}${nameWithoutExt}.jpg`;
        }
        return updated;
      });
			
			const formattedDate = new Date(post.created_at).toLocaleDateString('en-GB', {
				day: '2-digit',
				month: 'long', // "May"
				year: 'numeric',
			});
			
      return {
        id: post.id,
        attachment: mappedAttachments,
        created_at: formattedDate,
      };
    });

    const nextCursor = posts.length ? posts[posts.length - 1].id : null;
    const prevCursor = posts.length ? posts[0].id : null;

    // Check if more posts exist
    const hasNextQuery = `
      SELECT 1 FROM posts
      WHERE id > $1
      LIMIT 1
    `;
    const hasPrevQuery = `
      SELECT 1 FROM posts
      WHERE id < $1
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
      posts: mappedPosts,
      nextCursor,
      prevCursor,
      hasNext,
      hasPrev,
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}



*/
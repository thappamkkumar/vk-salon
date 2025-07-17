 
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

import { Post, Attachment } from '@/types/posts';

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
		
		 for (const [_, value] of formData.entries()) {
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
    const result = await pool.query(insertQuery, [JSON.stringify(savedFiles)]);
    const newPost = result.rows[0];
		
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
    let posts = result.rows;

    // Reverse if direction is 'prev' to maintain ascending order in UI
    if (direction === 'prev') posts.reverse();

    const mappedPosts = posts.map((post: any) => {
      const basePath = '/vendor/posts/';
      const thumbPath = '/vendor/post_video_thumbnail/';
      const mappedAttachments = post.attachment.map((att: any) => {
        const updated: any = {
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
      hasNext = nextRes.rowCount > 0;
    }

    if (prevCursor !== null) {
      const prevRes = await pool.query(hasPrevQuery, [prevCursor]);
      hasPrev = prevRes.rowCount > 0;
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

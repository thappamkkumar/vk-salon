import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

//export const dynamic = 'force-dynamic';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (request.method !== 'DELETE') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const postId = parseInt(params.id, 10);

  if (isNaN(postId)) {
    return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
  }

  try {
    const { rows } = await pool.query('SELECT attachment FROM posts WHERE id = $1', [postId]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const attachments = Array.isArray(rows[0].attachment) ? rows[0].attachment : [];

    const deletePromises = attachments.map(async (file) => {
      try {
        const filePath = path.resolve('public/vendor/posts', file.fileName);
        await unlink(filePath);
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
      }

      if (file.type === 'video') {
        try {
          const baseName = path.parse(file.fileName).name;
          const thumbnailPath = path.resolve('public/vendor/post_video_thumbnail', `${baseName}.jpg`);
          await unlink(thumbnailPath);
        } catch (err) {
          if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
        }
      }
    });

    await Promise.all(deletePromises);

    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);

    return NextResponse.json({ message: 'Post and associated files deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Server error:', error instanceof Error ? error.stack : error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

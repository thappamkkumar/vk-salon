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
  const limit = 20;

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('id', { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!posts) return NextResponse.json({ posts: [] });

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

    return NextResponse.json({ posts: mappedPosts, status: true });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Database error', status: false }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (req.method !== "DELETE") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }

  try {
    // 1?? Fetch attachments for this post
    const { data: postData, error: fetchError } = await supabase
      .from("posts")
      .select("attachment")
      .eq("id", postId)
      .single();

    if (fetchError || !postData) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const attachments = Array.isArray(postData.attachment)
      ? postData.attachment
      : [];

    // 2?? Delete files from Supabase Storage
    const deletePromises = attachments.map(async (file: { fileName: string; type: string }) => {
      // Images & videos stored in `posts` bucket
      const { error: deleteError } = await supabase.storage
        .from("posts")
        .remove([file.fileName]);

      if (deleteError) {
        console.error("File delete error:", deleteError);
      }

      // If it's a video, also delete its thumbnail
      if (file.type === "video") {
        const baseName = file.fileName.split(".")[0];
        const { error: thumbError } = await supabase.storage
          .from("post_video_thumbnail")
          .remove([`${baseName}.jpg`]);

        if (thumbError) {
          console.error("Thumbnail delete error:", thumbError);
        }
      }
    });

    await Promise.all(deletePromises);

    // 3?? Delete post record from Supabase DB
    const { error: dbError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (dbError) {
      console.error("DB delete error:", dbError);
      return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Post and files deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

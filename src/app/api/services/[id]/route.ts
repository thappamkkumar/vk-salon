import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const serviceId = Number(id);

  if (isNaN(serviceId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    // Fetch service row
    const { data: service, error: fetchError } = await supabase
      .from("services")
      .select("image")
      .eq("id", serviceId)
      .single();

    if (fetchError || !service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Delete image from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("services")
      .remove([service.image]);

    if (storageError) {
      console.error("Failed to delete image from storage:", storageError);
      // Continue anyway to remove DB record
    }

    // Delete DB record
    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (deleteError) {
      console.error("DB delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete service" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Service deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting service:", err);
    return NextResponse.json(
      { error: `Failed to delete service: ${err}` },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer"; // Supabase config

// -------------------- Helper: Fetch Services --------------------
async function fetchServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;

  // Generate signed URLs for private images
  const mappedServices = await Promise.all(
    (data || []).map(async (service) => {
      const { data: signed, error: signedError } = await supabase.storage
        .from("services")
        .createSignedUrl(service.image, 60 * 60); // 1 hour

      const fileUrl = !signedError && signed?.signedUrl ? signed.signedUrl : "";

      return {
        id: service.id,
        title: service.title,
        price: service.price,
        image: fileUrl,
      };
    })
  );

  return mappedServices;
}

// -------------------- Helper: Fetch Contact --------------------
async function fetchContact() {
  const { data, error } = await supabase
    .from("contact")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  if (!data || data.length === 0) return {};

  const contact = data[0];
  return {
    id: contact.id,
    address: contact.address,
    address_url: contact.address_url,
    phone_number: contact.phone_number,
    email: contact.email,
    instagram_url: contact.instagram_url,
    youtube_url: contact.youtube_url,
    facebook_url: contact.facebook_url,
  };
}

// -------------------- Helper: Fetch Barbers --------------------
async function fetchBarbers() {
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;

  const mappedBarbers = await Promise.all(
    (data || []).map(async (barber) => {
      const { data: signed, error: signedError } = await supabase.storage
        .from("barbers")
        .createSignedUrl(barber.image, 60 * 60);

      const fileUrl = !signedError && signed?.signedUrl ? signed.signedUrl : "";

      return {
        id: barber.id,
        name: barber.name,
        contact: barber.contact,
        experience: barber.experience,
        image: fileUrl,
      };
    })
  );

  return mappedBarbers;
}

// -------------------- Helper: Fetch Reviews --------------------
async function fetchReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;

  const mappedReviews = await Promise.all(
    (data || []).map(async (review) => {
      const { data: signed, error: signedError } = await supabase.storage
        .from("reviews")
        .createSignedUrl(review.image, 60 * 60);

      const fileUrl = !signedError && signed?.signedUrl ? signed.signedUrl : "";

      return {
        id: review.id,
        name: review.name,
        address: review.address,
        rating: review.rating,
        message: review.message,
        image: fileUrl,
      };
    })
  );

  return mappedReviews;
}

// -------------------- API Handler --------------------
export async function GET(): Promise<NextResponse> {
  try {
    const [services, contact, barbers, reviews] = await Promise.all([
      fetchServices(),
      fetchContact(),
      fetchBarbers(),
      fetchReviews(),
    ]);

    return NextResponse.json({
      services,
      contact,
      barbers,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching barber shop data:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

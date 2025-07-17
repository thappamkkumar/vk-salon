import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// --- Helper function to fetch services ---
async function fetchServices() {
  const query = `
    SELECT * FROM services
    ORDER BY created_at DESC
    LIMIT 10
  `;
  const result = await pool.query(query);

  return result.rows.map((service: any) => { 
    return {
      id: service.id,
      title: service.title,
      price: service.price,
      image: `/vendor/services/${service.image}`,
       
    };
  });
}

// --- Helper function to fetch contact info ---
async function fetchContact() {
  const query = `
    SELECT * FROM contact
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query);

  if (result.rows.length === 0) return {};

  const contact = result.rows[0];
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


// --- Helper function to fetch barbers info ---
async function fetchBarbers() {
  const query = `
    SELECT * FROM barbers
    ORDER BY created_at DESC
    LIMIT 10
  `;
  const result = await pool.query(query);


  return result.rows.map((barber: any) => {
     

    return {
      id: barber.id,
			name: barber.name,
			contact: barber.contact,
			experience: barber.experience, 
			image: `/vendor/barbers/${barber.image}`, 
    };
  });
}


// --- Helper function to fetch reviews info ---
async function fetchReviews() {
  const query = `
    SELECT * FROM reviews
    ORDER BY created_at DESC
    LIMIT 10
  `;
  const result = await pool.query(query);


  return result.rows.map((review: any) => {
      
    return {
			id: review.id,
			name: review.name, 
			address: review.address, 
			rating: review.rating, 
			message: review.message,  
			image: `/vendor/reviews/${review.image}`,
		 
    };
  });
}




// --- API Route Handler ---
export async function GET(req: NextRequest): Promise<NextResponse> {
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
    console.error(error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

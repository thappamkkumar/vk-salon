import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// --- Utility validation functions ---
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  return /^\d{10,15}$/.test(phone);
}

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// --- PUT: Insert or update contact ---
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();

    const contactFields = {
      address: formData.get('address')?.toString().trim() || '',
      address_url: formData.get('address_url')?.toString().trim() || '',
      phone_number: formData.get('phone_number')?.toString().trim() || '',
      email: formData.get('email')?.toString().trim() || '',
      instagram_url: formData.get('instagram_url')?.toString().trim() || null,
      youtube_url: formData.get('youtube_url')?.toString().trim() || null,
      facebook_url: formData.get('facebook_url')?.toString().trim() || null,
    };

    // --- Validation ---
    if (!contactFields.address)
      return NextResponse.json({ error: 'Address is required.' }, { status: 400 });

    if (!isValidPhone(contactFields.phone_number))
      return NextResponse.json({ error: 'Phone number is invalid.' }, { status: 400 });

    if (!isValidEmail(contactFields.email))
      return NextResponse.json({ error: 'Email is invalid.' }, { status: 400 });

    if (!isValidUrl(contactFields.address_url))
      return NextResponse.json({ error: 'Address URL is invalid.' }, { status: 400 });

    // --- Check if contact exists ---
    const existing = await pool.query(`SELECT id FROM contact ORDER BY created_at DESC LIMIT 1`);

    if (existing.rowCount === 0) {
      // --- Insert new contact ---
      const insertQuery = `
        INSERT INTO contact
          (address, address_url, phone_number, email, instagram_url, youtube_url, facebook_url, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `;

      const insertValues = Object.values(contactFields);

      const result = await pool.query(insertQuery, insertValues);
      return NextResponse.json({ contact: result.rows[0] });
    } else {
      // --- Update existing contact ---
      const contactId = existing.rows[0].id;

      const updateQuery = `
        UPDATE contact SET
          address = $1,
          address_url = $2,
          phone_number = $3,
          email = $4,
          instagram_url = $5,
          youtube_url = $6,
          facebook_url = $7,
          updated_at = NOW()
        WHERE id = $8
        RETURNING *
      `;

      const updateValues = [...Object.values(contactFields), contactId];

      const result = await pool.query(updateQuery, updateValues);
      return NextResponse.json({ contact: result.rows[0] });
    }
  } catch (error) {
    console.error('PUT /api/admin/contact error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// --- GET: Retrieve latest contact ---
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const query = `SELECT * FROM contact ORDER BY created_at DESC LIMIT 1`;
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'No contact information found' }, { status: 404 });
    }

    const {
      id,
      address,
      address_url,
      phone_number,
      email,
      instagram_url,
      youtube_url,
      facebook_url,
    } = result.rows[0];

    const contact = {
      id,
      address,
      address_url,
      phone_number,
      email,
      instagram_url,
      youtube_url,
      facebook_url,
    };

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('GET /api/admin/contact error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

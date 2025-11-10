 








import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseServer';

// -------------------- POST --------------------
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fullName = formData.get('fullName')?.toString().trim();
    const phoneNumber = formData.get('phoneNumber')?.toString().trim();
    const message = formData.get('message')?.toString().trim();

    if (!fullName || !phoneNumber || !message) {
      return NextResponse.json(
        { message: 'Missing required fields', status: false },
        { status: 400 }
      );
    }

    if (!/^\d{10,}$/.test(phoneNumber)) {
      return NextResponse.json(
        { message: 'Phone number must have at least 10 digits.', status: false },
        { status: 400 }
      );
    }

    // ? Insert into Supabase
    const { error } = await supabase
      .from('appointments')
      .insert([
        {
          name: fullName,
          phone_number: phoneNumber,
          message,
        },
      ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { message: 'Failed to save appointment', status: false },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Appointment message saved successfully',
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving appointment:', error);
    return NextResponse.json(
      { message: 'Internal server error', status: false },
      { status: 500 }
    );
  }
}

// -------------------- GET --------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const direction = searchParams.get('direction') || 'next';
    const limit = 20;

    // ? Fetch paginated data from Supabase
    let query = supabase
      .from('appointments')
      .select('*')
      .order('id', { ascending: direction === 'prev' })
      .limit(limit);

    if (cursor) {
      query = query.filter(
        'id',
        direction === 'next' ? 'lt' : 'gt',
        parseInt(cursor)
      );
    }

    const { data: appointmentData, error } = await query;

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!appointmentData) {
      return NextResponse.json({
        appointment: [],
        hasNext: false,
        hasPrev: false,
      });
    }

    // Format date
    const mappedAppointmentData = appointmentData.map((appointment) => {
      const formattedDate = new Date(appointment.created_at).toLocaleDateString(
        'en-GB',
        {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }
      );

      return {
        id: appointment.id,
        name: appointment.name,
        phone_number: appointment.phone_number,
        message: appointment.message,
        created_at: formattedDate,
      };
    });

    // Determine cursors
    const nextCursor =
      mappedAppointmentData.length > 0
        ? mappedAppointmentData[mappedAppointmentData.length - 1].id
        : null;
    const prevCursor =
      mappedAppointmentData.length > 0
        ? mappedAppointmentData[0].id
        : null;

    // ? Check for next/prev availability
    let hasNext = false;
    let hasPrev = false;

    if (nextCursor) {
      const { count: nextCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .lt('id', nextCursor);
      hasNext = (nextCount ?? 0) > 0;
    }

    if (prevCursor) {
      const { count: prevCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gt('id', prevCursor);
      hasPrev = (prevCount ?? 0) > 0;
    }

    // Return final paginated data
    return NextResponse.json({
      appointment: mappedAppointmentData,
      nextCursor,
      prevCursor,
      hasNext,
      hasPrev,
    });
  } catch (error) {
    console.error('GET route error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}




/*
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

 
	
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fullName = formData.get('fullName')?.toString().trim();
    const phoneNumber = formData.get('phoneNumber')?.toString().trim();
    const message = formData.get('message')?.toString().trim();

    if (!fullName || !phoneNumber || !message) {
      return NextResponse.json(
        { message: 'Missing required fields', status: false },
        { status: 400 }
      );
    }

    if (!/^\d{10,}$/.test(phoneNumber)) {
      return NextResponse.json(
        { message: 'Phone number must have at least 10 digits.', status: false },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO appointments (name, phone_number, message)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    await pool.query(insertQuery, [fullName, phoneNumber, message]);

    return NextResponse.json(
      {
        message: 'Appointment message saved successfully',
        status: true,
         
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving appointment:', error);
    return NextResponse.json(
      { message: 'Internal server error', status: false },
      { status: 500 }
    );
  }
}
	
	
export async function GET(req: NextRequest): Promise<NextResponse>
{
   
		const { searchParams } = new URL(req.url);
		const cursor = searchParams.get('cursor'); // ID to paginate
		const direction = searchParams.get('direction') || 'next'; // 'next' or 'prev'
		const limit = 20;
		
		const query = `
			SELECT * FROM appointments
			WHERE $1::int IS NULL OR 
				${direction === 'next' ? 'id < $1' : 'id > $1'}
			ORDER BY id ${direction === 'next' ? 'DESC' : 'ASC'}
			LIMIT $2
		`;
		
		const values = [cursor ? parseInt(cursor) : null, limit];
		
    
   
		try 
		{
			const result = await pool.query(query, values);
			const appointmentData = result.rows;

			// For prev, reverse the order to maintain consistency
			if (direction === 'prev') appointmentData.reverse();
			
			const mappedAppointmentData = appointmentData.map((appointment) => {
				const formattedDate = new Date(appointment.created_at).toLocaleDateString('en-GB', {
					day: '2-digit',
					month: 'long', // "May"
					year: 'numeric',
				});

				return {
					id: appointment.id,
					name: appointment.name, 
					phone_number: appointment.phone_number, 
					message: appointment.message,   
					created_at: formattedDate,
				};
			});
			
			
			const nextCursor = appointmentData.length ? appointmentData[appointmentData.length - 1].id : null;
			const prevCursor = appointmentData.length ? appointmentData[0].id : null;

			// Check for hasNext and hasPrev
			const hasNextQuery = `
				SELECT 1 FROM appointments
				WHERE id < $1
				LIMIT 1
			`;

			const hasPrevQuery = `
				SELECT 1 FROM appointments
				WHERE id > $1
				LIMIT 1
			`;

			let hasNext = false;
			let hasPrev = false;
			
			if (nextCursor !== null) {
				const nextRes = await pool.query(hasNextQuery, [nextCursor]);
				hasNext = (nextRes.rowCount ?? 0)  > 0;
			}

			if (prevCursor !== null) {
				const prevRes = await pool.query(hasPrevQuery, [prevCursor]);
				hasPrev = (prevRes.rowCount ?? 0)  > 0;
			}

			return NextResponse.json({
				appointment: mappedAppointmentData,
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
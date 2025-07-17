'use client';

//import Link from 'next/link';
//import { FaPlus } from 'react-icons/fa';

export default function AdminAppointmentPageHeader() {
  return (
    <header className="flex justify-between items-center  ">
      <h1 className="text-xl md:text-2xl xl:text-4xl font-bold">
        Appointments
      </h1>

      {/*<Link
        href="/admin/barbers/addNewBarber"
        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded transition"
      >
        <FaPlus />
        New Barber
      </Link>*/}
    </header>
  );
}

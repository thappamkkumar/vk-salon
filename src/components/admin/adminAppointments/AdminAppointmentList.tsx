'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useContextState } from '@/context/contextState';
import { FaEllipsisV, FaInfoCircle, FaTrash,FaPhone } from 'react-icons/fa';
import { Appointment } from '@/types/appointment';
import ConfirmDialog from '@/components/alertBox/ConfirmDialog';

type Props = {
  appointmentList: Appointment[];
  onDelete: (id: number) => void;
  selectAppointment: (index: number) => void;
};

const AdminAppointmentList = ({ appointmentList, onDelete, selectAppointment }: Props) => {
  const { setDeleting, setMessageBox } = useContextState();

  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (id: number) => {
    try 
		{
      setDeleting(true);
			if (id === null) return; 
			
			const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/appointments/${id}`);
			const res = await fetch(url.toString(), { method: 'DELETE' });

			 
       //console.log(res.json());
       if (res.ok) {
				setMessageBox({
          message: 'Appointment deleted successful!',
          type: 'success',
        });
        onDelete(id);  
     } else {
       // console.error('Failed to delete');
				setMessageBox({
					message: 'Failed to delete.',
					type: 'error',
				});
      }
        
 
       
    } catch (err) {
      //console.error('Delete error:', err);
      setMessageBox({
					message: 'Error deleting appointment.',
					type: 'error',
				});
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  return (
    <div className="relative   ">
      <table className="min-w-full border border-gray-200 whitespace-nowrap">
        <thead className="bg-gray-100 text-lg text-left">
          <tr>
            <th className="p-2 border">ID</th> 
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Phone Number</th>
            <th className="p-2 border">Message</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
				
        <tbody className="text-md">
          {appointmentList.map((appointment, index) => (
            <tr key={appointment.id} className="relative">
              <td className="p-2 border">{index + 1}</td> 
              <td className="p-2 border  ">{appointment.name}</td>
              <td className="p-2 border  ">
								<div className="flex gap-3">
									<p className="text-lg font-medium text-gray-800">{appointment.phone_number}</p>
									<a
											href={`tel:${appointment.phone_number}`}
											className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-full transition"
										>
											<FaPhone className="mr-2" /> Call
									</a>
								</div> 
							</td>
              <td className="p-2 border  ">{appointment.message}</td>
              <td className="p-2 border  ">{appointment.created_at}</td>
              <td className="p-2 border ">
								<div className="relative    inline-block  ">
									<button
											className="p-1 bg-gray-200 rounded cursor-pointer  hover:bg-gray-300"
											onClick={() =>
												setOpenDropdownId(openDropdownId === appointment.id ? null : appointment.id)
											}
									>
										<FaEllipsisV />
									</button>
										 
									{openDropdownId === appointment.id && (
										<div
											ref={dropdownRef}
											className={`absolute  right-0  
											${appointmentList.length ==index+1 ? 'bottom-full -translate-y-2' : 'top-full translate-y-2'}		 
											w-36 bg-white border border-gray-300 rounded shadow-lg z-50`}
										>
											<button
												className="flex items-center w-full px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
												onClick={() => {
													selectAppointment(index);
													setOpenDropdownId(null);
												}}
											>
												<FaInfoCircle className="mr-2" /> Detail
											</button> 
											 
											<button
												className="flex items-center w-full px-4 py-2 text-left text-red-600 cursor-pointer hover:bg-gray-100"
												onClick={() => {
													setConfirmId(appointment.id);
													setOpenDropdownId(null);
												}}
											>
												<FaTrash className="mr-2" /> Delete
											</button>
											
											
										</div>
									)}
								</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmId !== null}
        message="Are you sure you want to delete this appointment?"
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
};

export default AdminAppointmentList;

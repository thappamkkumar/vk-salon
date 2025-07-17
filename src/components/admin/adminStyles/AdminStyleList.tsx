'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useContextState } from '@/context/contextState';
import { FaEllipsisV, FaInfoCircle, FaTrash } from 'react-icons/fa';
import { Style } from '@/types/styles';
import ConfirmDialog from '@/components/alertBox/ConfirmDialog';

type Props = {
  styleList: Style[];
  onDelete: (id: number) => void;
  selectStyle: (id: number) => void;
};

const AdminStyleList = ({ styleList, onDelete, selectStyle }: Props) => {
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
			
			const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/styles/${id}`);
			const res = await fetch(url.toString(), { method: 'DELETE' });

			 
       //console.log(res.json());
       if (res.ok) {
				setMessageBox({
          message: 'Style deleted successful!',
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
					message: 'Error deleting style.',
					type: 'error',
				});
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  return (
    <div className="relative max-w-200 mx-auto">
      <table className="min-w-full border border-gray-200 whitespace-nowrap">
        <thead className="bg-gray-100 text-lg text-left">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Image</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody className="text-md">
          {styleList.map((style, index) => (
            <tr key={style.id} className="relative">
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">
								<div className="relative w-[40px] h-[40px] rounded shadow-[5px_5px_10px_-3px_rgba(0,0,0,0.6)] hover:opacity-50  overflow-hidden cursor-pointer" onClick={() => selectStyle(index)}>
									<Image
										src={style.image}
										alt={`Style ${style.id}`}
										fill
										className="object-cover"
										sizes="50px"
										priority={true}
									/>
								</div>
              </td>
              <td className="p-2 border  ">{style.created_at}</td>
              <td className="p-2 border  ">
								<div className="relative    inline-block  ">
                 
										<button
											className="p-1 bg-gray-200 rounded cursor-pointer  hover:bg-gray-300"
											onClick={() =>
												setOpenDropdownId(openDropdownId === style.id ? null : style.id)
											}
										>
											<FaEllipsisV />
											 
										</button>
										 
									{openDropdownId === style.id && (
										<div
											ref={dropdownRef}
											className={`absolute  right-0  
											${styleList.length ==index+1 ? 'bottom-full -translate-y-2' : 'top-full translate-y-2'}		 
											w-36 bg-white border border-gray-300 rounded shadow-lg z-50`}
										>
											<button
												className="flex items-center w-full px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
												onClick={() => {
													selectStyle(index);
													setOpenDropdownId(null);
												}}
											>
												<FaInfoCircle className="mr-2" /> Detail
											</button>
											<hr className="border-gray-300" />
											<button
												className="flex items-center w-full px-4 py-2 text-left text-red-600 cursor-pointer hover:bg-gray-100"
												onClick={() => {
													setConfirmId(style.id);
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
        message="Are you sure you want to delete this style?"
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
};

export default AdminStyleList;

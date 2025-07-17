'use client';
 
import { FaTimes, FaPhone   } from 'react-icons/fa'; 
import { Appointment,   } from '@/types/appointment';

type Props = {
  appointment: Appointment; 
  setSelectedAppointmentIndex: (index: number) => void;
};

const AdminAppointmentCard = ({ appointment,   setSelectedAppointmentIndex }: Props) => {
	
	
	const onClose = () =>{  
		setSelectedAppointmentIndex(null);  
	}	
	
	return(
		<div className="fixed inset-0 z-110 bg-black/90 flex items-center justify-center">
			
			{/* Close */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white text-xl lg:text-3xl p-2 bg-black/90 rounded-full z-111 shadow-[0px_0px_10px_1px_rgba(255,255,255,0.4)] hover:shadow-white/30 hover:text-white/60 cursor-pointer transition duration-300"
        aria-label="Close"
      >
        <FaTimes />
      </button>

			<div className="bg-white border border-gray-200 rounded-2xl shadow-lg w-full max-w-2xl mx-auto p-6 sm:p-8 space-y-6">
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 border-b pb-4">
          Appointment Details
        </h2>

        {/* Info */}
        <div className="space-y-4 text-center sm:text-left">
          <div>
            <p className="text-sm text-gray-500 uppercase">Name</p>
            <p className="text-lg font-medium text-gray-800">{appointment.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 uppercase">Phone Number</p>
						<div className="flex gap-3">
							<p className="text-lg font-medium text-gray-800">{appointment.phone_number}</p>
							
							<a
									href={`tel:${appointment.phone_number}`}
									className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-full transition"
								>
									<FaPhone className="mr-2" /> Call
							</a>
						</div>
          </div>

          <div>
            <p className="text-sm text-gray-500 uppercase">Message</p>
            <p className="text-lg italic text-gray-700">“{appointment.message}”</p>
          </div>
        </div>
			</div>
				
		</div>
	);

}

export default AdminAppointmentCard;
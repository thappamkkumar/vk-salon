// app/components/home/AppointmentSection.tsx

import AppointmentContact  from './AppointmentContact';
import AppointmentMessageForm  from './AppointmentMessageForm';
import { FaMapMarkerAlt, FaPhone, FaEnvelope  } from 'react-icons/fa';

import {  Contact} from '@/types/contact';
 


export default  function AppointmentSection({
contact
}:{
contact:Contact;
}) {
  

  return (
	
    <section className=" w-full py-18 px-4 md:px-5 lg:px-8 xl:px-15  " id="appointment">
      <div className="w-full   text-center  text-xl lg:text-4xl text-black bg-yellow-500 p-3 rounded-lg font-bold">
        Open :- 09:00 AM - 09:00 PM
      </div>
			
			<div className=" md:flex mt-8">
				<AppointmentContact contact={contact} />
				
				<div className="w-full lg:w-[60%]   ">
					<AppointmentMessageForm />
				</div>
			</div>
      
    </section>
  );
}

 
'use client';
import {useState} from 'react';
import AdminAppointmentPageHeader from './AdminAppointmentPageHeader';
import AdminAppointmentList from './AdminAppointmentList';
import AdminAppointmentCard from './AdminAppointmentCard';
import PaginationControls from '@/components/pagination/PaginationControls';
import Spinner from '@/components/loader/Spinner';
 
import { Appointment, AppointmentResponse } from '@/types/appointment';
import { fetchAppointment } from '@/lib/fetch/getAppointments';




export default function AdminAppointmentListClient({
  initialAppointmentData,
}: {
  initialAppointmentData: AppointmentResponse;
}) {

	const [appointmentList, setAppointmentList] = useState<Appointment[]>(initialAppointmentData.appointment);
  const [nextCursor, setNextCursor] = useState<number | null>(initialAppointmentData.nextCursor);
  const [prevCursor, setPrevCursor] = useState<number | null>(initialAppointmentData.prevCursor);
  const [hasNext, setHasNext] = useState(initialAppointmentData.hasNext);
  const [hasPrev, setHasPrev] = useState(initialAppointmentData.hasPrev);
	const [loading, setLoading] = useState(false); // ?? New loading state
	const [selectedAppointmentIndex, setSelectedAppointmentIndex] = useState<number | null>(null);
 
	const fetchData = async (cursor: number | null = null, direction: 'next' | 'prev' = 'next') =>{
		try 
		{
			setLoading(true);
			const  data :AppointmentResponse = await fetchAppointment(cursor, direction);
			
			//console.log(data);
			
			setAppointmentList(data.appointment);
      setNextCursor(data.nextCursor);
      setPrevCursor(data.prevCursor);
      setHasNext(data.hasNext);
      setHasPrev(data.hasPrev);
      setSelectedAppointmentIndex(null);
			
			// ? Scroll to top after new data is loaded
			window.scrollTo({ top: 0, behavior: 'smooth' });
			
			
			
		} catch (error) {
     // console.error('Pagination fetch error:', error);
    }finally {
      setLoading(false); // End loading
    }
	}
	
	const onDelete = (id: number)=>{
		setAppointmentList(prev => prev.filter(app => app.id !== id));
	}
	
	const selectAppointment = (index: number)=>{
		setSelectedAppointmentIndex(index);
		 
	}
	
  return (
    <>
      <AdminAppointmentPageHeader />
     
			<div className="py-10 overflow-auto">
				{
					loading ? 
					(
						<Spinner />
					) : 
					(
						< >
							
							{
								appointmentList.length === 0
								?
									<div className="text-center col-span-full py-10 text-gray-500">
										No appointment available at the moment.
									</div>
								:
									 <AdminAppointmentList appointmentList={appointmentList} onDelete={onDelete} selectAppointment={selectAppointment} />

						
							}
							
							{
								(hasNext || hasPrev)
								&&
								<PaginationControls
									onPrev={() => fetchData(prevCursor, 'prev')}
									onNext={() => fetchData(nextCursor, 'next')}
									hasPrev={hasPrev}
									hasNext={hasNext}
								/>	
							}
						</>
					)
					
				}
			</div>
			
			{selectedAppointmentIndex !== null && (
				 <AdminAppointmentCard
				  appointment={appointmentList[selectedAppointmentIndex]}
					setSelectedAppointmentIndex={setSelectedAppointmentIndex}
				 />
			)}
					
					
    </>
  ); 
	 
}

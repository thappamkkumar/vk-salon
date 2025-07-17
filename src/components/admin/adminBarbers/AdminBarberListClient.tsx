 
'use client';
import {useState} from 'react';
import AdminBarberPageHeader from './AdminBarberPageHeader';
import AdminBarberList from './AdminBarberList';
import PaginationControls from '@/components/pagination/PaginationControls';
import Spinner from '@/components/loader/Spinner';
import StyleCarousel from '@/components/styles/StyleCarousel';

import { Barber, BarberResponse } from '@/types/barbers';
import { fetchBarber } from '@/lib/fetch/getBarbers';




export default function AdminBarberListClient({
  initialBarberData,
}: {
  initialBarberData: BarberResponse;
}) {

	const [barberList, setBarberList] = useState<Barber[]>(initialBarberData.barbers);
  const [nextCursor, setNextCursor] = useState<number | null>(initialBarberData.nextCursor);
  const [prevCursor, setPrevCursor] = useState<number | null>(initialBarberData.prevCursor);
  const [hasNext, setHasNext] = useState(initialBarberData.hasNext);
  const [hasPrev, setHasPrev] = useState(initialBarberData.hasPrev);
	const [loading, setLoading] = useState(false); // ?? New loading state
	const [selectedBarberIndex, setSelectedBarberIndex] = useState<number | null>(null);
  

	const fetchData = async (cursor: number | null = null, direction: 'next' | 'prev' = 'next') =>{
		try 
		{
			setLoading(true);
			const  data :BarberResponse = await fetchBarber(cursor, direction);
			
			//console.log(data);
			
			setBarberList(data.barbers);
      setNextCursor(data.nextCursor);
      setPrevCursor(data.prevCursor);
      setHasNext(data.hasNext);
      setHasPrev(data.hasPrev);
      setSelectedBarberIndex(null);
			
			// ? Scroll to top after new data is loaded
			window.scrollTo({ top: 0, behavior: 'smooth' });
			
			
			
		} catch (error) {
     // console.error('Pagination fetch error:', error);
    }finally {
      setLoading(false); // End loading
    }
	}
	
	const onDelete = (id: number)=>{
		setBarberList(prev => prev.filter(barber => barber.id !== id));
	}
	
	const selectBarber = (index: number)=>{
		setSelectedBarberIndex(index);
		 
	}
	
  return (
    <>
      <AdminBarberPageHeader />
     
			<div className="py-10 overflow-auto">
				{
					loading ? 
					(
						<Spinner />
					) : 
					(
						< >
							
							{
								barberList.length === 0
								?
									<div className="text-center col-span-full py-10 text-gray-500">
										No barber available at the moment.
									</div>
								:
									 <AdminBarberList barberList={barberList}  onDelete={onDelete} selectBarber={selectBarber} />
						
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
			
			{selectedBarberIndex !== null && (
				<StyleCarousel  
					styleList={barberList}
					styleIndex={selectedBarberIndex}
					setSelectedStyleIndex={setSelectedBarberIndex}
				/>
			)}
					
					
    </>
  ); 
	 
}

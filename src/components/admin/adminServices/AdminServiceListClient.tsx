 
'use client';
import {useState} from 'react';

import AdminServicesList from './AdminServicesList';
import AdminServicesPageHeader from './AdminServicesPageHeader'; 
import PaginationControls from '@/components/pagination/PaginationControls';
import Spinner from '@/components/loader/Spinner';
import StyleCarousel from '@/components/styles/StyleCarousel';
 
import { Service, ServiceResponse } from '@/types/services';
import { fetchServices } from '@/lib/fetch/getServices';




export default function AdminServiceListClient({
  initialServicesData,
}: {
  initialServicesData: StyleResponse;
}) {

	const [serviceList, setServiceList] = useState<Service[]>(initialServicesData.services);
  const [nextCursor, setNextCursor] = useState<number | null>(initialServicesData.nextCursor);
  const [prevCursor, setPrevCursor] = useState<number | null>(initialServicesData.prevCursor);
  const [hasNext, setHasNext] = useState(initialServicesData.hasNext);
  const [hasPrev, setHasPrev] = useState(initialServicesData.hasPrev);
	const [loading, setLoading] = useState(false); // ?? New loading state
	const [selectedServiceIndex, setSelectedServiceIndex] = useState<number | null>(null);
  
 
	const fetchData = async (cursor: number | null = null, direction: 'next' | 'prev' = 'next') =>{
		try 
		{
			setLoading(true);
			const  data :ServiceResponse = await fetchServices(cursor, direction);
			
			//console.log(data);
			
			setServiceList(data.services);
      setNextCursor(data.nextCursor);
      setPrevCursor(data.prevCursor);
      setHasNext(data.hasNext);
      setHasPrev(data.hasPrev);
      setSelectedServiceIndex(null);
      
			// ? Scroll to top after new data is loaded
			window.scrollTo({ top: 0, behavior: 'smooth' });
			
			
			
		} catch (error) {
     // console.error('Pagination fetch error:', error);
    }finally {
      setLoading(false); // End loading
    }
	}
	
	const onDelete = (id: number)=>{
		setServiceList(prev => prev.filter(style => style.id !== id));
	}
	
	const selectService = (index: number)=>{
		setSelectedServiceIndex(index);
	}
	
	 
	
  return (
    <>
      <AdminServicesPageHeader />
     
			<div className="py-10 overflow-auto">
				{
					loading ? 
					(
						<Spinner />
					) : 
					(
						< >
							
							{
								serviceList.length === 0
								?
									<div className="text-center col-span-full py-10 text-gray-500">
										No service available at the moment.
									</div>
								:
									<AdminServicesList serviceList={serviceList} onDelete={onDelete} selectService={selectService} />

						
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
			
			{selectedServiceIndex !== null && (
				<StyleCarousel  
					styleList={serviceList}
					styleIndex={selectedServiceIndex}
					setSelectedStyleIndex={setSelectedServiceIndex}
				/>
			)} 
					
					
    </>
  ); 
	 
}

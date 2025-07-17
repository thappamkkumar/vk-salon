'use client';

import {useState} from 'react';
import Image from 'next/image';

import PaginationControls from '@/components/pagination/PaginationControls';
import Spinner from '@/components/loader/Spinner';
import ServiceCard from './ServiceCard'; 
import StyleCarousel from '@/components/styles/StyleCarousel';
 
import { fetchServices } from '@/lib/fetch/getServices';
import { Service, ServiceResponse } from '@/types/services';


export default function ServiceList({
  initialServicesData,
}: {
  initialServicesData: Service;
}) {
	
	const [serviceList, setServiceList] = useState<Style[]>(initialServicesData.services);
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
	
 
	const selectService = (index: number)=>{
	 
		setSelectedServiceIndex(index);
	}


	return(
		<div className="  px-2 md:px-5 lg:px-8 xl:px-15 pt-5 pb-20 min-h-screen ">
			{
				serviceList.length === 0 ? (
					<div className="text-center col-span-full py-10 text-gray-500">
						No services available at the moment.
					</div>
				) : (
					<>
						<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-10">
							{serviceList.map((service, index) => (
								<div  key={service.id} onClick={()=>selectService(index)}>
									<ServiceCard service={service}   />
								</div>
							))}
						</div>
			
					{
							loading ? 
							(
								<Spinner />
							) : 
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
			
			{selectedServiceIndex !== null && (
				<StyleCarousel  
					styleList={serviceList}
					styleIndex={selectedServiceIndex}
					setSelectedStyleIndex={setSelectedServiceIndex}
				/>
			)} 
		</div>
	
	
	);

}
 
'use client';
import {useState} from 'react';
import AdminStylePageHeader from './AdminStylePageHeader';
import AdminStyleList from './AdminStyleList';
import PaginationControls from '@/components/pagination/PaginationControls';
import Spinner from '@/components/loader/Spinner';
import StyleCarousel from '@/components/styles/StyleCarousel';

import {Style, StyleResponse } from '@/types/styles';
import { fetchStyle } from '@/lib/fetch/getStyles';




export default function AdminStyleListClient({
  initialStyleData,
}: {
  initialStyleData: StyleResponse;
}) {

	const [styleList, setStyleList] = useState<Style[]>(initialStyleData.styles);
  const [nextCursor, setNextCursor] = useState<number | null>(initialStyleData.nextCursor);
  const [prevCursor, setPrevCursor] = useState<number | null>(initialStyleData.prevCursor);
  const [hasNext, setHasNext] = useState(initialStyleData.hasNext);
  const [hasPrev, setHasPrev] = useState(initialStyleData.hasPrev);
	const [loading, setLoading] = useState(false); // ?? New loading state
	const [selectedStyleIndex, setSelectedStyleIndex] = useState<number | null>(null);
  

	const fetchData = async (cursor: number | null = null, direction: 'next' | 'prev' = 'next') =>{
		try 
		{
			setLoading(true);
			const  data :StyleResponse = await fetchStyle(cursor, direction);
			
			//console.log(data);
			
			setStyleList(data.styles);
      setNextCursor(data.nextCursor);
      setPrevCursor(data.prevCursor);
      setHasNext(data.hasNext);
      setHasPrev(data.hasPrev);
      setSelectedStyleIndex(null);
			
			// ? Scroll to top after new data is loaded
			window.scrollTo({ top: 0, behavior: 'smooth' });
			
			
			
		} catch (error) {
     // console.error('Pagination fetch error:', error);
    }finally {
      setLoading(false); // End loading
    }
	}
	
	const onDelete = (id: number)=>{
		setStyleList(prev => prev.filter(style => style.id !== id));
	}
	
	const selectStyle = (id: number)=>{
		setSelectedStyleIndex(id);
		 
	}
	
  return (
    <>
      <AdminStylePageHeader />
     
			<div className="py-10 overflow-auto">
				{
					loading ? 
					(
						<Spinner />
					) : 
					(
						< >
							
							{
								styleList.length === 0
								?
									<div className="text-center col-span-full py-10 text-gray-500">
										No style available at the moment.
									</div>
								:
									<AdminStyleList styleList={styleList} onDelete={onDelete} selectStyle={selectStyle}/>
						
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
			
			{selectedStyleIndex !== null && (
				<StyleCarousel  
					styleList={styleList}
					styleIndex={selectedStyleIndex}
					setSelectedStyleIndex={setSelectedStyleIndex}
				/>
			)}
					
					
    </>
  ); 
	 
}

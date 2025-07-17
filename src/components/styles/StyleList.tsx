'use client';

import { useState } from 'react';
import PaginationControls from '@/components/pagination/PaginationControls';
import Spinner from '@/components/loader/Spinner';
import StyleThumbnail from './StyleThumbnail';
import StyleCarousel from './StyleCarousel';
import {Style, StyleResponse} from '@/types/styles';

import { fetchStyle } from '@/lib/fetch/getStyles'; 

export default function StyleList({
  initialStyleData,
}: {
  initialStyleData: StyleResponse;
}) {

	const [styleList, setStyleList] = useState<Style[]>(initialStyleData.styles);
	const [selectedStyleIndex, setSelectedStyleIndex] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(initialStyleData.hasNext);
  const [hasPrev, setHasPrev] = useState(initialStyleData.hasPrev);
  const [nextCursor, setNextCursor] = useState<number | null>(initialStyleData.nextCursor);
  const [prevCursor, setPrevCursor] = useState<number | null>(initialStyleData.prevCursor);
 	const [loading, setLoading] = useState(false); // ?? New loading state
 
 
console.log(StyleList);
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
	

	return(
		<div className="relative px-2 md:px-5 lg:px-8 xl:px-15 pt-5 py-20 min-h-screen">
			{/*<h2 className="text-[10vw] sm:text-3xl lg:text-3xl xl:text-5xl mb-5">Styles</h2>*/}
			 
			
			{ 
				styleList.length === 0 ? (
					<div className="text-center col-span-full py-10 text-gray-500">
						No style available at the moment.
					</div>
				) : (
				<>
					<div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 pb-10">
						{styleList.map((style, index) => (
							<div key={style.id} className="break-inside-avoid">
								<StyleThumbnail style={style} onClick={() => setSelectedStyleIndex(index)} />	
								 
							</div>
						))}
					</div>

					{selectedStyleIndex !== null && (
						<StyleCarousel  
							styleList={styleList}
							styleIndex={selectedStyleIndex}
							setSelectedStyleIndex={setSelectedStyleIndex}
						/>
					)}

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
			)}
		</div>
	);
	

}
'use client';

import { useState } from 'react';
import PostThumbnail from './PostThumbnail';
import PostAttachmentCarousel from './PostAttachmentCarousel';
import PaginationControls from '@/components/pagination/PaginationControls';
import Spinner from '@/components/loader/Spinner';
import { Post, PostResponse } from '@/types/posts';
import { fetchPosts } from '@/lib/fetch/getPosts';


export default function PostList({
  initialPostData,
}: {
  initialPostData: PostResponse;
}) {
  const [postList, setPostList] = useState<Post[]>(initialPostData.posts);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(initialPostData.hasNext);
  const [hasPrev, setHasPrev] = useState(initialPostData.hasPrev);
	const [nextCursor, setNextCursor] = useState(initialPostData.nextCursor);
  const [prevCursor, setPrevCursor] = useState(initialPostData.prevCursor);
	const [loading, setLoading] = useState(false); // ?? New loading state

   const fetchData = async (cursor: number | null = null, direction: 'next' | 'prev' = 'next') => {
    try 
		{
			setLoading(true);
			const  data :PostResponse = await fetchPosts(cursor, direction);
			
			//console.log(data);
			
			setPostList(data.posts);
      setNextCursor(data.nextCursor);
      setPrevCursor(data.prevCursor);
      setHasNext(data.hasNext);
      setHasPrev(data.hasPrev);
      setSelectedPostIndex(null);
			
			// ? Scroll to top after new data is loaded
			window.scrollTo({ top: 0, behavior: 'smooth' });
			
			
			
		} catch (error) {
      console.error('Pagination fetch error:', error);
    }finally {
      setLoading(false); // End loading
    }
  };

  console.log(postList);
 
   
  return (
		<div className="relative px-2 md:px-5 lg:px-8 xl:px-15 pt-5 pb-20 min-h-screen ">
			
			{
				postList.length === 0 ? (
					<div className="text-center col-span-full py-10 text-gray-500">
						No posts available at the moment.
					</div>
				) : (
					<>
						<div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 pb-10">
						{postList.map((post, index) => (
							<div key={post.id} className="break-inside-avoid">
								<PostThumbnail post={post} onClick={() => setSelectedPostIndex(index)} />
							</div>
						))}
					</div>

						
						{selectedPostIndex !== null && (
							<PostAttachmentCarousel
								postList={postList}
								postIndex={selectedPostIndex}
								setSelectedPostIndex={setSelectedPostIndex}
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
				)
			}
			
			
			 
		</div>
	);

     
}

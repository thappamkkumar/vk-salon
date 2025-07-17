 
'use client';

import {useState} from 'react';
import AdminPostPageHeader from './AdminPostPageHeader';
import AdminPostList from './AdminPostList';
import Spinner from '@/components/loader/Spinner';
import PostAttachmentCarousel from '@/components/posts/PostAttachmentCarousel';
import PaginationControls from '@/components/pagination/PaginationControls';

import { Post, PostResponse } from '@/types/posts';
import { fetchPosts } from '@/lib/fetch/getPosts';

export default function AdminPostListClient({
  initialPostData,
}: {
  initialPostData: PostResponse;
}) {

	const [postList, setPostList] = useState<Post[]>(initialPostData.posts);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [selectedPostAttachmentIndex, setSelectedPostAttachmentIndex] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(initialPostData.hasNext);
  const [hasPrev, setHasPrev] = useState(initialPostData.hasPrev);
  const [nextCursor, setNextCursor] = useState(initialPostData.nextCursor);
  const [prevCursor, setPrevCursor] = useState(initialPostData.prevCursor);
	const [loading, setLoading] = useState(false); // ?? New loading state


 
	
	
		const fetchData = async (cursor: number | null = null, direction: 'next' | 'prev' = 'next') =>{
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
     // console.error('Pagination fetch error:', error);
    }finally {
      setLoading(false); // End loading
    }
	}
	
 const onDelete = (id: number)=>{
		setPostList(prev => prev.filter(style => style.id !== id));
	}
	
	const selectPost = (postIndex: number, postAttachmentIndex?: number)=>{
		setSelectedPostIndex(postIndex);
		setSelectedPostAttachmentIndex(postAttachmentIndex || null);
	}
	
	
  return (
    <>
      <AdminPostPageHeader />
      <div className="py-10 overflow-auto">
				{
					loading ? 
					(
						<Spinner />
					) : 
					(
						< >
							{
								postList.length === 0
								?
									<div className="text-center col-span-full py-10 text-gray-500">
										No post available at the moment.
									</div>
								:
									<AdminPostList postList={postList} onDelete={onDelete} selectPost={selectPost} />
								 
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
			
			{selectedPostIndex !== null && (
				<PostAttachmentCarousel
					postList={postList}
					postIndex={selectedPostIndex}
					setSelectedPostIndex={setSelectedPostIndex}
					postAttachmentIndex={selectedPostAttachmentIndex}
					setSelectedPostAttachmentIndex={setSelectedPostAttachmentIndex}
				
				/>
			)}
					
    </>
  );
}

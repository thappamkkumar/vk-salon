import PostList from '@/components/posts/PostList';  

import { fetchPosts } from '@/lib/fetch/getPosts';
 

export default async function PostPage() {
 const posts = await fetchPosts(null, 'next');

  return (
		 
			 
			<main className="pt-20"> 
				<PostList initialPostData={posts} />
			</main>
		
  );
}

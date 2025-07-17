// src/components/admin/adminPosts/AdminPostListWrapper.tsx

import { fetchPosts } from '@/lib/fetch/getPosts';
import AdminPostListClient from './AdminPostListClient';

export default async function AdminPostListWrapper() {
  const posts = await fetchPosts(null, 'next');

  return <AdminPostListClient initialPostData={posts} />;
}

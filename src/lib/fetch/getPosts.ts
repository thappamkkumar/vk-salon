// lib/posts.ts

import { PostResponse } from '@/types/posts';

export const fetchPosts = async (
  cursor: number | null = null,
  direction: 'next' | 'prev' = 'next'
): Promise<PostResponse> => {

  const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/posts`);
  if (cursor !== null) url.searchParams.set('cursor', cursor.toString());
  url.searchParams.set('direction', direction);

  const res = await fetch(url.toString(), {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }

  return await res.json();
};

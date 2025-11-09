export type Attachment = {
  fileName: string;
  type: 'image' | 'video';
  thumbnail?: string;  
  created_at?: string;  
};


export type Post = {
  id: number; 
  attachment: Attachment[];
  created_at?: string; 
};

export type PostResponse = {
  posts: Post[];
  nextCursor: number | null;
  prevCursor: number | null;
  hasNext: boolean;
  hasPrev: boolean;
};

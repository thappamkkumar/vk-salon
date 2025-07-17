export type Attachment = {
  filename: string;
  type: 'image' | 'video';
  thumbnail?: string;  
  created_at?: string;  
};


export type Post = {
  id: number; 
  attachment: Attachment[];
  
};

export type PostResponse = {
  posts: Post[];
  nextCursor: number | null;
  prevCursor: number | null;
  hasNext: boolean;
  hasPrev: boolean;
};

export type Review = {
  id: number;
  name: string;
  image: string;
  address: string;
  rating: number; // 1 to 5
  message: string;
	create_at?:string;
};

export type ReviewResponse =s {
  Review: Review[];
  nextCursor: number | null;
  prevCursor: number | null;
  hasNext: boolean;
  hasPrev: boolean;
};

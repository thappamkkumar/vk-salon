export type Style = {
	id: number;
	image: string[];
	 created_at?: string;  
};


export type StyleResponse = {
  styles: Style[];
  nextCursor: number | null;
  prevCursor: number | null;
  hasNext: boolean;
  hasPrev: boolean;
};

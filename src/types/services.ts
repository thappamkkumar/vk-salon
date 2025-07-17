export type Service = {
  id: number;
  title: string; 
  price: string;
  image: string;
	created_at?: string;  
};

export type ServiceResponse = {
  service: Service[];
  nextCursor: number | null;
  prevCursor: number | null;
  hasNext: boolean;
  hasPrev: boolean;
};

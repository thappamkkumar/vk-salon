export type Barber = {
  id: string;
  name: string;
  contact: string;
  experience: number;
  image: string;
  created_at?: string;
};


export type BarberResponse = {
  barbers: Barber[];
  nextCursor: number | null;
  prevCursor: number | null;
  hasNext: boolean;
  hasPrev: boolean;
};


 

export type Appointment = {
  fullName: string;
  phoneNumber: string;
  styleId: number;
  message: string;
	created_at?: string;
};


export type AppointmentResponse = {
  appointment: Appointment[];
  nextCursor: number | null;
  prevCursor: number | null;
  hasNext: boolean;
  hasPrev: boolean;
};

export type UserRole = 'admin' | 'partner';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isAvailable?: boolean;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt?: string;
  updatedAt?: string;
}

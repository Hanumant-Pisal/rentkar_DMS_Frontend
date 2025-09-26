export interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "partner";
    avatar?: string;
  }
  export interface Order {
    _id: string;
    orderNumber: string;
    customerName: string;
    customerPhone?: string;
    pickupAddress: string;
    deliveryAddress: string;
    pickupLocation: { type: "Point"; coordinates: [number, number] };
    deliveryLocation: { type: "Point"; coordinates: [number, number] };
    items: { name: string; qty: number }[];
    status: "pending" | "confirmed" | "assigned" | "picked_up" | "in_transit" | "delivered" | "cancelled";
    assignedTo?: User;
    createdAt: string | Date;
    updatedAt?: string | Date;
  }
  export interface Partner {
    _id: string;
    id: string;
    name: string;
    email: string;
    phone?: string;
    vehicleNumber?: string;
    isAvailable: boolean;
    role?: string;
    status?: string;
    location?: { 
      type: "Point"; 
      coordinates: [number, number];
      address?: string;
    };
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }
  